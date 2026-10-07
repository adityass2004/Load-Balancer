import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { getClientIp } from '../client-ip';

describe('getClientIp', () => {
  const originalEnv = process.env.TRUSTED_PROXY_HOPS;

  beforeEach(() => {
    delete process.env.TRUSTED_PROXY_HOPS;
  });

  afterEach(() => {
    if (originalEnv !== undefined) {
      process.env.TRUSTED_PROXY_HOPS = originalEnv;
    } else {
      delete process.env.TRUSTED_PROXY_HOPS;
    }
  });

  it('ignores spoofed leftmost X-Forwarded-For when TRUSTED_PROXY_HOPS=1 and picks the rightmost client IP', () => {
    process.env.TRUSTED_PROXY_HOPS = '1';
    const req = new Request('http://localhost/test', {
      headers: {
        'x-forwarded-for': '1.2.3.4, 203.0.113.195',
      },
    });

    const ip = getClientIp(req);
    expect(ip).toBe('203.0.113.195');
  });

  it('extracts IP 2 hops from the right when TRUSTED_PROXY_HOPS=2', () => {
    process.env.TRUSTED_PROXY_HOPS = '2';
    const req = new Request('http://localhost/test', {
      headers: {
        'x-forwarded-for': '1.2.3.4, 198.51.100.5, 203.0.113.195',
      },
    });

    const ip = getClientIp(req);
    expect(ip).toBe('198.51.100.5');
  });

  it('falls back to x-real-ip when x-forwarded-for is missing', () => {
    const req = new Request('http://localhost/test', {
      headers: {
        'x-real-ip': '198.51.100.22',
      },
    });

    const ip = getClientIp(req);
    expect(ip).toBe('198.51.100.22');
  });

  it('falls back to unknown when both headers are missing', () => {
    const req = new Request('http://localhost/test');
    const ip = getClientIp(req);
    expect(ip).toBe('unknown');
  });

  it('returns unknown if the resolved IP is syntactically invalid', () => {
    const req = new Request('http://localhost/test', {
      headers: {
        'x-forwarded-for': 'invalid-ip-string, <script>alert(1)</script>',
      },
    });

    const ip = getClientIp(req);
    expect(ip).toBe('unknown');
  });

  it('accepts valid IPv6 addresses', () => {
    const req = new Request('http://localhost/test', {
      headers: {
        'x-forwarded-for': '2001:0db8:85a3:0000:0000:8a2e:0370:7334',
      },
    });

    const ip = getClientIp(req);
    expect(ip).toBe('2001:0db8:85a3:0000:0000:8a2e:0370:7334');
  });
});

import { rateLimitKeyForIp } from '../client-ip';

describe('rateLimitKeyForIp', () => {
  it('keeps valid IPv4 as is', () => {
    expect(rateLimitKeyForIp('192.168.1.100')).toBe('192.168.1.100');
    expect(rateLimitKeyForIp('10.0.0.1')).toBe('10.0.0.1');
  });

  it('converts IPv4-mapped IPv6 (::ffff:a.b.c.d) to IPv4', () => {
    expect(rateLimitKeyForIp('::ffff:192.0.2.128')).toBe('192.0.2.128');
    expect(rateLimitKeyForIp('::FFFF:10.1.2.3')).toBe('10.1.2.3');
  });

  it('normalizes compressed and expanded forms of the same /64 to the identical key', () => {
    const compressed = '2001:db8:85a3::8a2e:370:7334';
    const expanded = '2001:0db8:85a3:0000:0000:8a2e:0370:7334';
    const key1 = rateLimitKeyForIp(compressed);
    const key2 = rateLimitKeyForIp(expanded);

    expect(key1).toBe('2001:0db8:85a3:0000');
    expect(key2).toBe('2001:0db8:85a3:0000');
    expect(key1).toBe(key2);
  });

  it('maps different /64 prefixes to different keys', () => {
    const key1 = rateLimitKeyForIp('2001:db8:abcd:0001::1');
    const key2 = rateLimitKeyForIp('2001:db8:abcd:0002::1');
    expect(key1).not.toBe(key2);
    expect(key1).toBe('2001:0db8:abcd:0001');
    expect(key2).toBe('2001:0db8:abcd:0002');
  });

  it('converts garbage or invalid IP strings to "unknown"', () => {
    expect(rateLimitKeyForIp('garbage-ip')).toBe('unknown');
    expect(rateLimitKeyForIp('')).toBe('unknown');
    expect(rateLimitKeyForIp('999.999.999.999')).toBe('unknown');
    expect(rateLimitKeyForIp('unknown')).toBe('unknown');
  });
});

