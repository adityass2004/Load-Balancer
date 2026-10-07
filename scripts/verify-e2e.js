require('dotenv').config();
const http = require('http');
const https = require('https');
const Redis = require('ioredis');
const { execSync } = require('child_process');
const { PrismaClient } = require('../src/generated/prisma/index.js');
const { PrismaPg } = require('@prisma/adapter-pg');

const connectionString = process.env.DATABASE_URL;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });
const redis = new Redis('redis://localhost:6379');

function makeRequest(urlStr, options = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(urlStr);
    const method = options.method || 'GET';
    const headers = { ...options.headers };
    const body = options.body;
    if (body) {
      headers['content-length'] = String(Buffer.byteLength(body));
    }

    const req = http.request(
      url,
      {
        method,
        headers,
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: data,
          });
        });
      }
    );

    req.on('error', reject);
    if (body) {
      req.write(body);
    }
    req.end();
  });
}

async function runVerification() {
  console.log('=== STARTING CRITICAL-03 END-TO-END VERIFICATION ===\n');

  // --- STEP 1: Verify Backends & Project Seeding ---
  console.log('[STEP 1] Checking test backends (4001, 4002, 4003)...');
  const h1 = await makeRequest('http://localhost:4001/health');
  const h2 = await makeRequest('http://localhost:4002/health');
  const h3 = await makeRequest('http://localhost:4003/health');
  console.log('Backend 1:', h1.status, h1.body);
  console.log('Backend 2:', h2.status, h2.body);
  console.log('Backend 3:', h3.status, h3.body);

  // --- STEP 3: Single-Instance 50 Request Burst (20 allowed, 30 rejected) ---
  console.log('\n[STEP 3] Resetting counters and flushing Redis test keys...');
  await makeRequest('http://localhost:4001/test/reset', { method: 'POST' });
  await makeRequest('http://localhost:4002/test/reset', { method: 'POST' });
  await makeRequest('http://localhost:4003/test/reset', { method: 'POST' });
  await redis.flushall();

  const initialLogCount = await prisma.requestLog.count();
  console.log(`Initial rows in request_logs: ${initialLogCount}`);

  console.log('Sending 50 requests through TrackIt (http://localhost:3000/api/test-project/test)...');
  const testIp = '203.0.113.101';
  const responses = [];

  for (let i = 0; i < 50; i++) {
    const res = await makeRequest('http://localhost:3000/api/test-project/test', {
      headers: {
        'x-forwarded-for': testIp,
        'x-request-id': `req-burst-${i + 1}`,
      },
    });
    responses.push(res);
  }

  const count200 = responses.filter((r) => r.status === 200).length;
  const count429 = responses.filter((r) => r.status === 429).length;
  const retryAfterPresent = responses
    .filter((r) => r.status === 429)
    .every((r) => r.headers['retry-after'] && r.headers['x-ratelimit-limit']);

  console.log(`Results: ${count200} x 200 OK, ${count429} x 429 Too Many Requests`);
  console.log(`All 429s have Retry-After and rate limit headers: ${retryAfterPresent}`);

  // Backend stats check
  const s1 = JSON.parse((await makeRequest('http://localhost:4001/test/stats')).body);
  const s2 = JSON.parse((await makeRequest('http://localhost:4002/test/stats')).body);
  const s3 = JSON.parse((await makeRequest('http://localhost:4003/test/stats')).body);
  const backendSum = s1.total + s2.total + s3.total;

  console.log(`Backend counts: server-1=${s1.total}, server-2=${s2.total}, server-3=${s3.total}`);
  console.log(`SUM of backend requests: ${backendSum} (Expected: exactly 20)`);

  // --- STEP 4: Request Logs check ---
  console.log('\n[STEP 4] Verifying request_logs rows...');
  const finalLogCount = await prisma.requestLog.count();
  const logsCreated = finalLogCount - initialLogCount;
  console.log(`New request_logs rows created: ${logsCreated} (Expected: exactly 20 for allowed requests, 0 for 429s)`);

  // --- STEP 5: Multi-Instance Distributed Rate Limiting ---
  console.log('\n[STEP 5] Testing multi-instance rate limiting across port 3000 and 3001...');
  await makeRequest('http://localhost:4001/test/reset', { method: 'POST' });
  await makeRequest('http://localhost:4002/test/reset', { method: 'POST' });
  await makeRequest('http://localhost:4003/test/reset', { method: 'POST' });
  await redis.flushall();

  const multiIp = '203.0.113.102';
  const multiResponses = [];

  for (let i = 0; i < 50; i++) {
    const port = i % 2 === 0 ? 3000 : 3001;
    const res = await makeRequest(`http://localhost:${port}/api/test-project/test`, {
      headers: {
        'x-forwarded-for': multiIp,
        'x-request-id': `multi-${i + 1}`,
      },
    });
    multiResponses.push({ port, status: res.status });
  }

  const multi200 = multiResponses.filter((r) => r.status === 200).length;
  const multi429 = multiResponses.filter((r) => r.status === 429).length;
  console.log(`Distributed results: ${multi200} x 200 OK, ${multi429} x 429 Too Many Requests`);

  const ms1 = JSON.parse((await makeRequest('http://localhost:4001/test/stats')).body);
  const ms2 = JSON.parse((await makeRequest('http://localhost:4002/test/stats')).body);
  const ms3 = JSON.parse((await makeRequest('http://localhost:4003/test/stats')).body);
  const multiBackendSum = ms1.total + ms2.total + ms3.total;
  console.log(`Distributed backend sum: ${multiBackendSum} (Expected: exactly 20 combined)`);

  // --- STEP 6: Unauthenticated Flood of /api/admin/projects ---
  console.log('\n[STEP 6] Testing unauthenticated flood of /api/admin/projects (limit=60)...');
  const adminIp = '203.0.113.103';
  const adminStatuses = [];

  for (let i = 0; i < 70; i++) {
    const res = await makeRequest('http://localhost:3000/api/admin/projects', {
      headers: {
        'x-forwarded-for': adminIp,
        // Send session token cookie so request bypasses edge middleware cookie existence check and reaches route handler
        cookie: 'authjs.session-token=dummy-unauthenticated-token',
        'x-request-id': `admin-flood-${i + 1}`,
      },
    });
    adminStatuses.push(res.status);
  }

  const admin401or403 = adminStatuses.filter((s) => s === 401 || s === 403).length;
  const admin429 = adminStatuses.filter((s) => s === 429).length;
  console.log(`Admin flood: ${admin401or403} x 401/403, ${admin429} x 429 (Expected: 60 x 401/403, 10 x 429)`);

  // --- STEP 7: Redis Fail-Open / Fail-Closed Behavior ---
  console.log('\n[STEP 7] Testing Redis outage behavior (stopping Redis)...');
  try {
    execSync('docker pause test-redis');
    console.log('Redis paused.');

    // Wait 200ms
    await new Promise((r) => setTimeout(r, 200));

    // Proxy request (fail-open)
    const proxyDegraded = await makeRequest('http://localhost:3000/api/test-project/test', {
      headers: { 'x-forwarded-for': '203.0.113.104' },
    });
    console.log(`Proxy response during Redis outage: status=${proxyDegraded.status} (Expected: 200 via fail-open fallback)`);

    // Admin request (fail-closed)
    const adminClosed = await makeRequest('http://localhost:3000/api/admin/projects', {
      headers: {
        'x-forwarded-for': '203.0.113.104',
        cookie: 'authjs.session-token=dummy-token',
      },
    });
    console.log(
      `Admin response during Redis outage: status=${adminClosed.status}, retry-after=${adminClosed.headers['retry-after']} (Expected: 503 with Retry-After: 5)`
    );
  } finally {
    execSync('docker unpause test-redis');
    console.log('Redis unpaused.');
  }

  // Confirm recovery after Redis restart
  await new Promise((r) => setTimeout(r, 500));
  const recoveredProxy = await makeRequest('http://localhost:3000/api/test-project/test', {
    headers: { 'x-forwarded-for': '203.0.113.105' },
  });
  console.log(`Proxy response after Redis recovered: status=${recoveredProxy.status} (Expected: 200)`);

  // --- STEP 8: Large Request Body While Rate Limited ---
  console.log('\n[STEP 8] Testing large request body while rate limited...');
  // Exhaust limit for this IP
  const largeTestIp = '203.0.113.106';
  for (let i = 0; i < 20; i++) {
    await makeRequest('http://localhost:3000/api/test-project/test', {
      headers: { 'x-forwarded-for': largeTestIp },
    });
  }

  // Now send 10 MB payload while rate limited
  const largeBody = 'X'.repeat(10 * 1024 * 1024); // 10 MB
  const tStart = Date.now();
  const largeRes = await makeRequest('http://localhost:3000/api/test-project/test', {
    method: 'POST',
    headers: {
      'x-forwarded-for': largeTestIp,
      'content-type': 'application/octet-stream',
      'content-length': String(largeBody.length),
    },
    body: largeBody,
  });
  const tDuration = Date.now() - tStart;
  console.log(`Large body request: status=${largeRes.status}, duration=${tDuration}ms (Expected: 429 rejected immediately before buffering)`);

  // --- STEP 9: CRITICAL-02 Regression Check ---
  console.log('\n[STEP 9] Regression check for CRITICAL-02 (GET retried on 503, POST not replayed)...');
  await makeRequest('http://localhost:4001/test/reset', { method: 'POST' });
  await makeRequest('http://localhost:4002/test/reset', { method: 'POST' });
  await makeRequest('http://localhost:4003/test/reset', { method: 'POST' });

  // Refresh cache
  await makeRequest('http://localhost:3000/api/health');

  // Send GET request to /test/status/503 (Idempotent: retried across servers)
  const getRes = await makeRequest('http://localhost:3000/api/test-project/test/status/503', {
    headers: { 'x-forwarded-for': '203.0.113.107' },
  });
  console.log(`GET through proxy to /test/status/503: status=${getRes.status}`);

  const getStats1 = JSON.parse((await makeRequest('http://localhost:4001/test/stats')).body);
  const getStats2 = JSON.parse((await makeRequest('http://localhost:4002/test/stats')).body);
  const getStats3 = JSON.parse((await makeRequest('http://localhost:4003/test/stats')).body);
  const totalGetAttempts = getStats1.total + getStats2.total + getStats3.total;
  console.log(`GET failover attempts across all backends: ${totalGetAttempts} (Retried across backends)`);

  // Reset counters before POST test
  await makeRequest('http://localhost:4001/test/reset', { method: 'POST' });
  await makeRequest('http://localhost:4002/test/reset', { method: 'POST' });
  await makeRequest('http://localhost:4003/test/reset', { method: 'POST' });

  // Send POST request to /test/status/503 (Non-idempotent: NEVER retried)
  const postRes = await makeRequest('http://localhost:3000/api/test-project/test/status/503', {
    method: 'POST',
    headers: {
      'x-forwarded-for': '203.0.113.108',
      'content-type': 'application/json',
    },
    body: JSON.stringify({ item: 'order-123' }),
  });
  console.log(`POST through proxy to /test/status/503: status=${postRes.status} (Expected: 503 returned immediately)`);

  const postStats1 = JSON.parse((await makeRequest('http://localhost:4001/test/stats')).body);
  const postStats2 = JSON.parse((await makeRequest('http://localhost:4002/test/stats')).body);
  const postStats3 = JSON.parse((await makeRequest('http://localhost:4003/test/stats')).body);
  console.log(`POST backend counts: server-1=${postStats1.total}, server-2=${postStats2.total}, server-3=${postStats3.total}`);
  const totalPostAttempts = postStats1.total + postStats2.total + postStats3.total;
  console.log(`Total POST attempts across all backends: ${totalPostAttempts} (Expected: exactly 1 attempt, 0 retries!)`);

  console.log('\n=== ALL END-TO-END VERIFICATION STEPS COMPLETE ===');
}

runVerification()
  .catch((err) => {
    console.error('VERIFICATION ERROR:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await redis.quit();
  });
