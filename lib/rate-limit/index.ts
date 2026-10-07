import crypto from 'crypto';
import { NextResponse } from 'next/server';
import { rateLimitConfig } from './config';
import { getRedisClient } from '../redis';
import { checkRedisLimiter } from './redis-limiter';
import { checkLocalFallback, type RateLimitResult } from './local-fallback';
import { rateLimitKeyForIp } from '../client-ip';
import {
  canAttemptRedis,
  recordRedisSuccess,
  recordRedisFailure,
} from './redis-breaker';

export type RateLimitScope = 'proxy:ip' | 'proxy:project' | 'admin:ip' | 'auth:ip' | 'cron:ip';

interface ScopeConfig {
  limit: number;
  windowSec: number;
  failMode: 'open' | 'closed';
}

function getScopeConfig(scope: RateLimitScope): ScopeConfig {
  switch (scope) {
    case 'proxy:ip':
      return {
        limit: rateLimitConfig.proxyIpMax,
        windowSec: rateLimitConfig.proxyWindowSec,
        failMode: rateLimitConfig.failModeProxy,
      };
    case 'proxy:project':
      return {
        limit: rateLimitConfig.proxyProjectMax,
        windowSec: rateLimitConfig.proxyProjectWindowSec,
        failMode: rateLimitConfig.failModeProxy,
      };
    case 'admin:ip':
      return {
        limit: rateLimitConfig.adminIpMax,
        windowSec: rateLimitConfig.adminWindowSec,
        failMode: rateLimitConfig.failModeAdmin,
      };
    case 'auth:ip':
      return {
        limit: rateLimitConfig.authIpMax,
        windowSec: rateLimitConfig.authWindowSec,
        failMode: rateLimitConfig.failModeAuth,
      };
    case 'cron:ip':
      return {
        limit: rateLimitConfig.cronIpMax,
        windowSec: rateLimitConfig.cronWindowSec,
        failMode: rateLimitConfig.failModeCron,
      };
  }
}

// Throttle logging for 429 rejections: at most 1 line per scope+IP per 10 seconds
const rejectionLogCache = new Map<string, number>();

function maskIdentifier(id: string): string {
  if (id === 'unknown') return 'unknown';
  if (id.includes('.')) {
    // IPv4: mask last octet
    const parts = id.split('.');
    if (parts.length === 4) {
      return `${parts[0]}.${parts[1]}.${parts[2]}.xxx`;
    }
  }
  // Mask or hash
  return crypto.createHash('sha256').update(id).digest('hex').slice(0, 8);
}

function logRejectionThrottled(scope: string, id: string, limit: number, requestId: string) {
  const logKey = `${scope}:${id}`;
  const now = Date.now();
  const lastLog = rejectionLogCache.get(logKey) || 0;

  if (now - lastLog >= 10_000) {
    rejectionLogCache.set(logKey, now);
    const masked = maskIdentifier(id);
    console.warn(
      `[RATE_LIMIT_429] scope=${scope} id=${masked} limit=${limit} requestId=${requestId}`
    );
  }
}

let lastUnknownIpWarn = 0;
function logUnknownIpWarning() {
  const now = Date.now();
  if (now - lastUnknownIpWarn >= 60_000) {
    lastUnknownIpWarn = now;
    console.warn('[CLIENT_IP] client IP could not be determined; check TRUSTED_PROXY_HOPS');
  }
}

/**
 * Reusable rate limiting helper for route handlers.
 *
 * @returns null if the request is allowed, or a NextResponse (429 or 503) if blocked.
 */
export async function rateLimit(
  scope: RateLimitScope,
  id: string,
  request: Request
): Promise<NextResponse | null> {
  const { limit: baseLimit, windowSec, failMode } = getScopeConfig(scope);
  const requestId = request.headers.get('x-request-id') || crypto.randomUUID();

  const isIpScope =
    scope === 'proxy:ip' ||
    scope === 'admin:ip' ||
    scope === 'auth:ip' ||
    scope === 'cron:ip';
  const normalizedId = isIpScope ? rateLimitKeyForIp(id) : id;

  let limit = baseLimit;
  if (isIpScope && normalizedId === 'unknown') {
    limit = baseLimit * rateLimitConfig.unknownIpMultiplier;
    logUnknownIpWarning();
  }

  let result: RateLimitResult | null = null;
  const redis = getRedisClient();

  if (redis && canAttemptRedis()) {
    if (redis.status !== 'ready' && (redis.status === 'connecting' || redis.status === 'connect')) {
      try {
        await new Promise((resolve, reject) => {
          const onReady = () => { cleanup(); resolve(null); };
          const onError = (e: any) => { cleanup(); reject(e); };
          const timer = setTimeout(() => { cleanup(); resolve(null); }, 150);
          const cleanup = () => {
            clearTimeout(timer);
            redis.off('ready', onReady);
            redis.off('error', onError);
          };
          redis.once('ready', onReady);
          redis.once('error', onError);
        });
      } catch {
        // connect error, will fall back
      }
    }

    if (redis.status === 'ready') {
      try {
        result = await checkRedisLimiter(redis, scope, normalizedId, limit, windowSec);
        recordRedisSuccess();
      } catch {
        recordRedisFailure();
        result = null;
      }
    } else {
      recordRedisFailure();
    }
  }

  if (!result) {
    // Redis unavailable / unconfigured / breaker open
    if (failMode === 'closed') {
      const response = NextResponse.json(
        {
          error: 'Service temporarily unavailable',
          retryAfterSeconds: 5,
        },
        { status: 503 }
      );
      response.headers.set('Retry-After', '5');
      response.headers.set('x-request-id', requestId);
      return response;
    }

    // failMode === 'open': fall back to in-memory local limiter
    result = checkLocalFallback(
      scope,
      normalizedId,
      limit,
      windowSec,
      rateLimitConfig.fallbackDivisor
    );
  }

  if (!result.allowed) {
    logRejectionThrottled(scope, id, result.limit, requestId);

    const response = NextResponse.json(
      {
        error: 'Too many requests',
        retryAfterSeconds: result.retryAfterSeconds,
      },
      { status: 429 }
    );

    response.headers.set('Retry-After', String(result.retryAfterSeconds));
    response.headers.set('X-RateLimit-Limit', String(result.limit));
    response.headers.set('X-RateLimit-Remaining', String(result.remaining));
    response.headers.set('X-RateLimit-Reset', String(result.resetSeconds));
    response.headers.set('x-request-id', requestId);

    return response;
  }

  return null;
}
