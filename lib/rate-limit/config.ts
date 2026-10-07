import { z } from 'zod';

const positiveIntSchema = (defaultVal: number) =>
  z
    .string()
    .optional()
    .transform((val) => (val === undefined || val === '' ? defaultVal : Number(val)))
    .pipe(z.number().int().positive());

const failModeSchema = (defaultVal: 'open' | 'closed') =>
  z
    .string()
    .optional()
    .transform((val) => (val === undefined || val === '' ? defaultVal : val.toLowerCase()))
    .pipe(z.enum(['open', 'closed']));

const RateLimitConfigSchema = z.object({
  // Proxy limits
  proxyIpMax: positiveIntSchema(600),
  proxyWindowSec: positiveIntSchema(60),
  proxyProjectMax: positiveIntSchema(6000),
  proxyProjectWindowSec: positiveIntSchema(60),

  // Admin limits
  adminIpMax: positiveIntSchema(60),
  adminWindowSec: positiveIntSchema(60),

  // Auth limits
  authIpMax: positiveIntSchema(20),
  authWindowSec: positiveIntSchema(60),

  // Cron limits (MEDIUM-03)
  cronIpMax: positiveIntSchema(10),
  cronWindowSec: positiveIntSchema(60),

  // Fail modes
  failModeProxy: failModeSchema('open'),
  failModeAdmin: failModeSchema('closed'),
  failModeAuth: failModeSchema('closed'),
  failModeCron: failModeSchema('closed'),

  // Fallback divisor
  fallbackDivisor: positiveIntSchema(1),

  // Trusted hops
  trustedProxyHops: positiveIntSchema(1),

  // Circuit breaker
  breakerFailures: positiveIntSchema(3),
  breakerCooldownSec: positiveIntSchema(10),

  // Unknown IP multiplier
  unknownIpMultiplier: positiveIntSchema(5),
});

export type RateLimitConfig = z.infer<typeof RateLimitConfigSchema>;

export function parseRateLimitConfig(): RateLimitConfig {
  const result = RateLimitConfigSchema.safeParse({
    proxyIpMax: process.env.RATE_LIMIT_PROXY_IP_MAX,
    proxyWindowSec: process.env.RATE_LIMIT_PROXY_WINDOW_SEC,
    proxyProjectMax: process.env.RATE_LIMIT_PROXY_PROJECT_MAX,
    proxyProjectWindowSec: process.env.RATE_LIMIT_PROXY_PROJECT_WINDOW_SEC,

    adminIpMax: process.env.RATE_LIMIT_ADMIN_IP_MAX,
    adminWindowSec: process.env.RATE_LIMIT_ADMIN_WINDOW_SEC,

    authIpMax: process.env.RATE_LIMIT_AUTH_IP_MAX,
    authWindowSec: process.env.RATE_LIMIT_AUTH_WINDOW_SEC,

    cronIpMax: process.env.RATE_LIMIT_CRON_IP_MAX,
    cronWindowSec: process.env.RATE_LIMIT_CRON_WINDOW_SEC,

    failModeProxy: process.env.RATE_LIMIT_FAIL_MODE_PROXY,
    failModeAdmin: process.env.RATE_LIMIT_FAIL_MODE_ADMIN,
    failModeAuth: process.env.RATE_LIMIT_FAIL_MODE_AUTH,
    failModeCron: process.env.RATE_LIMIT_FAIL_MODE_CRON,

    fallbackDivisor: process.env.RATE_LIMIT_FALLBACK_DIVISOR,
    trustedProxyHops: process.env.TRUSTED_PROXY_HOPS,

    breakerFailures: process.env.RATE_LIMIT_REDIS_BREAKER_FAILURES,
    breakerCooldownSec: process.env.RATE_LIMIT_REDIS_BREAKER_COOLDOWN_SEC,
    unknownIpMultiplier: process.env.RATE_LIMIT_UNKNOWN_IP_MULTIPLIER,
  });

  if (!result.success) {
    const formatted = result.error.issues
      .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
      .join(', ');
    throw new Error(`[RATE_LIMIT_CONFIG] Invalid rate limit configuration: ${formatted}`);
  }

  return result.data;
}

export const rateLimitConfig = parseRateLimitConfig();
