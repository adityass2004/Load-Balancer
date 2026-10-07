import Redis from 'ioredis';

declare global {
  var __trackit_redis__: Redis | null | undefined;
}

/**
 * Singleton Redis client configured specifically for low-latency rate limiting.
 *
 * Constraints:
 * - commandTimeout: 150ms (avoids stalling proxy request hot-path)
 * - maxRetriesPerRequest: 1 (fails fast)
 * - enableOfflineQueue: false (drops immediately when Redis is disconnected)
 * - Never logs REDIS_URL
 */
export function getRedisClient(): Redis | null {
  if (global.__trackit_redis__ !== undefined) {
    return global.__trackit_redis__;
  }

  const redisUrl = process.env.REDIS_URL;
  if (!redisUrl) {
    if (process.env.NODE_ENV === 'production') {
      console.warn('[REDIS] REDIS_URL is not configured. Rate limiting will operate in fallback mode.');
    }
    global.__trackit_redis__ = null;
    return null;
  }

  try {
    const client = new Redis(redisUrl, {
      commandTimeout: 150,
      maxRetriesPerRequest: 1,
      enableOfflineQueue: false,
      lazyConnect: false,
      retryStrategy(times) {
        return Math.min(times * 200, 2000);
      },
    });

    client.on('error', (err: any) => {
      // Intentionally omit connection credentials / REDIS_URL
      const msg = err?.message || 'Connection error';
      // Throttle error logging to prevent console spam
      console.warn(`[REDIS] Client warning: ${msg}`);
    });

    global.__trackit_redis__ = client;
    return client;
  } catch (err: any) {
    console.error(`[REDIS] Initialization error: ${err?.message || 'Failed to construct client'}`);
    global.__trackit_redis__ = null;
    return null;
  }
}
