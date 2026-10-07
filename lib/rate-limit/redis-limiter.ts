import type Redis from 'ioredis';
import type { RateLimitResult } from './local-fallback';

export const SLIDING_WINDOW_LUA = `
local key_prefix = KEYS[1]
local limit = tonumber(ARGV[1])
local window_sec = tonumber(ARGV[2])

local time_res = redis.call('TIME')
local now_sec = tonumber(time_res[1])

local current_window = math.floor(now_sec / window_sec)
local prev_window = current_window - 1

local curr_key = key_prefix .. ':' .. current_window
local prev_key = key_prefix .. ':' .. prev_window

local curr_count = tonumber(redis.call('GET', curr_key) or '0')
local prev_count = tonumber(redis.call('GET', prev_key) or '0')

local elapsed_sec = now_sec - (current_window * window_sec)
local weight_prev = (window_sec - elapsed_sec) / window_sec
local estimated_count = math.floor(prev_count * weight_prev) + curr_count

local reset_seconds = window_sec - elapsed_sec
if reset_seconds < 1 then
  reset_seconds = 1
end

if estimated_count >= limit then
  return {0, limit, 0, reset_seconds, reset_seconds}
else
  local new_curr = redis.call('INCR', curr_key)
  redis.call('EXPIRE', curr_key, window_sec * 2)

  local remaining = limit - (math.floor(prev_count * weight_prev) + new_curr)
  if remaining < 0 then
    remaining = 0
  end

  return {1, limit, remaining, reset_seconds, 0}
end
`;

let luaSha: string | null = null;

/**
 * Executes the atomic sliding-window Lua rate limiter script on Redis.
 *
 * Hash tag formatting: rl:{<scope>:<id>}
 * Guarantees that current and adjacent window keys hash to the same cluster slot.
 */
export async function checkRedisLimiter(
  redis: Redis,
  scope: string,
  id: string,
  limit: number,
  windowSec: number
): Promise<RateLimitResult> {
  const hashTagKey = `rl:{${scope}:${id}}`;

  try {
    let result: [number, number, number, number, number];

    if (luaSha) {
      try {
        result = (await redis.evalsha(
          luaSha,
          1,
          hashTagKey,
          String(limit),
          String(windowSec)
        )) as [number, number, number, number, number];
      } catch (err: any) {
        if (err?.message && err.message.includes('NOSCRIPT')) {
          luaSha = null;
          result = (await redis.eval(
            SLIDING_WINDOW_LUA,
            1,
            hashTagKey,
            String(limit),
            String(windowSec)
          )) as [number, number, number, number, number];
        } else {
          throw err;
        }
      }
    } else {
      result = (await redis.eval(
        SLIDING_WINDOW_LUA,
        1,
        hashTagKey,
        String(limit),
        String(windowSec)
      )) as [number, number, number, number, number];
    }

    const [allowedNum, retLimit, remaining, resetSeconds, retryAfterSeconds] = result;

    return {
      allowed: allowedNum === 1,
      limit: Number(retLimit),
      remaining: Number(remaining),
      resetSeconds: Number(resetSeconds),
      retryAfterSeconds: Number(retryAfterSeconds),
    };
  } catch (error) {
    throw error;
  }
}
