import http from 'http';

function makeRequest(path: string, headers: Record<string, string> = {}): Promise<{ status: number; body: string }> {
  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        hostname: 'localhost',
        port: 3000,
        path,
        method: 'GET',
        headers,
      },
      (res) => {
        let data = '';
        res.on('data', (c) => (data += c));
        res.on('end', () => resolve({ status: res.statusCode || 0, body: data }));
      }
    );
    req.on('error', reject);
    req.end();
  });
}

async function runCronChecks() {
  console.log('=== STARTING CRON AUTH & RATE LIMIT LIVE VERIFICATION ===\n');

  // 1. No Authorization header -> 401
  const noAuth = await makeRequest('/api/cron/health', {
    'X-Forwarded-For': '198.51.100.1',
  });
  console.log('[CRON 1] No Authorization header:');
  console.log('  Status:', noAuth.status, '(Expected: 401)');
  console.log('  Body:', noAuth.body);

  // 2. 10-character secret with matching Bearer -> 401 (fails <16 chars check)
  const shortSecret = await makeRequest('/api/cron/health', {
    Authorization: 'Bearer 1234567890',
    'X-Forwarded-For': '198.51.100.2',
  });
  console.log('\n[CRON 2] 10-character secret with matching Bearer:');
  console.log('  Status:', shortSecret.status, '(Expected: 401)');
  console.log('  Body:', shortSecret.body);

  // 3. Valid secret (30 chars) -> 200
  const validSecret = await makeRequest('/api/cron/health', {
    Authorization: 'Bearer valid-test-secret-1234567890',
    'X-Forwarded-For': '198.51.100.3',
  });
  console.log('\n[CRON 3] Valid secret (Bearer valid-test-secret-1234567890):');
  console.log('  Status:', validSecret.status, '(Expected: 200)');
  console.log('  Body:', validSecret.body);

  // 4. Rate limiting: 11 rapid requests from same IP -> 10 allowed (or 200/skipped), 11th returns 429
  console.log('\n[CRON 4] 11 rapid requests from single IP (203.0.113.88):');
  const rateLimitIp = '203.0.113.88';
  const statuses: number[] = [];
  for (let i = 1; i <= 11; i++) {
    const res = await makeRequest('/api/cron/health', {
      Authorization: 'Bearer valid-test-secret-1234567890',
      'X-Forwarded-For': rateLimitIp,
    });
    statuses.push(res.status);
    console.log(`  Request ${i}: status=${res.status}`);
  }
  const count429 = statuses.filter((s) => s === 429).length;
  console.log(`  Total 429s received: ${count429} (Expected: 11th request is 429: ${statuses[10] === 429})`);
}

runCronChecks().catch(console.error);
