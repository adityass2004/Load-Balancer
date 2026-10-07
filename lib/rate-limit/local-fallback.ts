export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetSeconds: number;
  retryAfterSeconds: number;
}

interface LocalEntry {
  count: number;
  expiresAtMs: number;
}

const localStore = new Map<string, LocalEntry>();

// Periodic in-memory cleanup to guarantee bounded memory usage
const CLEANUP_INTERVAL_MS = 30_000;
let lastCleanup = Date.now();

function purgeExpiredEntries() {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return;
  lastCleanup = now;

  for (const [key, entry] of localStore.entries()) {
    if (entry.expiresAtMs <= now) {
      localStore.delete(key);
    }
  }
}

// Throttle degraded warning
let lastDegradedWarnTime = 0;
export function logDegradedWarning() {
  const now = Date.now();
  if (now - lastDegradedWarnTime >= 10_000) {
    lastDegradedWarnTime = now;
    console.warn('[RATE_LIMIT] rate limiter degraded: Redis unavailable, using local fallback');
  }
}

/**
 * In-memory fallback rate limiter used when Redis is unreachable or unconfigured.
 */
export function checkLocalFallback(
  scope: string,
  id: string,
  baseLimit: number,
  windowSec: number,
  fallbackDivisor: number
): RateLimitResult {
  purgeExpiredEntries();
  logDegradedWarning();

  const effectiveLimit = Math.max(1, Math.floor(baseLimit / fallbackDivisor));
  const nowMs = Date.now();
  const nowSec = Math.floor(nowMs / 1000);
  const windowIndex = Math.floor(nowSec / windowSec);
  const resetSeconds = Math.max(1, (windowIndex + 1) * windowSec - nowSec);

  const storageKey = `local:{${scope}:${id}}:${windowIndex}`;
  const existing = localStore.get(storageKey);

  const currentCount = existing ? existing.count : 0;

  if (currentCount >= effectiveLimit) {
    return {
      allowed: false,
      limit: effectiveLimit,
      remaining: 0,
      resetSeconds,
      retryAfterSeconds: resetSeconds,
    };
  }

  const newCount = currentCount + 1;
  localStore.set(storageKey, {
    count: newCount,
    // Keep in memory for 2 windows
    expiresAtMs: nowMs + windowSec * 2 * 1000,
  });

  return {
    allowed: true,
    limit: effectiveLimit,
    remaining: Math.max(0, effectiveLimit - newCount),
    resetSeconds,
    retryAfterSeconds: 0,
  };
}
