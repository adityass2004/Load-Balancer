/**
 * lib/security/__tests__/ssrf-guard.test.ts
 *
 * Table-driven unit tests for classifyAddress and validateBackendUrl.
 * DNS is mocked so no real network calls are made.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// ── Mock dns module before importing ssrf-guard ───────────────────────────────
vi.mock('dns', () => {
  const actualDns = {
    lookup: vi.fn(),
  };
  return actualDns;
});

import * as dns from 'dns';

import {
  classifyAddress,
  validateBackendUrl,
  getSafeAgents,
  createGuardedLookup,
  getSsrfConfig,
  getBackendConnectTimeoutMs,
  SsrfBlockedError,
  resetSsrfConfigForTesting,
  resetSafeAgentsForTesting,
} from '../ssrf-guard';

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Set process.env keys and return a cleanup function.
 * Call after resetSsrfConfigForTesting() so config is re-read.
 */
function withEnv(vars: Record<string, string | undefined>) {
  const original: Record<string, string | undefined> = {};
  for (const [k, v] of Object.entries(vars)) {
    original[k] = process.env[k];
    if (v === undefined) {
      delete process.env[k];
    } else {
      process.env[k] = v;
    }
  }
  return () => {
    for (const [k, v] of Object.entries(original)) {
      if (v === undefined) {
        delete process.env[k];
      } else {
        process.env[k] = v;
      }
    }
  };
}

/** Mock dns.lookup to call callback with the given addresses */
function mockDnsAddresses(addresses: Array<{ address: string; family: 4 | 6 }>) {
  vi.mocked(dns.lookup).mockImplementation((...args: any[]) => {
    const callback = args[args.length - 1];
    if (typeof callback === 'function') {
      callback(null, addresses);
    }
  });
}

/** Mock dns.lookup to call callback with an error */
function mockDnsError(errCode: string) {
  vi.mocked(dns.lookup).mockImplementation((...args: any[]) => {
    const callback = args[args.length - 1];
    if (typeof callback === 'function') {
      const err = Object.assign(new Error('DNS error'), { code: errCode });
      callback(err, null);
    }
  });
}

// ── Setup / teardown ──────────────────────────────────────────────────────────

beforeEach(() => {
  resetSsrfConfigForTesting();
  resetSafeAgentsForTesting();
  vi.clearAllMocks();
  // Default: development, no loopback, no extra CIDRs
  (process.env as any).NODE_ENV = 'test';
  delete process.env.BACKEND_ALLOW_LOOPBACK;
  delete process.env.BACKEND_ALLOWED_PRIVATE_CIDRS;
});

afterEach(() => {
  resetSsrfConfigForTesting();
  resetSafeAgentsForTesting();
});

// ═══════════════════════════════════════════════════════════════════════════════
// classifyAddress — table-driven
// ═══════════════════════════════════════════════════════════════════════════════

