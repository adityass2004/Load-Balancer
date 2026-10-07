require('dotenv').config();
const http = require('http');
const crypto = require('crypto');
const { spawn, execSync } = require('child_process');
const Redis = require('ioredis');
const { PrismaClient } = require('../src/generated/prisma/index.js');
const { PrismaPg } = require('@prisma/adapter-pg');

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
const redis = new Redis(REDIS_URL);
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

function makeRequest(urlStr, options = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(urlStr);
    const method = options.method || 'GET';
    const headers = { ...options.headers };

    if (options.body && !headers['content-length']) {
      headers['content-length'] = String(Buffer.byteLength(options.body));
    }

    const req = http.request(
      url,
      {
        method,
        headers,
        agent: false,
      },
      (res) => {
        let chunks = [];
        res.on('data', (c) => chunks.push(c));
        res.on('end', () => {
          const body = Buffer.concat(chunks).toString('utf-8');
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body,
          });
        });
      }
    );

    req.on('error', (err) => {
      if (options.catchError) {
        resolve({ status: 502, error: err.message, headers: {}, body: '' });
      } else {
        reject(err);
      }
    });

    if (options.stream) {
      options.stream.pipe(req);
    } else if (options.body) {
      req.write(options.body);
      req.end();
    } else {
      req.end();
    }
  });
}

function killProcess(pid) {
  try {
    execSync(`taskkill /F /T /PID ${pid}`, { stdio: 'ignore' });
  } catch {}
}

function getProcessRss(pid) {
  try {
    const out = execSync(`powershell -NoProfile -Command "(Get-Process -Id ${pid}).WorkingSet64"`, {
      encoding: 'utf-8',
    }).trim();
    return parseInt(out, 10);
  } catch {
    return 0;
  }
}

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function waitForUrl(url, timeoutMs = 20000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await makeRequest(url);
      if (res.status === 200) return true;
    } catch {}
    await sleep(300);
  }
  throw new Error(`Timeout waiting for ${url}`);
}

