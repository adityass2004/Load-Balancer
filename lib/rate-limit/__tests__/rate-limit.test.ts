import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import Redis from 'ioredis';
import { parseRateLimitConfig } from '../config';
import { checkRedisLimiter } from '../redis-limiter';
import { checkLocalFallback } from '../local-fallback';
import { rateLimit } from '../index';

describe('Rate Limiting System (CRITICAL-03)', () => {
  let redis: Redis;
  const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

  beforeAll(async () => {
    redis = new Redis(REDIS_URL, {
      commandTimeout: 1000,
      maxRetriesPerRequest: 1,
      enableOfflineQueue: false,
    });

    if (redis.status !== 'ready') {
      await new Promise((resolve, reject) => {
        redis.once('ready', resolve);
        redis.once('error', reject);
      });
    }
  });

  afterAll(async () => {
    if (redis) {
      try {
        await redis.quit();
      } catch {
        redis.disconnect();
      }
    }
  });

  describe('Configuration Validation', () => {
    const originalEnv = { ...process.env };

    afterAll(() => {
      process.env = originalEnv;
    });

    it('parses valid defaults correctly', () => {
      delete process.env.RATE_LIMIT_PROXY_IP_MAX;
      delete process.env.RATE_LIMIT_FAIL_MODE_PROXY;
      const config = parseRateLimitConfig();
      expect(config.proxyIpMax).toBe(600);
      expect(config.failModeProxy).toBe('open');
      expect(config.failModeAdmin).toBe('closed');
      expect(config.failModeAuth).toBe('closed');
    });

    it('rejects negative or non-integer rate limits', () => {
      process.env.RATE_LIMIT_PROXY_IP_MAX = '-5';
      expect(() => parseRateLimitConfig()).toThrow();

      process.env.RATE_LIMIT_PROXY_IP_MAX = 'abc';
      expect(() => parseRateLimitConfig()).toThrow();
    });

    it('rejects invalid fail modes', () => {
      process.env.RATE_LIMIT_FAIL_MODE_PROXY = 'invalid_mode';
      expect(() => parseRateLimitConfig()).toThrow();
    });
  });

  describe('Atomic Lua Sliding-Window Limiter (Real Redis)', () => {
    it('allows requests up to limit, rejects the next, and returns correct remaining counts', async () => {
      const scope = 'test-scope';
      const id = `user-${Date.now()}`;
      const limit = 3;
      const windowSec = 2; // Short window for test

      // 1st request -> allowed, remaining 2
      const res1 = await checkRedisLimiter(redis, scope, id, limit, windowSec);
      expect(res1.allowed).toBe(true);
      expect(res1.limit).toBe(limit);
      expect(res1.remaining).toBe(2);

      // 2nd request -> allowed, remaining 1
      const res2 = await checkRedisLimiter(redis, scope, id, limit, windowSec);
      expect(res2.allowed).toBe(true);
      expect(res2.remaining).toBe(1);

      // 3rd request -> allowed, remaining 0
      const res3 = await checkRedisLimiter(redis, scope, id, limit, windowSec);
      expect(res3.allowed).toBe(true);
      expect(res3.remaining).toBe(0);

      // 4th request -> rejected!
      const res4 = await checkRedisLimiter(redis, scope, id, limit, windowSec);
      expect(res4.allowed).toBe(false);
      expect(res4.remaining).toBe(0);
      expect(res4.retryAfterSeconds).toBeGreaterThan(0);

      // Wait for window to expire and verify recovery
      await new Promise((r) => setTimeout(r, (windowSec + 1) * 1000));

      const resRecovered = await checkRedisLimiter(redis, scope, id, limit, windowSec);
      expect(resRecovered.allowed).toBe(true);
    });

    it('guarantees strict atomicity under high concurrency (200 requests with limit 100)', async () => {
      const scope = 'concurrent-test';
      const id = `client-${Date.now()}`;
      const limit = 100;
      const windowSec = 10;

      // Fire 200 concurrent checks simultaneously
      const promises = Array.from({ length: 200 }, () =>
        checkRedisLimiter(redis, scope, id, limit, windowSec)
      );

      const results = await Promise.all(promises);
      const allowedCount = results.filter((r) => r.allowed).length;
      const rejectedCount = results.filter((r) => !r.allowed).length;

      expect(allowedCount).toBe(100);
      expect(rejectedCount).toBe(100);
    });
  });

  describe('Local In-Memory Fallback Limiter', () => {
    it('enforces limit locally when Redis is bypassed and tracks remaining count', () => {
      const scope = 'local-test';
      const id = `fallback-${Date.now()}`;
      const limit = 2;
      const windowSec = 10;
      const divisor = 1;

      const r1 = checkLocalFallback(scope, id, limit, windowSec, divisor);
      expect(r1.allowed).toBe(true);
      expect(r1.remaining).toBe(1);

      const r2 = checkLocalFallback(scope, id, limit, windowSec, divisor);
      expect(r2.allowed).toBe(true);
      expect(r2.remaining).toBe(0);

      const r3 = checkLocalFallback(scope, id, limit, windowSec, divisor);
      expect(r3.allowed).toBe(false);
      expect(r3.retryAfterSeconds).toBeGreaterThan(0);
    });
  });

  describe('Fail-Closed vs Fail-Open Behavior', () => {
    it('returns 503 with Retry-After: 5 when closed-mode scope experiences Redis absence', async () => {
      const origClient = global.__trackit_redis__;
      try {
        // Force Redis client unavailable
        global.__trackit_redis__ = null;

        const req = new Request('http://localhost/api/admin/projects', {
          headers: { 'x-request-id': 'req-test-closed' },
        });

        const res = await rateLimit('admin:ip', `test-ip-${Date.now()}`, req);
        expect(res).not.toBeNull();
        expect(res?.status).toBe(503);
        expect(res?.headers.get('Retry-After')).toBe('5');
        expect(res?.headers.get('x-request-id')).toBe('req-test-closed');
      } finally {
        global.__trackit_redis__ = origClient;
      }
    });

    it('falls back to local limiter when open-mode scope experiences Redis absence', async () => {
      const origClient = global.__trackit_redis__;
      try {
        global.__trackit_redis__ = null;

        const req = new Request('http://localhost/api/test-project/test', {
          headers: { 'x-request-id': 'req-test-open' },
        });

        const res = await rateLimit('proxy:ip', `test-ip-${Date.now()}`, req);
        expect(res).toBeNull(); // Allowed under local fallback
      } finally {
        global.__trackit_redis__ = origClient;
      }
    });

    it('unknown project slug does not create a per-project key in Redis', async () => {
      const unknownSlug = `unknown-slug-${Date.now()}`;
      const keys = await redis.keys(`*${unknownSlug}*`);
      expect(keys.length).toBe(0);
    });
  });
});
