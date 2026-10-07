import 'dotenv/config';
import http from 'http';
import { PrismaClient } from '../src/generated/prisma/index.js';
import { PrismaPg } from '@prisma/adapter-pg';
import { createServerSchema, updateServerSchema } from '../lib/validations';
import { resetSsrfConfigForTesting } from '../lib/security/ssrf-guard';
import { RequestForwarder } from '../services/load-balancer/RequestForwarder';
import { healthChecker } from '../services/health/HealthChecker';
import { Server, ServerHealth } from '../types/domain';

const connectionString = process.env.DATABASE_URL;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function runLiveChecks() {
  console.log('==================================================================');
  console.log('CRITICAL-05 LIVE VERIFICATION CHECKS');
  console.log('==================================================================\n');

  // ── CHECK 1: BACKEND_ALLOW_LOOPBACK unset vs set ───────────────────────────
  console.log('[CHECK 1] BACKEND_ALLOW_LOOPBACK unset vs set for http://127.0.0.1:4001:');
  delete process.env.BACKEND_ALLOW_LOOPBACK;
  (process.env as any).NODE_ENV = 'development';
  resetSsrfConfigForTesting();

  const c1Unset = await createServerSchema.safeParseAsync({
    url: 'http://127.0.0.1:4001',
    name: 'Loopback Test',
    weight: 1,
    priority: 0,
    enabled: false,
  });
  console.log('  Unset BACKEND_ALLOW_LOOPBACK -> success:', c1Unset.success);
  if (!c1Unset.success) {
    console.log('  Rejection message:', c1Unset.error.issues[0].message);
  }

  process.env.BACKEND_ALLOW_LOOPBACK = 'true';
  resetSsrfConfigForTesting();

  const c1Set = await createServerSchema.safeParseAsync({
    url: 'http://127.0.0.1:4001',
    name: 'Loopback Test',
    weight: 1,
    priority: 0,
    enabled: false,
  });
  console.log('  Set BACKEND_ALLOW_LOOPBACK=true (dev) -> success:', c1Set.success);

  // ── CHECK 2: Always-blocked metadata IPs even with BACKEND_ALLOW_LOOPBACK=true
  console.log('\n[CHECK 2] Metadata endpoints with BACKEND_ALLOW_LOOPBACK=true:');
  const c2Imds = await createServerSchema.safeParseAsync({
    url: 'http://169.254.169.254/',
    name: 'AWS IMDS',
    weight: 1,
    priority: 0,
    enabled: false,
  });
  console.log('  http://169.254.169.254/ -> success:', c2Imds.success, c2Imds.success ? '' : c2Imds.error.issues[0].message);

  const c2Gcp = await createServerSchema.safeParseAsync({
    url: 'http://metadata.google.internal/',
    name: 'GCP Metadata',
    weight: 1,
    priority: 0,
    enabled: false,
  });
  console.log('  http://metadata.google.internal/ -> success:', c2Gcp.success, c2Gcp.success ? '' : c2Gcp.error.issues[0].message);

  // ── CHECK 4: Server UPDATE path with blocked address ───────────────────────
  console.log('\n[CHECK 4] Server UPDATE path:');
  delete process.env.BACKEND_ALLOW_LOOPBACK;
  resetSsrfConfigForTesting();

  const c4Update = await updateServerSchema.safeParseAsync({
    url: 'http://169.254.169.254/latest/meta-data',
  });
  console.log('  Update to http://169.254.169.254/... -> success:', c4Update.success, c4Update.success ? '' : c4Update.error.issues[0].message);

  // ── CHECK 5: Direct DB bypass + Proxy request 502 with NO outbound connection
  console.log('\n[CHECK 5] Direct DB bypass + Connect-time proxy enforcement:');
  // Set up a canary listener on port 59999 to verify zero connections arrive
  let canaryReceivedConnection = false;
  const canaryServer = http.createServer((req, res) => {
    canaryReceivedConnection = true;
    res.end('CANARY_REACHED');
  });
  await new Promise<void>((resolve) => canaryServer.listen(59999, '127.0.0.1', () => resolve()));

  // Test server pointing directly to local canary or private IP
  const fakeServer: Server = {
    id: 'canary-ssrf-test',
    projectId: 'test-project',
    name: 'Canary SSRF Test',
    url: 'http://127.0.0.1:59999',
    weight: 1,
    priority: 0,
    enabled: true,
    healthy: ServerHealth.HEALTHY,
    failureCount: 0,
    requestsHandled: 0,
    activeRequests: 0,
    averageResponseTime: 0,
    lastHealthCheck: new Date(),
    deletedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const forwarder = new RequestForwarder();
  const dummyReq = new Request('http://localhost:3000/api/test-project/test');

  let proxyError: any = null;
  try {
    await forwarder.forward(fakeServer, dummyReq, 2000, '/test');
  } catch (err: any) {
    proxyError = err;
  }

  canaryServer.close();
  console.log('  Proxy forward call threw error:', proxyError?.message);
  console.log('  Error code:', proxyError?.code, '| isSsrfBlocked:', proxyError?.isSsrfBlocked);
  console.log('  Outbound canary connection received:', canaryReceivedConnection);

  // ── CHECK 6: Redirect to metadata IP blocked at connect time ───────────────
  console.log('\n[CHECK 6] HTTP 302 Redirect to http://169.254.169.254/:');
  // Backend on 4001 has GET /test/redirect?to=http://169.254.169.254/
  process.env.BACKEND_ALLOW_LOOPBACK = 'true';
  resetSsrfConfigForTesting();

  const redirectServer: Server = {
    id: 'redirect-test',
    projectId: 'test-project',
    name: 'Redirect Test',
    url: 'http://127.0.0.1:4001',
    weight: 1,
    priority: 0,
    enabled: true,
    healthy: ServerHealth.HEALTHY,
    failureCount: 0,
    requestsHandled: 0,
    activeRequests: 0,
    averageResponseTime: 0,
    lastHealthCheck: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };

  let redirectError: any = null;
  try {
    await forwarder.forward(redirectServer, dummyReq, 5000, '/test/redirect?to=http://169.254.169.254/');
  } catch (err: any) {
    redirectError = err;
  }
  console.log('  Redirect forward result error:', redirectError?.message);
  console.log('  Error code:', redirectError?.code, '| isSsrfBlocked:', redirectError?.isSsrfBlocked);

  // ── CHECK 7: Health checker probes blocked with stored bad URL ─────────────
  console.log('\n[CHECK 7] Health checker with stored bad URL:');
  delete process.env.BACKEND_ALLOW_LOOPBACK;
  resetSsrfConfigForTesting();

  const badHealthServer = {
    id: 'bad-health-test-id-1234',
    name: 'Bad Stored Server',
    url: 'http://127.0.0.1:4001',
  };

  const healthResult = await healthChecker.check(badHealthServer, 5000);
  console.log('  Health check success:', healthResult.success);
  console.log('  Health check error message:', healthResult.error);
  console.log('  Outcome:', healthResult.outcome);

  console.log('\n==================================================================');
  console.log('ALL LIVE CHECKS COMPLETED SUCCESSFULLY');
  console.log('==================================================================\n');
}

runLiveChecks()
  .catch((e) => {
    console.error('LIVE CHECKS FAILED:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