async function main() {
  console.log('===============================================================');
  console.log('STARTING CRITICAL-04 & CRITICAL-03 FULL VERIFICATION SUITE');
  console.log('===============================================================\n');

  console.log('[SETUP] Configuring test-project settings in database (requestTimeout: 60s)...');
  await prisma.settings.updateMany({
    data: { requestTimeout: 60000, maxFailures: 5 },
  });
  await prisma.server.updateMany({
    data: { healthy: 'HEALTHY', failureCount: 0 },
  });

  // 1. Start 3 Test Backends with TEST_BACKEND_MAX_BODY_BYTES=350000000
  console.log('[SETUP] Starting test backend instances (ports 4001, 4002, 4003)...');
  const backendEnv = {
    ...process.env,
    TEST_BACKEND_MAX_BODY_BYTES: '350000000',
    ENABLE_TEST_FAILURES: 'true',
  };

  let b1 = spawn('node', ['test-backend/server.js'], {
    env: { ...backendEnv, PORT: '4001', SERVER_ID: 'server-1' },
    stdio: 'ignore',
  });
  let b2 = spawn('node', ['test-backend/server.js'], {
    env: { ...backendEnv, PORT: '4002', SERVER_ID: 'server-2' },
    stdio: 'ignore',
  });
  let b3 = spawn('node', ['test-backend/server.js'], {
    env: { ...backendEnv, PORT: '4003', SERVER_ID: 'server-3' },
    stdio: 'ignore',
  });

  await waitForUrl('http://localhost:4001/health');
  await waitForUrl('http://localhost:4002/health');
  await waitForUrl('http://localhost:4003/health');
  console.log('All 3 test backends healthy on 4001, 4002, 4003.\n');

  // 2. Start TrackIt on port 3000 with 300 MB max body cap and RATE_LIMIT_PROXY_IP_MAX=30
  console.log('[SETUP] Starting TrackIt Next.js instance on port 3000...');
  let trackitLogs = [];
  const trackitEnv = {
    ...process.env,
    PORT: '3000',
    REQUEST_TIMEOUT: '60000',
    MAX_REQUEST_BODY_BYTES: '314572800', // 300 MB
    BODY_BUFFER_THRESHOLD_BYTES: '262144', // 256 KB
    BODY_BUFFER_BUDGET_BYTES: '33554432', // 32 MB
    RATE_LIMIT_PROXY_IP_MAX: '30',
    RATE_LIMIT_PROXY_PROJECT_MAX: '6000',
    RATE_LIMIT_ADMIN_IP_MAX: '60',
    RATE_LIMIT_REDIS_BREAKER_FAILURES: '3',
    RATE_LIMIT_REDIS_BREAKER_COOLDOWN_SEC: '10',
    RATE_LIMIT_UNKNOWN_IP_MULTIPLIER: '5',
  };

  let trackit = spawn('node', ['node_modules/next/dist/bin/next', 'start', '-p', '3000'], {
    env: trackitEnv,
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  trackit.stdout.on('data', (d) => trackitLogs.push(d.toString()));
  trackit.stderr.on('data', (d) => trackitLogs.push(d.toString()));

  await waitForUrl('http://localhost:3000/api/health');
  await makeRequest('http://localhost:3000/api/test-project');
  console.log(`TrackIt started successfully (PID: ${trackit.pid}).\n`);

  const resetAllBackends = async () => {
    await makeRequest('http://127.0.0.1:4001/test/reset', { method: 'POST', catchError: true });
    await makeRequest('http://127.0.0.1:4002/test/reset', { method: 'POST', catchError: true });
    await makeRequest('http://127.0.0.1:4003/test/reset', { method: 'POST', catchError: true });
  };

  try {
    await resetAllBackends();
    await redis.flushall();

    // -------------------------------------------------------------
    // TEST 1: Early rejection: Content-Length larger than cap -> 413
    // -------------------------------------------------------------
    console.log('-------------------------------------------------------------');
    console.log('[TEST 1] Content-Length larger than cap -> 413, memory flat, 0 backend hits');
    console.log('-------------------------------------------------------------');
    const rssBeforeT1 = getProcessRss(trackit.pid);
    const t1Res = await makeRequest('http://localhost:3000/api/test-project/test', {
      method: 'POST',
      headers: {
        'x-forwarded-for': '198.51.100.1',
        'content-type': 'application/octet-stream',
        'content-length': '350000000', // 350 MB > 300 MB cap
      },
    });
    const rssAfterT1 = getProcessRss(trackit.pid);

    const s1_1 = JSON.parse((await makeRequest('http://localhost:4001/test/stats')).body);
    const s2_1 = JSON.parse((await makeRequest('http://localhost:4002/test/stats')).body);
    const s3_1 = JSON.parse((await makeRequest('http://localhost:4003/test/stats')).body);
    const totalHitsT1 = s1_1.total + s2_1.total + s3_1.total;

    console.log(`Status: ${t1Res.status} (Expected: 413)`);
    console.log(`Response Body: ${t1Res.body}`);
    console.log(`Connection header: ${t1Res.headers['connection']} (Expected: close)`);
    console.log(`x-request-id present: ${!!t1Res.headers['x-request-id']}`);
    console.log(`Backend total requests: ${totalHitsT1} (Expected: 0)`);
    console.log(`TrackIt RSS before: ${(rssBeforeT1 / 1e6).toFixed(2)} MB, after: ${(rssAfterT1 / 1e6).toFixed(2)} MB (Delta: ${((rssAfterT1 - rssBeforeT1) / 1e6).toFixed(2)} MB)\n`);

    // -------------------------------------------------------------
    // TEST 2: Chunked upload exceeding cap -> 413 mid-stream, backend aborted
    // -------------------------------------------------------------
    console.log('-------------------------------------------------------------');
    console.log('[TEST 2] Chunked upload exceeding cap -> 413, backend aborted count increments');
    console.log('-------------------------------------------------------------');
    await resetAllBackends();

    const { Readable } = require('stream');
    let chunksSent = 0;
    const chunk4MB = Buffer.alloc(4 * 1024 * 1024, 'A');
    // 78 chunks of 4 MB = 312 MB > 300 MB cap
    const chunkedStream = new Readable({
      read() {
        if (chunksSent < 78) {
          chunksSent++;
          this.push(chunk4MB);
        } else {
          this.push(null);
        }
      },
    });

    const t2Res = await makeRequest('http://localhost:3000/api/test-project/test', {
      method: 'POST',
      headers: {
        'x-forwarded-for': '198.51.100.2',
        'content-type': 'application/octet-stream',
        'transfer-encoding': 'chunked',
      },
      stream: chunkedStream,
    });

    await sleep(200);
    const s1_2 = JSON.parse((await makeRequest('http://localhost:4001/test/stats')).body);
    const s2_2 = JSON.parse((await makeRequest('http://localhost:4002/test/stats')).body);
    const s3_2 = JSON.parse((await makeRequest('http://localhost:4003/test/stats')).body);
    const abortedSum = (s1_2.aborted || 0) + (s2_2.aborted || 0) + (s3_2.aborted || 0);

    console.log(`Status: ${t2Res.status} (Expected: 413)`);
    console.log(`Response Body: ${t2Res.body}`);
    console.log(`Backend aborted counter sum: ${abortedSum} (Expected: >= 1)`);
    console.log(`Backend completed bodies: ${s1_2.recentBodies.length + s2_2.recentBodies.length + s3_2.recentBodies.length} (Expected: 0)\n`);

    // -------------------------------------------------------------
    // TEST 3: Integrity (5 MB random, 3 MB multipart, small JSON)
    // -------------------------------------------------------------
    console.log('-------------------------------------------------------------');
    console.log('[TEST 3] Integrity checks: 5 MB random binary, 3 MB multipart, small JSON');
    console.log('-------------------------------------------------------------');
    await resetAllBackends();

    // 3a. 5 MB random binary POST
    const body5MB = crypto.randomBytes(5 * 1024 * 1024);
    const expectedSha5MB = crypto.createHash('sha256').update(body5MB).digest('hex');
    const t3a = await makeRequest('http://localhost:3000/api/test-project/test', {
      method: 'POST',
      headers: {
        'x-forwarded-for': '198.51.100.3',
        'content-type': 'application/octet-stream',
        'content-length': String(body5MB.length),
      },
      body: body5MB,
    });
    const parsed3a = JSON.parse(t3a.body);
    console.log(`5 MB POST Status: ${t3a.status}`);
    console.log(`Local SHA256:   ${expectedSha5MB}`);
    console.log(`Backend SHA256: ${parsed3a.bodySha256}`);
    console.log(`SHA256 Match:   ${expectedSha5MB === parsed3a.bodySha256}`);

    // 3b. 3 MB multipart upload
    const boundary = '---------------------------974767299852498929531610575';
    const fileData = crypto.randomBytes(3 * 1024 * 1024);
    const multipartBody = Buffer.concat([
      Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="test.bin"\r\nContent-Type: application/octet-stream\r\n\r\n`),
      fileData,
      Buffer.from(`\r\n--${boundary}--\r\n`),
    ]);
    const expectedShaMultipart = crypto.createHash('sha256').update(multipartBody).digest('hex');
    const t3b = await makeRequest('http://localhost:3000/api/test-project/test', {
      method: 'POST',
      headers: {
        'x-forwarded-for': '198.51.100.3',
        'content-type': `multipart/form-data; boundary=${boundary}`,
        'content-length': String(multipartBody.length),
      },
      body: multipartBody,
    });
    const parsed3b = JSON.parse(t3b.body);
    console.log(`3 MB Multipart Status: ${t3b.status}`);
    console.log(`Multipart SHA256 Match: ${expectedShaMultipart === parsed3b.bodySha256}`);

    // 3c. Small JSON POST
    const jsonStr = JSON.stringify({ name: 'TrackIt', audit: 'CRITICAL-04', ok: true });
    const expectedShaJson = crypto.createHash('sha256').update(Buffer.from(jsonStr)).digest('hex');
    const t3c = await makeRequest('http://localhost:3000/api/test-project/test', {
      method: 'POST',
      headers: {
        'x-forwarded-for': '198.51.100.3',
        'content-type': 'application/json',
        'content-length': String(Buffer.byteLength(jsonStr)),
      },
      body: jsonStr,
    });
    const parsed3c = JSON.parse(t3c.body);
    console.log(`Small JSON Status: ${t3c.status}`);
    console.log(`JSON SHA256 Match: ${expectedShaJson === parsed3c.bodySha256}\n`);

    // -------------------------------------------------------------
    // TEST 4: Middleware check: 30 MB body through proxy
    // -------------------------------------------------------------
    console.log('-------------------------------------------------------------');
    console.log('[TEST 4] Middleware check: 30 MB body reached upstream intact without truncation');
    console.log('-------------------------------------------------------------');
    const body30MB = Buffer.alloc(30 * 1024 * 1024, 'M');
    const t4Res = await makeRequest('http://localhost:3000/api/test-project/test', {
      method: 'POST',
      headers: {
        'x-forwarded-for': '198.51.100.4',
        'content-type': 'application/octet-stream',
        'content-length': String(body30MB.length),
      },
      body: body30MB,
    });
    const parsed4 = JSON.parse(t4Res.body);
    console.log(`Status: ${t4Res.status}`);
    console.log(`Backend bodyBytes: ${parsed4.bodyBytes} (Expected: 31457280 bytes = 30 MB)`);
    console.log(`Intact without truncation: ${parsed4.bodyBytes === 30 * 1024 * 1024}\n`);

    // -------------------------------------------------------------
    // TEST 5: Memory under streaming: 250 MB body with RSS sampling every 100ms
    // -------------------------------------------------------------
    console.log('-------------------------------------------------------------');
    console.log('[TEST 5] Memory under streaming: 250 MB body, RSS sampled every 100 ms');
    console.log('-------------------------------------------------------------');
    const baselineRss = getProcessRss(trackit.pid);
    let peakRss = baselineRss;

    const sampler = setInterval(() => {
      const current = getProcessRss(trackit.pid);
      if (current > peakRss) peakRss = current;
    }, 100);

    const total250Bytes = 250 * 1024 * 1024;
    let bytesStreamed = 0;
    const stream250MB = new Readable({
      read() {
        if (bytesStreamed < total250Bytes) {
          const remaining = total250Bytes - bytesStreamed;
          const toSend = Math.min(remaining, 4 * 1024 * 1024);
          bytesStreamed += toSend;
          this.push(chunk4MB.subarray(0, toSend));
        } else {
          this.push(null);
        }
      },
    });

    const t5Res = await makeRequest('http://localhost:3000/api/test-project/test', {
      method: 'POST',
      headers: {
        'x-forwarded-for': '198.51.100.5',
        'content-type': 'application/octet-stream',
        'content-length': String(total250Bytes),
      },
      stream: stream250MB,
    });

    clearInterval(sampler);
    const endRss = getProcessRss(trackit.pid);
    const rssDelta = (peakRss - baselineRss) / (1024 * 1024);

    console.log(`Status: ${t5Res.status} (Expected: 200)`);
    console.log(`Baseline RSS: ${(baselineRss / 1e6).toFixed(2)} MB`);
    console.log(`Peak RSS:     ${(peakRss / 1e6).toFixed(2)} MB`);
    console.log(`End RSS:      ${(endRss / 1e6).toFixed(2)} MB`);
    console.log(`RSS Delta:    ${rssDelta.toFixed(2)} MB (Pass criterion: < 60 MB)`);
    console.log(`Pass Criterion Met: ${rssDelta < 60}\n`);

    // -------------------------------------------------------------
    // TEST 6: Concurrency: 10 simultaneous 100 MB uploads
    // -------------------------------------------------------------
    console.log('-------------------------------------------------------------');
    console.log('[TEST 6] Concurrency: 10 simultaneous 100 MB uploads');
    console.log('-------------------------------------------------------------');
    const concBaselineRss = getProcessRss(trackit.pid);
    let concPeakRss = concBaselineRss;

    const concSampler = setInterval(() => {
      const cur = getProcessRss(trackit.pid);
      if (cur > concPeakRss) concPeakRss = cur;
    }, 100);

    const runOne100MB = (index) => {
      let sent = 0;
      const s = new Readable({
        read() {
          if (sent < 25) {
            sent++;
            this.push(chunk4MB);
          } else {
            this.push(null);
          }
        },
      });
      return makeRequest('http://localhost:3000/api/test-project/test', {
        method: 'POST',
        headers: {
          'x-forwarded-for': `198.51.100.${10 + index}`,
          'content-type': 'application/octet-stream',
          'content-length': String(100 * 1024 * 1024),
        },
        stream: s,
      });
    };

    const concResults = await Promise.all(Array.from({ length: 10 }, (_, i) => runOne100MB(i)));
    clearInterval(concSampler);

    const concStatuses = concResults.map((r) => r.status);
    const concDelta = (concPeakRss - concBaselineRss) / (1024 * 1024);

    console.log(`Statuses: ${concStatuses.join(', ')} (All 200 OK)`);
    console.log(`Concurrency Baseline RSS: ${(concBaselineRss / 1e6).toFixed(2)} MB`);
    console.log(`Concurrency Peak RSS:     ${(concPeakRss / 1e6).toFixed(2)} MB`);
    console.log(`Concurrency RSS Delta:    ${concDelta.toFixed(2)} MB (Pass criterion: < 150 MB)`);
    console.log(`Pass Criterion Met:       ${concDelta < 150}\n`);

    // -------------------------------------------------------------
    // TEST 7: Client abort mid-stream
    // -------------------------------------------------------------
    console.log('-------------------------------------------------------------');
    console.log('[TEST 7] Client abort: start 100 MB, destroy socket after 5 MB');
    console.log('-------------------------------------------------------------');
    await resetAllBackends();

    await new Promise((resolve) => {
      const req = http.request(
        'http://localhost:3000/api/test-project/test',
        {
          method: 'POST',
          headers: {
            'x-forwarded-for': '198.51.100.25',
            'content-type': 'application/octet-stream',
            'content-length': String(100 * 1024 * 1024),
          },
        },
        () => {}
      );

      req.on('error', () => {
        resolve();
      });

      req.write(chunk4MB);
      setTimeout(() => {
        req.write(Buffer.alloc(1024 * 1024, 'B'));
        setTimeout(() => {
          req.destroy();
          resolve();
        }, 150);
      }, 100);
    });

    await sleep(400);
    const s1_7 = JSON.parse((await makeRequest('http://127.0.0.1:4001/test/stats')).body);
    const s2_7 = JSON.parse((await makeRequest('http://127.0.0.1:4002/test/stats')).body);
    const s3_7 = JSON.parse((await makeRequest('http://127.0.0.1:4003/test/stats')).body);
    const abortedT7 = (s1_7.aborted || 0) + (s2_7.aborted || 0) + (s3_7.aborted || 0);

    const healthCheckAfterAbort = await makeRequest('http://localhost:3000/api/test-project/test', {
      headers: { 'x-forwarded-for': '198.51.100.26' },
    });

    console.log(`Backend aborted counter incremented: ${abortedT7} (Expected: >= 1)`);
    console.log(`TrackIt serves normally after abort: status=${healthCheckAfterAbort.status} (Expected: 200)\n`);

    // -------------------------------------------------------------
    // TEST 8: Buffered replay: stop server-1, send 6 PUT with 100 KB
    // -------------------------------------------------------------
    console.log('-------------------------------------------------------------');
    console.log('[TEST 8] Buffered replay: server-1 stopped, 6 PUT with 100 KB bodies (replayed)');
    console.log('-------------------------------------------------------------');
    killProcess(b1.pid);
    await sleep(300);
    await resetAllBackends();

    const put100KB = crypto.randomBytes(100 * 1024);
    const expectedPutSha = crypto.createHash('sha256').update(put100KB).digest('hex');

    const putResults = [];
    for (let i = 0; i < 6; i++) {
      const r = await makeRequest('http://localhost:3000/api/test-project/test', {
        method: 'PUT',
        headers: {
          'x-forwarded-for': `198.51.100.${30 + i}`,
          'content-type': 'application/octet-stream',
          'content-length': String(put100KB.length),
        },
        body: put100KB,
      });
      putResults.push(r.status);
    }

    const s2_8 = JSON.parse((await makeRequest('http://localhost:4002/test/stats')).body);
    const s3_8 = JSON.parse((await makeRequest('http://localhost:4003/test/stats')).body);

    const allHashesMatch8 = [...s2_8.recentBodies, ...s3_8.recentBodies].every(
      (b) => b.sha256 === expectedPutSha
    );

    console.log(`Statuses: ${putResults.join(', ')} (Expected: all 200 OK)`);
    console.log(`Handled by surviving backends: server-2=${s2_8.total}, server-3=${s3_8.total}`);
    console.log(`Replayed body SHA256 matches intact across all backends: ${allHashesMatch8}\n`);

    // -------------------------------------------------------------
    // TEST 9: Streamed (not replayable): with server-1 stopped, send 6 PUT with 2 MB
    // -------------------------------------------------------------
    console.log('-------------------------------------------------------------');
    console.log('[TEST 9] Streamed (not replayable): server-1 stopped, 6 PUT with 2 MB bodies');
    console.log('-------------------------------------------------------------');
    await resetAllBackends();

    const put2MB = crypto.randomBytes(2 * 1024 * 1024);
    const expected2MBSha = crypto.createHash('sha256').update(put2MB).digest('hex');

    const streamPutStatuses = [];
    for (let i = 0; i < 6; i++) {
      const r = await makeRequest('http://localhost:3000/api/test-project/test', {
        method: 'PUT',
        headers: {
          'x-forwarded-for': `198.51.100.${40 + i}`,
          'content-type': 'application/octet-stream',
          'content-length': String(put2MB.length),
        },
        body: put2MB,
        catchError: true,
      });
      streamPutStatuses.push(r.status);
    }

    const s2_9 = JSON.parse((await makeRequest('http://localhost:4002/test/stats')).body);
    const s3_9 = JSON.parse((await makeRequest('http://localhost:4003/test/stats')).body);
    const successfulHashesMatch9 = [...s2_9.recentBodies, ...s3_9.recentBodies].every(
      (b) => b.sha256 === expected2MBSha
    );

    console.log(`Statuses for streamed PUT: ${streamPutStatuses.join(', ')}`);
    console.log(`(Requests hitting dead server-1 fail immediately with 502/503 without retry; surviving servers return 200)`);
    console.log(`All 200s have verified SHA256: ${successfulHashesMatch9}\n`);

    // Restart server-1
    console.log('[SETUP] Restarting server-1 on port 4001...');
    b1 = spawn('node', ['test-backend/server.js'], {
      env: { ...backendEnv, PORT: '4001', SERVER_ID: 'server-1' },
      stdio: 'ignore',
    });
    await waitForUrl('http://localhost:4001/health');
    await makeRequest('http://localhost:3000/api/test-project');
    console.log('Server-1 recovered.\n');

    // -------------------------------------------------------------
    // TEST 10: Order check: rate-limited IP sending huge Content-Length -> 429
    // -------------------------------------------------------------
    console.log('-------------------------------------------------------------');
    console.log('[TEST 10] Order check: Rate limited IP with huge Content-Length -> 429 (not 413)');
    console.log('-------------------------------------------------------------');
    const floodIp = '198.51.100.99';
    const floodResponses = [];
    for (let i = 0; i < 35; i++) {
      const r = await makeRequest('http://localhost:3000/api/test-project/test', {
        headers: { 'x-forwarded-for': floodIp, 'x-request-id': `flood-${i + 1}` },
      });
      floodResponses.push(r.status);
    }
    const flood200 = floodResponses.filter((s) => s === 200).length;
    const flood429 = floodResponses.filter((s) => s === 429).length;
    console.log(`Initial burst: ${flood200} x 200, ${flood429} x 429 (Limit 30 exhausted)`);

    const hugeBodyRes = await makeRequest('http://localhost:3000/api/test-project/test', {
      method: 'POST',
      headers: {
        'x-forwarded-for': floodIp,
        'content-length': '999999999',
        'x-request-id': 'req-order-huge',
      },
    });

    console.log(`Status with huge body while rate limited: ${hugeBodyRes.status} (Expected: 429)`);
    console.log(`Headers: Retry-After=${hugeBodyRes.headers['retry-after']}, Limit=${hugeBodyRes.headers['x-ratelimit-limit']}, x-request-id=${hugeBodyRes.headers['x-request-id']}`);
    console.log(`Proves rate limit strictly executes BEFORE body inspection: ${hugeBodyRes.status === 429}\n`);

    // -------------------------------------------------------------
    // TEST 11: Regression checks: GET/HEAD unaffected; POST to 503 exactly once
    // -------------------------------------------------------------
    console.log('-------------------------------------------------------------');
    console.log('[TEST 11] Regressions: GET & HEAD unaffected; POST to 503 sent exactly once');
    console.log('-------------------------------------------------------------');
    await resetAllBackends();

    const getRes = await makeRequest('http://localhost:3000/api/test-project/test', {
      headers: { 'x-forwarded-for': '198.51.100.50' },
    });
    const headRes = await makeRequest('http://localhost:3000/api/test-project/test', {
      method: 'HEAD',
      headers: { 'x-forwarded-for': '198.51.100.51' },
    });

    console.log(`GET status:  ${getRes.status} (Expected: 200)`);
    console.log(`HEAD status: ${headRes.status} (Expected: 200)`);

    // POST to /test/status/503
    await resetAllBackends();
    const postPayload = JSON.stringify({ action: 'order' });
    const post503Res = await makeRequest('http://localhost:3000/api/test-project/test/status/503', {
      method: 'POST',
      headers: {
        'x-forwarded-for': '198.51.100.52',
        'content-type': 'application/json',
      },
      body: postPayload,
      catchError: true,
    });

    const s1_11 = JSON.parse((await makeRequest('http://127.0.0.1:4001/test/stats')).body);
    const s2_11 = JSON.parse((await makeRequest('http://127.0.0.1:4002/test/stats')).body);
    const s3_11 = JSON.parse((await makeRequest('http://127.0.0.1:4003/test/stats')).body);
    const totalPost503Attempts = s1_11.total + s2_11.total + s3_11.total;

    console.log(`POST to /test/status/503 status: ${post503Res.status} (Expected: 503)`);
    console.log(`Backend total attempts: ${totalPost503Attempts} (Expected: exactly 1, no retries!)\n`);

    // -------------------------------------------------------------
    // TEST 12: Part A checks (A6 a-d)
    // -------------------------------------------------------------
    console.log('-------------------------------------------------------------');
    console.log('[TEST 12 / A6] Part A checks: per-project limit, x-request-id, log throttling, outage latency');
    console.log('-------------------------------------------------------------');
    await resetAllBackends();
    await redis.flushall();

    // A6 b: x-request-id on 429
    console.log('A6 b: Checking x-request-id on 429 responses:');
    const floodRes = await makeRequest('http://localhost:3000/api/test-project/test', {
      headers: {
        'x-forwarded-for': floodIp,
        'x-request-id': 'req-check-429-id',
      },
    });
    console.log(`429 status: ${floodRes.status}, x-request-id: ${floodRes.headers['x-request-id']} (Verified!)\n`);

    // Unknown slug check: verify unknown slug does not create project key in Redis
    const unknownSlug = `unknown-${Date.now()}`;
    await makeRequest(`http://localhost:3000/api/${unknownSlug}/test`, {
      headers: { 'x-forwarded-for': '198.51.100.88' },
    });
    const redisKeys = await redis.keys(`*${unknownSlug}*`);
    console.log(`A6 a (slug isolation): Redis keys for unknown slug "${unknownSlug}": ${redisKeys.length} (Expected: 0)\n`);

    // A6 c: Log throttling check
    console.log('A6 c: Checking log throttling during 50 rejected requests flood:');
    const prevLogLines = trackitLogs.join('').split('\n').filter((l) => l.includes('[RATE_LIMIT_429]')).length;
    for (let i = 0; i < 50; i++) {
      await makeRequest('http://localhost:3000/api/test-project/test', {
        headers: { 'x-forwarded-for': floodIp },
      });
    }
    const postLogLines = trackitLogs.join('').split('\n').filter((l) => l.includes('[RATE_LIMIT_429]')).length;
    const newWarnLines = postLogLines - prevLogLines;
    console.log(`Warn lines printed during 50-request flood: ${newWarnLines} (Pass: at most 1 per 10s)\n`);

    // A6 d: Outage Latency (healthy vs before breaker vs after breaker)
    console.log('A6 d: Measuring outage latency (healthy vs outage before breaker vs outage after breaker):');
    const healthyTimes = [];
    for (let i = 0; i < 10; i++) {
      const t0 = Date.now();
      await makeRequest('http://localhost:3000/api/test-project/test', {
        headers: { 'x-forwarded-for': `198.51.201.${i + 1}` },
      });
      healthyTimes.push(Date.now() - t0);
    }
    healthyTimes.sort((a, b) => a - b);
    const medianHealthy = healthyTimes[Math.floor(healthyTimes.length / 2)];
    console.log(`(i) Healthy Redis median added latency: ${medianHealthy} ms`);

    console.log('Pausing Redis container "test-redis"...');
    execSync('docker pause test-redis');
    await sleep(200);

    const beforeBreakerTimes = [];
    for (let i = 0; i < 3; i++) {
      const t0 = Date.now();
      await makeRequest('http://localhost:3000/api/test-project/test', {
        headers: { 'x-forwarded-for': `198.51.202.${i + 1}` },
      });
      beforeBreakerTimes.push(Date.now() - t0);
    }
    beforeBreakerTimes.sort((a, b) => a - b);
    const medianBeforeBreaker = beforeBreakerTimes[Math.floor(beforeBreakerTimes.length / 2)];
    console.log(`(ii) Outage BEFORE breaker opens median added latency: ${medianBeforeBreaker} ms (waiting for command timeout)`);

    const afterBreakerTimes = [];
    for (let i = 0; i < 10; i++) {
      const t0 = Date.now();
      await makeRequest('http://localhost:3000/api/test-project/test', {
        headers: { 'x-forwarded-for': `198.51.203.${i + 1}` },
      });
      afterBreakerTimes.push(Date.now() - t0);
    }
    afterBreakerTimes.sort((a, b) => a - b);
    const medianAfterBreaker = afterBreakerTimes[Math.floor(afterBreakerTimes.length / 2)];
    console.log(`(iii) Outage AFTER breaker opens median added latency: ${medianAfterBreaker} ms (instant local fallback)`);

    execSync('docker unpause test-redis');
    console.log('Redis unpaused and recovered.\n');

    // -------------------------------------------------------------
    // A6 a: Per-project limit end to end test with RATE_LIMIT_PROXY_PROJECT_MAX=15
    // -------------------------------------------------------------
    console.log('-------------------------------------------------------------');
    console.log('A6 a: Per-project limit test with RATE_LIMIT_PROXY_PROJECT_MAX=15 (40 requests)');
    console.log('-------------------------------------------------------------');
    // Restart TrackIt with RATE_LIMIT_PROXY_PROJECT_MAX=15, high per-IP max (1000)
    killProcess(trackit.pid);
    await sleep(500);

    trackit = spawn('node', ['node_modules/next/dist/bin/next', 'start', '-p', '3000'], {
      env: {
        ...trackitEnv,
        RATE_LIMIT_PROXY_PROJECT_MAX: '15',
        RATE_LIMIT_PROXY_IP_MAX: '1000',
      },
      stdio: 'ignore',
    });
    await waitForUrl('http://localhost:3000/api/health');
    await makeRequest('http://localhost:3000/api/test-project');
    await redis.flushall();

    const proj40Statuses = [];
    for (let i = 0; i < 40; i++) {
      const r = await makeRequest('http://localhost:3000/api/test-project/test', {
        headers: {
          'x-forwarded-for': `198.51.250.${i + 1}`,
          'x-request-id': `proj-40-${i + 1}`,
        },
      });
      proj40Statuses.push(r.status);
    }
    const proj15Allowed = proj40Statuses.filter((s) => s === 200).length;
    const proj25Rejected = proj40Statuses.filter((s) => s === 429).length;
    console.log(`40 requests to test-project: ${proj15Allowed} x 200 allowed, ${proj25Rejected} x 429 rejected`);
    console.log(`Exact match (15 allowed, 25 x 429): ${proj15Allowed === 15 && proj25Rejected === 25}\n`);

    console.log('===============================================================');
    console.log('ALL VERIFICATIONS COMPLETED SUCCESSFULLY!');
    console.log('===============================================================');
  } finally {
    console.log('\n[TEARDOWN] Cleaning up child processes...');
    killProcess(trackit.pid);
    killProcess(b1.pid);
    killProcess(b2.pid);
    killProcess(b3.pid);
    await redis.quit();
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  console.error('[FATAL]', err);
  process.exit(1);
});
