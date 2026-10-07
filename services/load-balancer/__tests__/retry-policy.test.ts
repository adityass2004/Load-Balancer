import { describe, it, expect } from 'vitest';
import { isIdempotentMethod } from '../retry-policy';

describe('retry-policy: isIdempotentMethod', () => {
  it('returns true for standard idempotent HTTP methods', () => {
    expect(isIdempotentMethod('GET')).toBe(true);
    expect(isIdempotentMethod('HEAD')).toBe(true);
    expect(isIdempotentMethod('OPTIONS')).toBe(true);
    expect(isIdempotentMethod('PUT')).toBe(true);
    expect(isIdempotentMethod('DELETE')).toBe(true);
  });

  it('normalizes lowercase methods to uppercase', () => {
    expect(isIdempotentMethod('get')).toBe(true);
    expect(isIdempotentMethod('head')).toBe(true);
    expect(isIdempotentMethod('options')).toBe(true);
    expect(isIdempotentMethod('put')).toBe(true);
    expect(isIdempotentMethod('delete')).toBe(true);
  });

  it('returns false for non-idempotent methods (POST, PATCH)', () => {
    expect(isIdempotentMethod('POST')).toBe(false);
    expect(isIdempotentMethod('post')).toBe(false);
    expect(isIdempotentMethod('PATCH')).toBe(false);
    expect(isIdempotentMethod('patch')).toBe(false);
  });

  it('fails safe and returns false for unknown, custom, or empty methods', () => {
    expect(isIdempotentMethod('CONNECT')).toBe(false);
    expect(isIdempotentMethod('TRACE')).toBe(false);
    expect(isIdempotentMethod('FOO')).toBe(false);
    expect(isIdempotentMethod('CUSTOM')).toBe(false);
    expect(isIdempotentMethod('')).toBe(false);
    expect(isIdempotentMethod(null)).toBe(false);
    expect(isIdempotentMethod(undefined)).toBe(false);
  });
});