describe('classifyAddress', () => {
  describe('always-blocked IPs (no allowlist can unlock these)', () => {
    const cases: Array<[string, string]> = [
      ['0.0.0.0', 'this-network'],
      ['0.255.255.255', 'this-network'],
      ['169.254.169.254', 'cloud-metadata'],
      ['169.254.170.2', 'cloud-metadata'],
      ['100.100.100.200', 'cloud-metadata'],
      ['168.63.129.16', 'cloud-metadata'],
      ['169.254.0.1', 'link-local/cloud-metadata'],
      ['224.0.0.1', 'multicast'],
      ['239.255.255.255', 'multicast'],
      ['240.0.0.0', 'reserved-future'],
      ['255.255.255.255', 'broadcast'],
      ['192.0.0.1', 'ietf-protocol'],
      ['192.0.2.1', 'documentation'],
      ['198.51.100.1', 'documentation'],
      ['203.0.113.1', 'documentation'],
      ['192.88.99.1', '6to4-anycast'],
      ['198.18.0.1', 'benchmarking'],
      ['198.19.255.255', 'benchmarking'],
    ];

    it.each(cases)('%s → blocked (category contains %s)', (ip, catFragment) => {
      const result = classifyAddress(ip);
      expect(result.blocked, `${ip} should be blocked`).toBe(true);
      expect(result.category).toContain(catFragment);
    });
  });

  describe('default-blocked IPs (allowlisted if env var set)', () => {
    const cases: string[] = [
      '10.0.0.1',
      '10.255.255.255',
      '172.16.0.1',
      '172.31.255.255',
      '192.168.1.1',
      '100.64.0.1',
      '100.127.255.255',
      '127.0.0.1',
      '127.255.255.255',
    ];

    it.each(cases)('%s → blocked by default', (ip) => {
      const result = classifyAddress(ip);
      expect(result.blocked, `${ip} should be blocked by default`).toBe(true);
    });
  });

  describe('public IPs — allowed', () => {
    const cases: string[] = [
      '8.8.8.8',
      '1.1.1.1',
      '172.32.0.1',    // just outside 172.16/12
      '172.15.255.255', // just below 172.16 — wait, 172.15 IS public
      '11.0.0.1',       // 11.x is not in 10/8 — public
    ];

    it.each(cases)('%s → allowed (public)', (ip) => {
      const result = classifyAddress(ip);
      expect(result.blocked, `${ip} should not be blocked`).toBe(false);
    });
  });

  describe('IPv6 special cases', () => {
    it('::1 → blocked (loopback)', () => {
      const r = classifyAddress('::1');
      expect(r.blocked).toBe(true);
      expect(r.category).toContain('loopback');
    });

    it('fe80::1 → blocked (link-local)', () => {
      const r = classifyAddress('fe80::1');
      expect(r.blocked).toBe(true);
      expect(r.category).toContain('link-local');
    });

    it('ff00::1 → blocked (multicast)', () => {
      const r = classifyAddress('ff00::1');
      expect(r.blocked).toBe(true);
      expect(r.category).toContain('multicast');
    });

    it('2001:db8::1 → blocked (documentation)', () => {
      const r = classifyAddress('2001:db8::1');
      expect(r.blocked).toBe(true);
      expect(r.category).toContain('documentation');
    });

    it('fc00::1 → blocked (private ULA)', () => {
      const r = classifyAddress('fc00::1');
      expect(r.blocked).toBe(true);
      expect(r.category).toContain('private-ula');
    });

    it('fd00::1 → blocked (private ULA fc00::/7)', () => {
      const r = classifyAddress('fd00::1');
      expect(r.blocked).toBe(true);
    });

    it('2606:4700:4700::1111 → allowed (Cloudflare public DNS)', () => {
      const r = classifyAddress('2606:4700:4700::1111');
      expect(r.blocked).toBe(false);
    });

    describe('IPv4-mapped (::ffff:...)', () => {
      it('::ffff:127.0.0.1 → blocked (embedded loopback)', () => {
        const r = classifyAddress('::ffff:127.0.0.1');
        expect(r.blocked).toBe(true);
        expect(r.category).toContain('loopback');
      });

      it('::ffff:7f00:1 (hex form of 127.0.0.1) → blocked', () => {
        const r = classifyAddress('::ffff:7f00:1');
        expect(r.blocked).toBe(true);
        expect(r.category).toContain('loopback');
      });

      it('::ffff:169.254.169.254 → blocked (cloud metadata via IPv4-mapped)', () => {
        const r = classifyAddress('::ffff:169.254.169.254');
        expect(r.blocked).toBe(true);
      });
    });

    describe('NAT64 64:ff9b::', () => {
      it('64:ff9b::7f00:1 → blocked (embedded 127.0.0.1)', () => {
        const r = classifyAddress('64:ff9b::7f00:1');
        expect(r.blocked).toBe(true);
        expect(r.category).toContain('loopback');
      });
    });

    describe('6to4 2002::/16', () => {
      it('2002:7f00:1:: → blocked (embedded 127.0.0.1)', () => {
        const r = classifyAddress('2002:7f00:1::');
        expect(r.blocked).toBe(true);
        expect(r.category).toContain('loopback');
      });
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// validateBackendUrl — blocked cases
// ═══════════════════════════════════════════════════════════════════════════════

describe('validateBackendUrl — blocked URLs', () => {
  // For literal IPs, dns.lookup is NOT called (classified directly).
  // We mock it anyway so if it IS called unexpectedly the test fails fast.

  describe('loopback / localhost (blocked by default, no BACKEND_ALLOW_LOOPBACK)', () => {
    const cases: string[] = [
      'http://127.0.0.1',
      'http://127.0.0.1:4001',
      'http://localhost',
      'http://LOCALHOST.',
      'http://foo.localhost',
      'http://[::1]',
      'http://127.1',         // short-form loopback — WHATWG normalizes to 127.0.0.1
    ];

    it.each(cases)('%s → rejected', async (url) => {
      const result = await validateBackendUrl(url);
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.reason).toBeTruthy();
      }
    });
  });

  describe('cloud metadata endpoints', () => {
    const cases = [
      'http://169.254.169.254/latest/meta-data',
      'http://169.254.169.254',
      'http://100.100.100.200',
      'http://168.63.129.16',
    ];

    it.each(cases)('%s → rejected (always-blocked)', async (url) => {
      const result = await validateBackendUrl(url);
      expect(result.ok).toBe(false);
    });
  });

  describe('metadata hostnames', () => {
    it('http://metadata.google.internal → rejected', async () => {
      const result = await validateBackendUrl('http://metadata.google.internal');
      expect(result.ok).toBe(false);
    });
  });

  describe('IPv6 literal IPs — blocked', () => {
    const cases = [
      'http://[::1]',
      'http://[fd00:ec2::254]',
      'http://[::ffff:127.0.0.1]',
      'http://[::ffff:7f00:1]',
      'http://[::ffff:169.254.169.254]',
      'http://[64:ff9b::7f00:1]',
      'http://[2002:7f00:1::]',
      'http://[fe80::1]',
      'http://[fc00::1]',
    ];

    it.each(cases)('%s → rejected', async (url) => {
      const result = await validateBackendUrl(url);
      expect(result.ok).toBe(false);
    });
  });

  describe('decimal / octal / hex obfuscated IPs', () => {
    it('http://0 → rejected (WHATWG normalizes to 0.0.0.0)', async () => {
      const result = await validateBackendUrl('http://0');
      expect(result.ok).toBe(false);
    });

    it('http://0.0.0.0 → rejected', async () => {
      const result = await validateBackendUrl('http://0.0.0.0');
      expect(result.ok).toBe(false);
    });

    it('http://2130706433 → rejected (decimal 127.0.0.1)', async () => {
      const result = await validateBackendUrl('http://2130706433');
      expect(result.ok).toBe(false);
    });

    it('http://0x7f000001 → rejected (hex 127.0.0.1)', async () => {
      const result = await validateBackendUrl('http://0x7f000001');
      expect(result.ok).toBe(false);
    });

    it('http://0177.0.0.1 → rejected (octal 127)', async () => {
      const result = await validateBackendUrl('http://0177.0.0.1');
      expect(result.ok).toBe(false);
    });
  });

  describe('private ranges blocked by default', () => {
    const cases = [
      'http://10.0.0.5',
      'http://172.16.0.1',
      'http://172.31.255.255',
      'http://192.168.1.1',
      'http://100.64.0.1',
    ];

    it.each(cases)('%s → rejected (private range, no allowlist)', async (url) => {
      const result = await validateBackendUrl(url);
      expect(result.ok).toBe(false);
    });
  });

  describe('credential injection', () => {
    it('http://user:pass@example.com → rejected', async () => {
      const result = await validateBackendUrl('http://user:pass@example.com');
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.reason).toContain('credential');
    });

    it('http://evil.com@127.0.0.1 — WHATWG parses host as 127.0.0.1, should be rejected', async () => {
      // WHATWG URL: new URL('http://evil.com@127.0.0.1').hostname === '127.0.0.1'
      // username === 'evil.com'
      const result = await validateBackendUrl('http://evil.com@127.0.0.1');
      expect(result.ok).toBe(false);
    });
  });

  describe('bad schemes', () => {
    const cases = ['file:///etc/passwd', 'ftp://x', 'gopher://x', 'data:text/html,<h1>x</h1>'];
    it.each(cases)('%s → rejected (bad scheme)', async (url) => {
      const result = await validateBackendUrl(url);
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.reason).toContain('scheme');
    });
  });

  describe('hostname resolving to blocked IP', () => {
    it('hostname whose DNS returns [public, private] → blocked (mixed records)', async () => {
      mockDnsAddresses([
        { address: '8.8.8.8', family: 4 },
        { address: '10.0.0.1', family: 4 },
      ]);
      const result = await validateBackendUrl('http://evil-split.example.com');
      expect(result.ok).toBe(false);
    });

    it('hostname whose DNS returns 127.0.0.1 (nip.io style) → blocked', async () => {
      mockDnsAddresses([{ address: '127.0.0.1', family: 4 }]);
      const result = await validateBackendUrl('http://127.0.0.1.nip.io');
      expect(result.ok).toBe(false);
    });

    it('unresolvable hostname → rejected with "cannot be resolved" reason', async () => {
      mockDnsError('ENOTFOUND');
      const result = await validateBackendUrl('http://this-does-not-exist-at-all.invalid');
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.reason).toContain('cannot be resolved');
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// validateBackendUrl — allowed cases
// ═══════════════════════════════════════════════════════════════════════════════

describe('validateBackendUrl — allowed URLs', () => {
  it('http://8.8.8.8 → allowed (public IP)', async () => {
    const result = await validateBackendUrl('http://8.8.8.8');
    expect(result.ok).toBe(true);
  });

  it('http://172.32.0.1 → allowed (just outside 172.16/12 range)', async () => {
    const result = await validateBackendUrl('http://172.32.0.1');
    expect(result.ok).toBe(true);
  });

  it('https://example.com → allowed when DNS resolves to public IP', async () => {
    mockDnsAddresses([{ address: '93.184.216.34', family: 4 }]);
    const result = await validateBackendUrl('https://example.com');
    expect(result.ok).toBe(true);
  });

  it('http://[2606:4700:4700::1111] → allowed (Cloudflare public IPv6)', async () => {
    const result = await validateBackendUrl('http://[2606:4700:4700::1111]');
    expect(result.ok).toBe(true);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// Allowlist behavior
// ═══════════════════════════════════════════════════════════════════════════════

describe('BACKEND_ALLOWED_PRIVATE_CIDRS allowlist', () => {
  it('10.20.5.5 passes when 10.20.0.0/16 is allowlisted', async () => {
    const restore = withEnv({ BACKEND_ALLOWED_PRIVATE_CIDRS: '10.20.0.0/16' });
    resetSsrfConfigForTesting();
    try {
      const result = await validateBackendUrl('http://10.20.5.5');
      expect(result.ok).toBe(true);
    } finally {
      restore();
      resetSsrfConfigForTesting();
    }
  });

  it('10.21.0.1 is blocked when only 10.20.0.0/16 is allowlisted', async () => {
    const restore = withEnv({ BACKEND_ALLOWED_PRIVATE_CIDRS: '10.20.0.0/16' });
    resetSsrfConfigForTesting();
    try {
      const result = await validateBackendUrl('http://10.21.0.1');
      expect(result.ok).toBe(false);
    } finally {
      restore();
      resetSsrfConfigForTesting();
    }
  });

  it('169.254.169.254 stays blocked even if 169.254.0.0/16 is listed (startup error)', () => {
    const restore = withEnv({ BACKEND_ALLOWED_PRIVATE_CIDRS: '169.254.0.0/16' });
    resetSsrfConfigForTesting();
    try {
      // Loading config with an always-blocked CIDR should throw at startup
      expect(() => {
        getSsrfConfig();
      }).toThrow(/always-blocked range/i);
    } finally {
      restore();
      resetSsrfConfigForTesting();
    }
  });
});

describe('BACKEND_ALLOW_LOOPBACK', () => {
  it('allows 127.0.0.1 in dev when BACKEND_ALLOW_LOOPBACK=true', async () => {
    const restore = withEnv({
      BACKEND_ALLOW_LOOPBACK: 'true',
      NODE_ENV: 'development',
    });
    resetSsrfConfigForTesting();
    try {
      const result = await validateBackendUrl('http://127.0.0.1:4001');
      expect(result.ok).toBe(true);
    } finally {
      restore();
      resetSsrfConfigForTesting();
    }
  });

  it('allows localhost in dev when BACKEND_ALLOW_LOOPBACK=true', async () => {
    const restore = withEnv({
      BACKEND_ALLOW_LOOPBACK: 'true',
      NODE_ENV: 'development',
    });
    resetSsrfConfigForTesting();
    try {
      const result = await validateBackendUrl('http://localhost:4001');
      expect(result.ok).toBe(true);
    } finally {
      restore();
      resetSsrfConfigForTesting();
    }
  });

  it('throws startup error if BACKEND_ALLOW_LOOPBACK=true and NODE_ENV=production', () => {
    const restore = withEnv({
      BACKEND_ALLOW_LOOPBACK: 'true',
      NODE_ENV: 'production',
    });
    resetSsrfConfigForTesting();
    try {
      expect(() => {
        getSsrfConfig();
      }).toThrow(/production/i);
    } finally {
      restore();
      resetSsrfConfigForTesting();
    }
  });

  it('classifyAddress with loopback allowed: 127.0.0.1 → not blocked', () => {
    const restore = withEnv({
      BACKEND_ALLOW_LOOPBACK: 'true',
      NODE_ENV: 'development',
    });
    resetSsrfConfigForTesting();
    try {
      const r = classifyAddress('127.0.0.1');
      expect(r.blocked).toBe(false);
      expect(r.category).toContain('loopback');
    } finally {
      restore();
      resetSsrfConfigForTesting();
    }
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// Connect-time guard — createGuardedLookup
// ═══════════════════════════════════════════════════════════════════════════════

describe('createGuardedLookup — connect-time DNS rebinding protection', () => {
  it('blocks when dns resolves to a private IP', async () => {
    mockDnsAddresses([{ address: '10.0.0.1', family: 4 }]);

    const lookup = createGuardedLookup('server-test');
    await new Promise<void>((resolve, reject) => {
      lookup('internal.example.com', {}, (err: any) => {
        try {
          expect(err).toBeTruthy();
          expect(err.code).toBe('SSRF_BLOCKED');
          resolve();
        } catch (e) {
          reject(e);
        }
      });
    });
  });

  it('passes when dns resolves to a public IP', async () => {
    mockDnsAddresses([{ address: '8.8.8.8', family: 4 }]);

    const lookup = createGuardedLookup('server-test');
    await new Promise<void>((resolve, reject) => {
      lookup('public.example.com', {}, (err: any, address: string, family: number) => {
        try {
          expect(err).toBeNull();
          expect(address).toBe('8.8.8.8');
          expect(family).toBe(4);
          resolve();
        } catch (e) {
          reject(e);
        }
      });
    });
  });

  it('DNS rebinding simulation: blocks when second lookup returns private IP', async () => {
    // First call: public IP (registration allowed)
    // Second call: private IP (simulates rebinding at connect time)
    let callCount = 0;
    vi.mocked(dns.lookup).mockImplementation((...args: any[]) => {
      const callback = args[args.length - 1];
      callCount++;
      if (callCount === 1) {
        callback(null, [{ address: '8.8.8.8', family: 4 }]);
      } else {
        callback(null, [{ address: '192.168.1.1', family: 4 }]);
      }
    });

    const lookup = createGuardedLookup();

    await new Promise<void>((resolve, reject) => {
      // First lookup: should pass
      lookup('rebind.example.com', {}, (err1: any) => {
        try {
          expect(err1).toBeNull();
        } catch (e) {
          return reject(e);
        }

        // Second lookup (simulates new connection after rebind): should fail
        lookup('rebind.example.com', {}, (err2: any) => {
          try {
            expect(err2).toBeTruthy();
            expect(err2.code).toBe('SSRF_BLOCKED');
            resolve();
          } catch (e) {
            reject(e);
          }
        });
      });
    });
  });

  it('passes addresses array when options.all=true', async () => {
    mockDnsAddresses([
      { address: '8.8.8.8', family: 4 },
      { address: '8.8.4.4', family: 4 },
    ]);

    const lookup = createGuardedLookup();
    await new Promise<void>((resolve, reject) => {
      lookup('multi.example.com', { all: true } as dns.LookupAllOptions, (err: any, addresses: any) => {
        try {
          expect(err).toBeNull();
          expect(Array.isArray(addresses)).toBe(true);
          expect(addresses.length).toBe(2);
          resolve();
        } catch (e) {
          reject(e);
        }
      });
    });
  });

  it('redirect to a HOSTNAME that resolves to a private IP is blocked by guarded agent lookup (A4.3)', async () => {
    mockDnsAddresses([{ address: '10.0.0.5', family: 4 }]);

    const lookup = createGuardedLookup('redirect-test-server');
    await new Promise<void>((resolve, reject) => {
      lookup('internal-server.corp', {}, (err: any) => {
        try {
          expect(err).toBeTruthy();
          expect(err.code).toBe('SSRF_BLOCKED');
          expect(err.category).toBe('private-rfc1918');
          resolve();
        } catch (e) {
          reject(e);
        }
      });
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// getSafeAgents — agent configuration
// ═══════════════════════════════════════════════════════════════════════════════

describe('getSafeAgents', () => {
  it('returns httpAgent and httpsAgent objects', () => {
    const agents = getSafeAgents();
    expect(agents.httpAgent).toBeDefined();
    expect(agents.httpsAgent).toBeDefined();
  });

  it('returns the same singleton on repeated calls', () => {
    const agents1 = getSafeAgents();
    const agents2 = getSafeAgents();
    expect(agents1.httpAgent).toBe(agents2.httpAgent);
    expect(agents1.httpsAgent).toBe(agents2.httpsAgent);
  });

  it('agents have a lookup property set (guarded lookup)', () => {
    const agents = getSafeAgents();
    // Node's http.Agent stores options.lookup — verify it is a function
    expect(typeof (agents.httpAgent as any).options?.lookup).toBe('function');
    expect(typeof (agents.httpsAgent as any).options?.lookup).toBe('function');
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// SsrfBlockedError
// ═══════════════════════════════════════════════════════════════════════════════

describe('SsrfBlockedError', () => {
  it('has the correct name and category', () => {
    const err = new SsrfBlockedError('loopback', 'server-abc');
    expect(err.name).toBe('SsrfBlockedError');
    expect(err.category).toBe('loopback');
    expect(err.serverId).toBe('server-abc');
    expect(err instanceof Error).toBe(true);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// Edge cases — empty host, over-long URL
// ═══════════════════════════════════════════════════════════════════════════════

describe('validateBackendUrl — edge cases', () => {
  it('URL over 2048 chars → rejected', async () => {
    const longUrl = 'http://example.com/' + 'a'.repeat(2050);
    const result = await validateBackendUrl(longUrl);
    expect(result.ok).toBe(false);
  });

  it('empty string → rejected', async () => {
    const result = await validateBackendUrl('');
    expect(result.ok).toBe(false);
  });

  it('URL without host → rejected', async () => {
    const result = await validateBackendUrl('http:///path');
    expect(result.ok).toBe(false);
  });
});

describe('BACKEND_ALLOWED_PRIVATE_CIDRS loopback restrictions in production', () => {
  it('throws in production when BACKEND_ALLOWED_PRIVATE_CIDRS contains 127.0.0.0/8', () => {
    resetSsrfConfigForTesting();
    const cleanup = withEnv({
      NODE_ENV: 'production',
      BACKEND_ALLOWED_PRIVATE_CIDRS: '127.0.0.0/8',
    });
    expect(() => getSsrfConfig()).toThrow(
      /FATAL: BACKEND_ALLOWED_PRIVATE_CIDRS entry "127.0.0.0\/8" specifies a loopback range in production/
    );
    cleanup();
  });

  it('throws in production when BACKEND_ALLOWED_PRIVATE_CIDRS contains ::1/128', () => {
    resetSsrfConfigForTesting();
    const cleanup = withEnv({
      NODE_ENV: 'production',
      BACKEND_ALLOWED_PRIVATE_CIDRS: '::1/128',
    });
    expect(() => getSsrfConfig()).toThrow(
      /FATAL: BACKEND_ALLOWED_PRIVATE_CIDRS entry "::1\/128" specifies a loopback range in production/
    );
    cleanup();
  });

  it('allows 127.0.0.0/8 in development mode', () => {
    resetSsrfConfigForTesting();
    const cleanup = withEnv({
      NODE_ENV: 'development',
      BACKEND_ALLOWED_PRIVATE_CIDRS: '127.0.0.0/8',
    });
    expect(() => getSsrfConfig()).not.toThrow();
    const res = classifyAddress('127.0.0.1');
    expect(res.blocked).toBe(false);
    expect(res.category).toContain('allowed-cidr');
    cleanup();
  });

  it('allows ::1/128 in development mode', () => {
    resetSsrfConfigForTesting();
    const cleanup = withEnv({
      NODE_ENV: 'development',
      BACKEND_ALLOWED_PRIVATE_CIDRS: '::1/128',
    });
    expect(() => getSsrfConfig()).not.toThrow();
    const res = classifyAddress('::1');
    expect(res.blocked).toBe(false);
    expect(res.category).toContain('allowed-cidr');
    cleanup();
  });
});

describe('getBackendConnectTimeoutMs', () => {
  it('returns default 2000 ms when BACKEND_CONNECT_TIMEOUT_MS is unset', () => {
    resetSsrfConfigForTesting();
    const cleanup = withEnv({ BACKEND_CONNECT_TIMEOUT_MS: undefined });
    expect(getBackendConnectTimeoutMs()).toBe(2000);
    cleanup();
  });

  it('returns parsed number when BACKEND_CONNECT_TIMEOUT_MS is set to a valid integer string', () => {
    resetSsrfConfigForTesting();
    const cleanup = withEnv({ BACKEND_CONNECT_TIMEOUT_MS: '1500' });
    expect(getBackendConnectTimeoutMs()).toBe(1500);
    cleanup();
  });

  it('falls back to 2000 ms if BACKEND_CONNECT_TIMEOUT_MS is invalid or below 100', () => {
    resetSsrfConfigForTesting();
    const cleanup = withEnv({ BACKEND_CONNECT_TIMEOUT_MS: 'invalid' });
    expect(getBackendConnectTimeoutMs()).toBe(2000);
    cleanup();
  });
});

