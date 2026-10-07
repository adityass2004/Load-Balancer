import { describe, it, expect, beforeEach } from 'vitest';
import {
  canAttemptRedis,
  recordRedisSuccess,
  recordRedisFailure,
  getBreakerState,
  resetBreaker,
  setOpenedAtMsForTest,
} from '../redis-breaker';

describe('Redis Circuit Breaker', () => {
  beforeEach(() => {
    resetBreaker();
  });

  it('starts in closed state and allows Redis attempts', () => {
    const state = getBreakerState();
    expect(state.state).toBe('closed');
    expect(state.consecutiveFailures).toBe(0);
    expect(canAttemptRedis()).toBe(true);
  });

  it('trips to open after consecutive failures threshold', () => {
    recordRedisFailure();
    recordRedisFailure();
    expect(canAttemptRedis()).toBe(true); // 2 failures < 3

    recordRedisFailure(); // 3 failures = tripped!
    expect(getBreakerState().state).toBe('open');
    expect(canAttemptRedis()).toBe(false);
  });

  it('allows one probe in half-open state after cooldown and closes on success', () => {
    recordRedisFailure();
    recordRedisFailure();
    recordRedisFailure();
    expect(canAttemptRedis()).toBe(false);

    // Fast-forward cooldown
    setOpenedAtMsForTest(Date.now() - 15_000); // > 10s cooldown

    // First attempt enters half-open and probe is allowed
    expect(canAttemptRedis()).toBe(true);
    expect(getBreakerState().state).toBe('half-open');

    // Second concurrent attempt before probe completes is blocked
    expect(canAttemptRedis()).toBe(false);

    // Probe succeeds -> breaker closes!
    recordRedisSuccess();
    expect(getBreakerState().state).toBe('closed');
    expect(canAttemptRedis()).toBe(true);
  });

  it('re-trips to open if probe fails during half-open', () => {
    recordRedisFailure();
    recordRedisFailure();
    recordRedisFailure();

    // Fast-forward cooldown
    setOpenedAtMsForTest(Date.now() - 15_000);

    expect(canAttemptRedis()).toBe(true);
    expect(getBreakerState().state).toBe('half-open');

    // Probe fails
    recordRedisFailure();
    expect(getBreakerState().state).toBe('open');
    expect(canAttemptRedis()).toBe(false);
  });
});
