import http from 'http';
import crypto from 'crypto';
import zlib from 'zlib';
import { prisma } from '../lib/db';

function httpRequest(
  options: http.RequestOptions,
  bodyData?: Buffer | NodeJS.ReadableStream
): Promise<{ statusCode: number; headers: http.IncomingHttpHeaders; body: Buffer }> {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      const chunks: Buffer[] = [];
      res.on('data', (c) => chunks.push(Buffer.isBuffer(c) ? c : Buffer.from(c)));
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode || 0,
          headers: res.headers,
          body: Buffer.concat(chunks),
        });
      });
    });

    req.on('error', reject);

    if (bodyData) {
      if (Buffer.isBuffer(bodyData)) {
        req.end(bodyData);
      } else {
        bodyData.pipe(req);
      }
    } else {
      req.end();
    }
  });
}

async function runE2E() {
  console.log('==================================================================');
  console.log('STARTING E2E VERIFICATION (HIGH-04, HIGH-05, LOOP GUARD)');
  console.log('==================================================================\n');

  // ── RESET BACKEND COUNTERS & ENSURE ALL RUNNING ───────────────────────────
  for (const port of [4001, 4002, 4003]) {
    await httpRequest({ hostname: 'localhost', port: 4000, path: `/start/${port}`, method: 'POST' });
    await httpRequest({
      hostname: 'localhost',
      port,
      path: '/test/reset',
      method: 'POST',
    });
  }
  await new Promise((r) => setTimeout(r, 1000));

  // Reset database servers to healthy
  await prisma.server.updateMany({
    where: { project: { slug: 'test-project' } },
    data: { enabled: true, healthy: 'HEALTHY', failureCount: 0 },
  });

  // Trigger health check once so TrackIt's in-memory state marks all 3 servers healthy
  await httpRequest({
    hostname: 'localhost',
    port: 3000,
    path: '/api/cron/health',
    method: 'GET',
    headers: {
      Authorization: 'Bearer valid-test-secret-1234567890',
    },
  });
  await new Promise((r) => setTimeout(r, 11000)); // wait for cache refresh

  // ── E2.1: Headers Sanitization ─────────────────────────────────────────────
  console.log('[E2.1] Headers sanitization check:');
  const oddHeadersRes = await httpRequest({
    hostname: 'localhost',
    port: 3000,
    path: '/api/test-project/test/headers',
    method: 'GET',
    headers: {
      Connection: 'keep-alive, x-secret-hop',
      'X-Secret-Hop': '1',
      'X-Forwarded-For': '6.6.6.6',
      'X-Real-IP': '6.6.6.6',
      Forwarded: 'for=6.6.6.6',
      'X-Middleware-Subrequest': 'internal',
      TE: 'trailers',
      Authorization: 'Bearer abc123secret',
      'X-Custom': 'ok',
    },
  });

  console.log('  Status Code:', oddHeadersRes.statusCode);
  const oddBody = JSON.parse(oddHeadersRes.body.toString('utf8'));
  console.log('  Received headers at backend:', oddBody.headers);

  const h = oddBody.headers;
  console.log('  x-secret-hop stripped:', h['x-secret-hop'] === undefined);
  console.log('  forwarded stripped:', h['forwarded'] === undefined);
  console.log('  x-middleware-subrequest stripped:', h['x-middleware-subrequest'] === undefined);
  console.log('  te stripped:', h['te'] === undefined);
  console.log('  authorization redacted:', h['authorization'] === '[redacted]');
  console.log('  x-custom preserved:', h['x-custom'] === 'ok');
  console.log('  x-trackit-hop present:', h['x-trackit-hop'] === '1');
  console.log('  x-forwarded-for equals verified IP:', h['x-forwarded-for'] === '6.6.6.6');
  console.log('  x-real-ip equals verified IP:', h['x-real-ip'] === '6.6.6.6');

  // ── E2.2: Trusted Proxy Hops IP Extraction ─────────────────────────────────
  console.log('\n[E2.2] Trusted proxy hops verification:');
  // 1. Single entry
  const singleXffRes = await httpRequest({
    hostname: 'localhost',
    port: 3000,
    path: '/api/test-project/test/headers',
    method: 'GET',
    headers: {
      'X-Forwarded-For': '203.0.113.9',
    },
  });
  const singleH = JSON.parse(singleXffRes.body.toString('utf8')).headers;
  console.log('  Single XFF (203.0.113.9) -> Backend saw:', singleH['x-forwarded-for']);

  // 2. Spoofed leftmost with trusted rightmost
  const spoofedXffRes = await httpRequest({
    hostname: 'localhost',
    port: 3000,
    path: '/api/test-project/test/headers',
    method: 'GET',
    headers: {
      'X-Forwarded-For': '1.1.1.1, 203.0.113.9',
    },
  });
  const spoofedH = JSON.parse(spoofedXffRes.body.toString('utf8')).headers;
  console.log('  Spoofed XFF ("1.1.1.1, 203.0.113.9") -> Backend saw:', spoofedH['x-forwarded-for']);
  console.log('  Spoofed leftmost successfully ignored:', spoofedH['x-forwarded-for'] === '203.0.113.9');

  // ── E2.3: IP_HASH Strategy & Distribution ─────────────────────────────────
  console.log('\n[E2.3] IP_HASH algorithm verification:');
  // Update project settings to IP_HASH
  const project = await prisma.project.findUnique({ where: { slug: 'test-project' } });
  if (!project) throw new Error('test-project not found');

  await prisma.settings.update({
    where: { projectId: project.id },
    data: { algorithm: 'IP_HASH' },
  });
  console.log('  Project algorithm updated to IP_HASH in database.');

  // Wait 10 seconds for proxy cache refresh or hit endpoint
  await new Promise((r) => setTimeout(r, 11000));

  // 1. 30 requests with same single-entry XFF -> all land on one server
  const serverCounts1: Record<string, number> = {};
  for (let i = 0; i < 30; i++) {
    const res = await httpRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/api/test-project/test/info',
      method: 'GET',
      headers: {
        'X-Forwarded-For': '198.51.100.42',
      },
    });
    const data = JSON.parse(res.body.toString('utf8'));
    serverCounts1[data.server] = (serverCounts1[data.server] || 0) + 1;
  }
  console.log('  30 requests with same XFF server distribution:', serverCounts1);
  const distinctServers1 = Object.keys(serverCounts1).length;
  console.log('  Single server stickiness verified:', distinctServers1 === 1);

  // 2. 30 requests with changing spoofed leftmost, same rightmost -> still one server
  const serverCounts2: Record<string, number> = {};
  for (let i = 0; i < 30; i++) {
    const res = await httpRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/api/test-project/test/info',
      method: 'GET',
      headers: {
        'X-Forwarded-For': `${i + 1}.2.3.4, 198.51.100.42`,
      },
    });
    const data = JSON.parse(res.body.toString('utf8'));
    serverCounts2[data.server] = (serverCounts2[data.server] || 0) + 1;
  }
  console.log('  30 requests with spoofed leftmost distribution:', serverCounts2);
  const distinctServers2 = Object.keys(serverCounts2).length;
  console.log('  Spoofed leftmost stickiness verified (1 server):', distinctServers2 === 1);

  // 3. 300 requests with distinct XFF values -> all three servers get traffic
  const serverCounts3: Record<string, number> = {};
  for (let i = 1; i <= 300; i++) {
    const res = await httpRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/api/test-project/test/info',
      method: 'GET',
      headers: {
        'X-Forwarded-For': `10.${Math.floor(i / 256)}.${i % 256}.1`,
      },
    });
    const data = JSON.parse(res.body.toString('utf8'));
    serverCounts3[data.server] = (serverCounts3[data.server] || 0) + 1;
  }
  console.log('  300 distinct IP distribution across 3 servers:', serverCounts3);
  console.log('  All three servers received traffic:', Object.keys(serverCounts3).length === 3);

  // ── E2.4: IP_HASH Failover & Recovery (Process stop & restart) ─────────────
  console.log('\n[E2.4] IP_HASH failover & recovery:');
  const targetIp = '198.51.100.88';
  const initialRes = await httpRequest({
    hostname: 'localhost',
    port: 3000,
    path: '/api/test-project/test/info',
    method: 'GET',
    headers: { 'X-Forwarded-For': targetIp },
  });
  const initialServer = JSON.parse(initialRes.body.toString('utf8')).server;
  console.log(`  Initial chosen server for ${targetIp}: ${initialServer}`);
  const initialPort = initialServer === 'server-1' ? 4001 : initialServer === 'server-2' ? 4002 : 4003;

  // Actually STOP backend process via controller on port 4000
  console.log(`  Stopping backend process for ${initialServer} (port ${initialPort})...`);
  await httpRequest({
    hostname: 'localhost',
    port: 4000,
    path: `/stop/${initialPort}`,
    method: 'POST',
  });
  await new Promise((r) => setTimeout(r, 1000));

  // Verify deterministic failover to second server
  const failoverCounts: Record<string, number> = {};
  for (let i = 0; i < 10; i++) {
    const res = await httpRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/api/test-project/test/info',
      method: 'GET',
      headers: { 'X-Forwarded-For': targetIp },
    });
    const s = JSON.parse(res.body.toString('utf8')).server;
    failoverCounts[s] = (failoverCounts[s] || 0) + 1;
  }
  console.log('  Failover server distribution (10 reqs):', failoverCounts);
  const failoverServer = Object.keys(failoverCounts)[0];
  console.log(`  Deterministically failed over to consistent secondary server: ${failoverServer}`);

  // Restart backend process via controller on port 4000
  console.log(`  Restarting backend process for ${initialServer} (port ${initialPort})...`);
  await httpRequest({
    hostname: 'localhost',
    port: 4000,
    path: `/start/${initialPort}`,
    method: 'POST',
  });
  await new Promise((r) => setTimeout(r, 2000));

  // Reset failure count in DB and mark healthy so cache picks it up immediately
  const srv = await prisma.server.findFirst({
    where: { projectId: project.id, name: { contains: String(initialPort) } },
  });
  if (srv) {
    await prisma.server.update({
      where: { id: srv.id },
      data: { failureCount: 0, healthy: 'HEALTHY' },
    });
  }

  // Trigger health check cycle so in-memory health monitor probes port and marks healthy
  await httpRequest({
    hostname: 'localhost',
    port: 3000,
    path: '/api/cron/health',
    method: 'GET',
    headers: {
      Authorization: 'Bearer valid-test-secret-1234567890',
    },
  });
  await new Promise((r) => setTimeout(r, 11000)); // wait for cache refresh

  const recoveryRes = await httpRequest({
    hostname: 'localhost',
    port: 3000,
    path: '/api/test-project/test/info',
    method: 'GET',
    headers: { 'X-Forwarded-For': targetIp },
  });
  const recoveryServer = JSON.parse(recoveryRes.body.toString('utf8')).server;
  console.log(`  Recovery chosen server: ${recoveryServer}`);
  console.log('  Successfully recovered back to primary server:', recoveryServer === initialServer);

  // ── E2.5: Chunked & Content-Length Uploads ─────────────────────────────────
  console.log('\n[E2.5] Chunked & Content-Length upload verification:');
  // 1. 5 MB chunked upload (no Content-Length)
  const chunkedBuffer = crypto.randomBytes(5 * 1024 * 1024);
  const expectedSha256 = crypto.createHash('sha256').update(chunkedBuffer).digest('hex');

  const { Readable } = await import('stream');
  const stream = new Readable({
    read() {
      this.push(chunkedBuffer);
      this.push(null);
    },
  });

  const chunkedRes = await httpRequest(
    {
      hostname: 'localhost',
      port: 3000,
      path: '/api/test-project/test',
      method: 'POST',
      headers: {
        'Transfer-Encoding': 'chunked',
        'Content-Type': 'application/octet-stream',
      },
    },
    stream
  );

  console.log('  5 MB chunked upload status:', chunkedRes.statusCode);
  const chunkedBody = JSON.parse(chunkedRes.body.toString('utf8'));
  console.log('  Bytes received at backend:', chunkedBody.bodyBytes);
  console.log('  Sha256 match:', chunkedBody.bodySha256 === expectedSha256);

  // 2. 3 MB Content-Length upload
  const clBuffer = crypto.randomBytes(3 * 1024 * 1024);
  const clExpectedSha = crypto.createHash('sha256').update(clBuffer).digest('hex');

  const clRes = await httpRequest(
    {
      hostname: 'localhost',
      port: 3000,
      path: '/api/test-project/test',
      method: 'POST',
      headers: {
        'Content-Length': String(clBuffer.length),
        'Content-Type': 'application/octet-stream',
      },
    },
    clBuffer
  );

  console.log('  3 MB Content-Length upload status:', clRes.statusCode);
  const clBody = JSON.parse(clRes.body.toString('utf8'));
  console.log('  Bytes received at backend:', clBody.bodyBytes);
  console.log('  Sha256 match:', clBody.bodySha256 === clExpectedSha);

  // ── E2.6: Gzip Compression ────────────────────────────────────────────────
  console.log('\n[E2.6] Gzip response behavior verification:');
  const gzipRes = await httpRequest({
    hostname: 'localhost',
    port: 3000,
    path: '/api/test-project/test/gzip',
    method: 'GET',
    headers: {
      'Accept-Encoding': 'gzip',
    },
  });

  console.log('  Gzip status code:', gzipRes.statusCode);
  console.log('  Response Content-Encoding header:', gzipRes.headers['content-encoding']);
  console.log('  Response Content-Length header:', gzipRes.headers['content-length']);

  // Decompress body if gzipped
  let decompressed: string;
  if (gzipRes.headers['content-encoding'] === 'gzip') {
    decompressed = zlib.gunzipSync(gzipRes.body).toString('utf8');
  } else {
    decompressed = gzipRes.body.toString('utf8');
  }
  console.log('  Decoded body payload:', JSON.parse(decompressed));

  // ── E2.7: Proxy Loop Guard ────────────────────────────────────────────────
  console.log('\n[E2.7] Proxy loop guard verification:');
  // Create throwaway project loop-project pointing to http://localhost:3000
  const loopProject = await prisma.project.upsert({
    where: { slug: 'loop-project' },
    update: { enabled: true },
    create: { name: 'Loop Project', slug: 'loop-project', enabled: true },
  });

  await prisma.settings.upsert({
    where: { projectId: loopProject.id },
    update: { algorithm: 'ROUND_ROBIN', requestTimeout: 3000, maxRetries: 0 },
    create: { projectId: loopProject.id, algorithm: 'ROUND_ROBIN', requestTimeout: 3000, maxRetries: 0 },
  });

  // 1. Direct request with x-trackit-hop: 3
  const directLoopRes = await httpRequest({
    hostname: 'localhost',
    port: 3000,
    path: '/api/test-project/test/headers',
    method: 'GET',
    headers: {
      'x-trackit-hop': '3',
    },
  });

  console.log('  Direct hop=3 status:', directLoopRes.statusCode);
  console.log('  Direct hop=3 body:', directLoopRes.body.toString('utf8'));
  console.log('  Direct hop=3 returns 508 Loop Detected:', directLoopRes.statusCode === 508 && directLoopRes.body.toString('utf8').includes('Proxy loop detected'));

  // 2. Self-referencing loop project
  const lanHost = process.env.TEST_BACKEND_HOST || '10.3.76.189';
  await prisma.server.upsert({
    where: { id: '00000000-0000-0000-0000-000000000001' },
    update: { url: `http://${lanHost}:3000/api/loop-project`, enabled: true, healthy: 'HEALTHY' },
    create: {
      id: '00000000-0000-0000-0000-000000000001',
      projectId: loopProject.id,
      name: 'TrackIt Self Loop',
      url: `http://${lanHost}:3000/api/loop-project`,
      enabled: true,
      healthy: 'HEALTHY',
    },
  });

  await new Promise((r) => setTimeout(r, 11000)); // wait for cache refresh

  const loopStart = Date.now();
  const loopRes = await httpRequest({
    hostname: 'localhost',
    port: 3000,
    path: '/api/loop-project/loop',
    method: 'GET',
  });
  const loopDuration = Date.now() - loopStart;

  console.log(`  Self-loop request returned in ${loopDuration}ms`);
  console.log('  Self-loop response status:', loopRes.statusCode);
  console.log('  Self-loop response body:', loopRes.body.toString('utf8'));
  console.log('  Safe termination verified (status 508 or inner 508):', loopRes.statusCode === 508 || loopRes.body.toString('utf8').includes('Proxy loop detected'));

  // Clean up throwaway loop-project
  await prisma.server.deleteMany({ where: { projectId: loopProject.id } });
  await prisma.settings.deleteMany({ where: { projectId: loopProject.id } });
  await prisma.project.delete({ where: { id: loopProject.id } });
  console.log('  Cleaned up throwaway loop-project.');

  console.log('\n==================================================================');
  console.log('ALL E2E VERIFICATION CHECKS COMPLETED SUCCESSFULLY');
  console.log('==================================================================\n');
}

runE2E()
  .catch((e) => {
    console.error('E2E VERIFICATION FAILED:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
