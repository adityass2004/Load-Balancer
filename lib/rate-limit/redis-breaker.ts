import { rateLimitConfig } from './config';

export type BreakerState = 'closed' | 'open' | 'half-open';

let state: BreakerState = 'closed';
let consecutiveFailures = 0;
let openedAtMs = 0;
let lastWarnLoggedAt = 0;

function logBreakerWarning(message: string) {
  const now = Date.now();
  if (now - lastWarnLoggedAt >= 5000) {
    lastWarnLoggedAt = now;
    console.warn(`[RATE_LIMIT_BREAKER] ${message}`);
  }
}

/**
 * Checks whether Redis can be queried or if the circuit breaker is currently open.
 */
export function canAttemptRedis(): boolean {
  if (state === 'closed') {
    return true;
  }

  const now = Date.now();
  const cooldownMs = rateLimitConfig.breakerCooldownSec * 1000;

  if (state === 'open') {
    if (now - openedAtMs >= cooldownMs) {
      // Transition to half-open to allow exactly one probe request
      state = 'half-open';
      return true;
    }
    // Breaker is open and within cooldown: bypass Redis immediately
    return false;
  }

  // If already half-open, a probe is in flight; bypass Redis for others
  return false;
}

/**
 * Records a successful Redis operation.
 */
export function recordRedisSuccess(): void {
  if (state === 'half-open' || consecutiveFailures > 0) {
    logBreakerWarning('Circuit breaker CLOSED: Redis connection restored.');
  }
  state = 'closed';
  consecutiveFailures = 0;
  openedAtMs = 0;
}

/**
 * Records a Redis failure (timeout, network drop, unhandled error).
 */
export function recordRedisFailure(): void {
  consecutiveFailures++;

  if (state === 'half-open') {
    // Probe failed: trip breaker back to open for another cooldown
    state = 'open';
    openedAtMs = Date.now();
    logBreakerWarning(
      `Probe failed. Breaker RE-OPENED: Redis bypassed for ${rateLimitConfig.breakerCooldownSec}s.`
    );
    return;
  }

  if (consecutiveFailures >= rateLimitConfig.breakerFailures && state === 'closed') {
    state = 'open';
    openedAtMs = Date.now();
    logBreakerWarning(
      `Circuit breaker OPENED after ${consecutiveFailures} consecutive failures: Redis bypassed for ${rateLimitConfig.breakerCooldownSec}s.`
    );
  }
}

/**
 * Exposes current breaker state (for diagnostics and testing).
 */
export function getBreakerState(): {
  state: BreakerState;
  consecutiveFailures: number;
  openedAtMs: number;
} {
  return { state, consecutiveFailures, openedAtMs };
}

export function setOpenedAtMsForTest(ms: number): void {
  openedAtMs = ms;
}

/**
 * Resets breaker state (used in unit tests).
 */
export function resetBreaker(): void {
  state = 'closed';
  consecutiveFailures = 0;
  openedAtMs = 0;
  lastWarnLoggedAt = 0;
}
