/**
 * lib/security/ssrf-guard.ts
 *
 * Central SSRF protection module.  No Next.js imports so this file
 * can be unit-tested in Node without the Next.js runtime.
 *
 * Exports
 *   classifyAddress(ip)          → { blocked: boolean, category: string }
 *   validateBackendUrl(raw)      → Promise<{ ok: true; url: URL } | { ok: false; reason: string }>
 *   createGuardedLookup()        → dns.LookupFunction compatible callback for http/https agents
 *   getSafeAgents()              → { httpAgent, httpsAgent } — shared, create once
 *   class SsrfBlockedError
 */

import * as dns from 'dns';
import * as net from 'net';
import * as http from 'http';
import * as https from 'https';
import { z } from 'zod';

// ─── Typed error ─────────────────────────────────────────────────────────────

export class SsrfBlockedError extends Error {
  public readonly category: string;
  public readonly serverId?: string;

  constructor(category: string, serverId?: string) {
    super('SSRF: outbound request to disallowed network address blocked');
    this.name = 'SsrfBlockedError';
    this.category = category;
    this.serverId = serverId;
  }
}

// ─── Env config (validated once at module load) ───────────────────────────────

/**
 * Parse and validate SSRF-related env vars using zod.
 * Called lazily so tests can override process.env before import side-effects run.
 */
function loadSsrfConfig(): SsrfConfig {
  const schema = z.object({
    BACKEND_ALLOWED_PRIVATE_CIDRS: z.string().optional().default(''),
    BACKEND_ALLOW_LOOPBACK: z
      .enum(['true', 'false', ''])
      .optional()
      .default('false'),
    BACKEND_CONNECT_TIMEOUT_MS: z
      .string()
      .optional()
      .default('2000')
      .transform((val) => {
        const parsed = parseInt(val || '2000', 10);
        return isNaN(parsed) || parsed < 100 ? 2000 : parsed;
      }),
    NODE_ENV: z.string().optional().default('development'),
  });

  const parsed = schema.safeParse({
    BACKEND_ALLOWED_PRIVATE_CIDRS: process.env.BACKEND_ALLOWED_PRIVATE_CIDRS ?? '',
    BACKEND_ALLOW_LOOPBACK: process.env.BACKEND_ALLOW_LOOPBACK ?? 'false',
    BACKEND_CONNECT_TIMEOUT_MS: process.env.BACKEND_CONNECT_TIMEOUT_MS ?? '2000',
    NODE_ENV: process.env.NODE_ENV ?? 'development',
  });

  if (!parsed.success) {
    throw new Error(
      `[SSRF] Invalid SSRF env configuration: ${parsed.error.message}`
    );
  }

  const allowLoopback = parsed.data.BACKEND_ALLOW_LOOPBACK === 'true';
  const isProduction = parsed.data.NODE_ENV === 'production';
  const connectTimeoutMs = parsed.data.BACKEND_CONNECT_TIMEOUT_MS;

  // Loopback in production is a hard startup error
  if (allowLoopback && isProduction) {
    throw new Error(
      '[SSRF] FATAL: BACKEND_ALLOW_LOOPBACK=true is set in a production environment. ' +
        'This is not allowed. Remove the variable or set it to false before starting in production.'
    );
  }

  // Parse additional allowed CIDRs
  const allowedPrivateCidrs: Array<{ network: string; prefix: number }> = [];
  const rawCidrs = parsed.data.BACKEND_ALLOWED_PRIVATE_CIDRS;
  if (rawCidrs) {
    for (const raw of rawCidrs.split(',').map((s) => s.trim()).filter(Boolean)) {
      const [addr, prefixStr] = raw.split('/');
      const prefix = parseInt(prefixStr ?? '32', 10);

      if (!net.isIP(addr)) {
        throw new Error(
          `[SSRF] Invalid CIDR in BACKEND_ALLOWED_PRIVATE_CIDRS: "${raw}"`
        );
      }

      // Reject CIDRs that overlap always-blocked ranges
      const check = classifyAddressRaw(addr);
      if (check.alwaysBlocked) {
        throw new Error(
          `[SSRF] BACKEND_ALLOWED_PRIVATE_CIDRS entry "${raw}" overlaps an always-blocked range (${check.category}). Remove it.`
        );
      }

      // Loopback range rejection in production mode
      const isLoopbackAddr =
        check.category === 'loopback' ||
        check.category.endsWith(':loopback') ||
        check.category === 'ipv6-carrier:loopback';

      if (isLoopbackAddr && isProduction) {
        throw new Error(
          `[SSRF] FATAL: BACKEND_ALLOWED_PRIVATE_CIDRS entry "${raw}" specifies a loopback range in production. Loopback access is forbidden in production.`
        );
      }

      allowedPrivateCidrs.push({ network: addr, prefix });
    }
  }

  return { allowLoopback, isProduction, allowedPrivateCidrs, connectTimeoutMs };
}

interface SsrfConfig {
  allowLoopback: boolean;
  isProduction: boolean;
  allowedPrivateCidrs: Array<{ network: string; prefix: number }>;
  connectTimeoutMs: number;
}

export function getBackendConnectTimeoutMs(): number {
  return getSsrfConfig().connectTimeoutMs;
}

// Lazily-initialized singleton config (reset in tests via resetSsrfConfigForTesting)
let _config: SsrfConfig | null = null;

export function getSsrfConfig(): SsrfConfig {
  if (!_config) {
    _config = loadSsrfConfig();
  }
  return _config;
}

/** Call this in tests BEFORE importing or calling any guard function. */
export function resetSsrfConfigForTesting(): void {
  _config = null;
}

// ─── CIDR helpers ─────────────────────────────────────────────────────────────

function ipv4ToNum(ip: string): number {
  const parts = ip.split('.').map(Number);
  return ((parts[0] << 24) | (parts[1] << 16) | (parts[2] << 8) | parts[3]) >>> 0;
}

function cidrContainsIPv4(cidrNetwork: string, cidrPrefix: number, ip: string): boolean {
  const networkNum = ipv4ToNum(cidrNetwork);
  const ipNum = ipv4ToNum(ip);
  const mask = cidrPrefix === 0 ? 0 : (~0 << (32 - cidrPrefix)) >>> 0;
  return (networkNum & mask) === (ipNum & mask);
}

function ipv6ToBuffer(ip: string): Buffer | null {
  // Use Node net.isIPv6 then parse
  try {
    // Expand with a trick: create a UDP socket address - not available
    // Instead parse manually using buffer
    // The cleanest way is to use the `net` module – it doesn't expose a parse,
    // so we use lookup table expansion.
    const expanded = expandIPv6(ip);
    if (!expanded) return null;
    const groups = expanded.split(':');
    if (groups.length !== 8) return null;
    const buf = Buffer.alloc(16);
    for (let i = 0; i < 8; i++) {
      const val = parseInt(groups[i], 16);
      buf.writeUInt16BE(val, i * 2);
    }
    return buf;
  } catch {
    return null;
  }
}

function expandIPv6(ip: string): string | null {
  // Handle :: expansion
  if (ip.includes('::')) {
    const parts = ip.split('::');
    if (parts.length !== 2) return null;
    const left = parts[0] ? parts[0].split(':') : [];
    const right = parts[1] ? parts[1].split(':') : [];
    const missing = 8 - left.length - right.length;
    if (missing < 0) return null;
    const full = [...left, ...Array(missing).fill('0'), ...right];
    return full.map((g) => g.padStart(4, '0')).join(':');
  }
  const groups = ip.split(':');
  if (groups.length !== 8) return null;
  return groups.map((g) => g.padStart(4, '0')).join(':');
}

function cidrContainsIPv6(cidrNetwork: string, cidrPrefix: number, ip: string): boolean {
  const netBuf = ipv6ToBuffer(cidrNetwork);
  const ipBuf = ipv6ToBuffer(ip);
  if (!netBuf || !ipBuf) return false;

  const fullBytes = Math.floor(cidrPrefix / 8);
  const remainder = cidrPrefix % 8;

  for (let i = 0; i < fullBytes; i++) {
    if (netBuf[i] !== ipBuf[i]) return false;
  }
  if (remainder > 0 && fullBytes < 16) {
    const mask = 0xff & (0xff << (8 - remainder));
    if ((netBuf[fullBytes] & mask) !== (ipBuf[fullBytes] & mask)) return false;
  }
  return true;
}

// ─── Core IP classification ────────────────────────────────────────────────────

interface AddressClassification {
  blocked: boolean;
  alwaysBlocked: boolean;
  category: string;
}

const ALWAYS_BLOCKED_IPV4: Array<{ network: string; prefix: number; cat: string }> = [
  { network: '0.0.0.0', prefix: 8, cat: 'this-network' },
  { network: '169.254.0.0', prefix: 16, cat: 'link-local/cloud-metadata' },
  { network: '255.255.255.255', prefix: 32, cat: 'broadcast' },
  { network: '224.0.0.0', prefix: 4, cat: 'multicast' },
  { network: '240.0.0.0', prefix: 4, cat: 'reserved-future' },
  { network: '192.0.0.0', prefix: 24, cat: 'ietf-protocol' },
  { network: '192.0.2.0', prefix: 24, cat: 'documentation' },
  { network: '198.51.100.0', prefix: 24, cat: 'documentation' },
  { network: '203.0.113.0', prefix: 24, cat: 'documentation' },
  { network: '192.88.99.0', prefix: 24, cat: '6to4-anycast' },
  { network: '198.18.0.0', prefix: 15, cat: 'benchmarking' },
];

// Specific metadata IPs (always blocked)
const ALWAYS_BLOCKED_IPV4_SPECIFIC = new Set([
  '169.254.169.254', // AWS IMDS
  '169.254.170.2',   // ECS metadata
  '100.100.100.200', // Alibaba metadata
  '168.63.129.16',   // Azure metadata
]);

const ALWAYS_BLOCKED_IPV6: Array<{ network: string; prefix: number; cat: string }> = [
  { network: '::', prefix: 128, cat: 'unspecified' },
  { network: 'fe80::', prefix: 10, cat: 'link-local' },
  { network: 'ff00::', prefix: 8, cat: 'multicast' },
  { network: '2001:0db8::', prefix: 32, cat: 'documentation' },
  { network: 'fec0::', prefix: 10, cat: 'site-local-deprecated' },
];

// Specific always-blocked IPv6 addresses
const ALWAYS_BLOCKED_IPV6_SPECIFIC = new Set([
  'fd00:0000:0000:0000:0000:0000:00ec:0002', // AWS IMDS IPv6 fd00:ec2::254 expanded
]);

// Normalize fd00:ec2::254 → expand it to match our lookup
const AWS_IMDS_V6_VARIANTS = ['fd00:ec2::254'];

const DEFAULT_BLOCKED_IPV4: Array<{ network: string; prefix: number; cat: string }> = [
  { network: '10.0.0.0', prefix: 8, cat: 'private-rfc1918' },
  { network: '172.16.0.0', prefix: 12, cat: 'private-rfc1918' },
  { network: '192.168.0.0', prefix: 16, cat: 'private-rfc1918' },
  { network: '100.64.0.0', prefix: 10, cat: 'cgnat' },
  { network: '127.0.0.0', prefix: 8, cat: 'loopback' },
];

const DEFAULT_BLOCKED_IPV6: Array<{ network: string; prefix: number; cat: string }> = [
  { network: '::1', prefix: 128, cat: 'loopback' },
  { network: 'fc00::', prefix: 7, cat: 'private-ula' },
];

/**
 * Try to extract an embedded IPv4 from special IPv6 forms and classify the IPv4.
 * Returns null if the address is not a "carrier" form.
 */
function extractEmbeddedIPv4(ip: string): string | null {
  const lower = ip.toLowerCase();

  // ::ffff:a.b.c.d  (IPv4-mapped dotted)
  const mappedDotted = lower.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/);
  if (mappedDotted) return mappedDotted[1];

  // ::a.b.c.d (IPv4-compatible dotted — deprecated, always block)
  const compat = lower.match(/^::(\d+\.\d+\.\d+\.\d+)$/);
  if (compat) {
    return '__ALWAYS_BLOCK__';
  }

  // 64:ff9b::a.b.c.d (NAT64 dotted)
  const nat64Dotted = lower.match(/^64:ff9b::(\d+\.\d+\.\d+\.\d+)$/);
  if (nat64Dotted) return nat64Dotted[1];

  // Try expanding hex IPv6
  const expanded = expandIPv6(lower);
  if (expanded) {
    const parts = expanded.split(':');
    if (parts.length === 8) {
      // ::ffff:xx:yy (IPv4-mapped hex)
      if (
        parts[0] === '0000' &&
        parts[1] === '0000' &&
        parts[2] === '0000' &&
        parts[3] === '0000' &&
        parts[4] === '0000' &&
        parts[5] === 'ffff'
      ) {
        const h1 = parseInt(parts[6], 16);
        const h2 = parseInt(parts[7], 16);
        return `${(h1 >> 8) & 0xff}.${h1 & 0xff}.${(h2 >> 8) & 0xff}.${h2 & 0xff}`;
      }

      // 64:ff9b::/96 (NAT64 well-known prefix)
      if (
        parts[0] === '0064' &&
        parts[1] === 'ff9b' &&
        parts[2] === '0000' &&
        parts[3] === '0000' &&
        parts[4] === '0000' &&
        parts[5] === '0000'
      ) {
        const h1 = parseInt(parts[6], 16);
        const h2 = parseInt(parts[7], 16);
        return `${(h1 >> 8) & 0xff}.${h1 & 0xff}.${(h2 >> 8) & 0xff}.${h2 & 0xff}`;
      }

      // 2002::/16 (6to4)
      if (parts[0] === '2002') {
        const h1 = parseInt(parts[1], 16);
        const h2 = parseInt(parts[2], 16);
        return `${(h1 >> 8) & 0xff}.${h1 & 0xff}.${(h2 >> 8) & 0xff}.${h2 & 0xff}`;
      }
    }
  }

  return null;
}

/**
 * Raw classifier used internally — does not consult config allowlists.
 */
function classifyAddressRaw(ip: string): AddressClassification {
  const v4 = net.isIPv4(ip);
  const v6 = net.isIPv6(ip);

  if (!v4 && !v6) {
    return { blocked: true, alwaysBlocked: true, category: 'invalid-ip' };
  }

  if (v6) {
    // Check for always-blocked specific addresses
    for (const candidate of AWS_IMDS_V6_VARIANTS) {
      const expanded = expandIPv6(candidate);
      const inputExpanded = expandIPv6(ip);
      if (expanded && inputExpanded && expanded === inputExpanded) {
        return { blocked: true, alwaysBlocked: true, category: 'cloud-metadata' };
      }
    }

    // Check Teredo (2001::/32) — always blocked
    if (ip.toLowerCase().startsWith('2001:') && !ip.toLowerCase().startsWith('2001:0db8')) {
      // Check if it's actually Teredo (2001:0000::/32) vs other 2001:: addresses
      const buf = ipv6ToBuffer(ip);
      if (buf) {
        const prefix32 = buf.slice(0, 4).toString('hex');
        if (prefix32 === '20010000') {
          return { blocked: true, alwaysBlocked: true, category: 'teredo' };
        }
      }
    }

    // Try to extract embedded IPv4
    const embedded = extractEmbeddedIPv4(ip);
    if (embedded === '__ALWAYS_BLOCK__') {
      return { blocked: true, alwaysBlocked: true, category: 'ipv4-compatible-deprecated' };
    }
    if (embedded !== null) {
      // Classify the embedded IPv4
      const embeddedResult = classifyAddressRaw(embedded);
      return {
        ...embeddedResult,
        category: `ipv6-carrier:${embeddedResult.category}`,
      };
    }

    // Check always-blocked IPv6 ranges
    for (const entry of ALWAYS_BLOCKED_IPV6) {
      if (cidrContainsIPv6(entry.network, entry.prefix, ip)) {
        return { blocked: true, alwaysBlocked: true, category: entry.cat };
      }
    }

    // Check default-blocked IPv6 ranges
    for (const entry of DEFAULT_BLOCKED_IPV6) {
      if (cidrContainsIPv6(entry.network, entry.prefix, ip)) {
        return { blocked: true, alwaysBlocked: false, category: entry.cat };
      }
    }

    return { blocked: false, alwaysBlocked: false, category: 'public-ipv6' };
  }

  // v4 path
  if (ALWAYS_BLOCKED_IPV4_SPECIFIC.has(ip)) {
    return { blocked: true, alwaysBlocked: true, category: 'cloud-metadata' };
  }

  for (const entry of ALWAYS_BLOCKED_IPV4) {
    if (cidrContainsIPv4(entry.network, entry.prefix, ip)) {
      return { blocked: true, alwaysBlocked: true, category: entry.cat };
    }
  }

  for (const entry of DEFAULT_BLOCKED_IPV4) {
    if (cidrContainsIPv4(entry.network, entry.prefix, ip)) {
      return { blocked: true, alwaysBlocked: false, category: entry.cat };
    }
  }

  return { blocked: false, alwaysBlocked: false, category: 'public-ipv4' };
}

/**
 * Public API: classify an IP address string.
 * Respects operator allowlists from env.
 *
 * @param ip  Any valid IPv4 or IPv6 address string (already parsed — no hostnames)
 */
export function classifyAddress(ip: string): { blocked: boolean; category: string } {
  const raw = classifyAddressRaw(ip);

  if (!raw.blocked) return { blocked: false, category: raw.category };
  if (raw.alwaysBlocked) return { blocked: true, category: raw.category };

  // Allowlist checks for default-blocked (non-always-blocked) ranges
  const config = getSsrfConfig();

  // Loopback allowlist
  const isLoopback =
    raw.category === 'loopback' ||
    raw.category.endsWith(':loopback') ||
    raw.category === 'ipv6-carrier:loopback';

  if (isLoopback && config.allowLoopback) {
    return { blocked: false, category: raw.category + ':allowed-loopback' };
  }

  // Operator CIDR allowlist
  const v4 = net.isIPv4(ip);
  const v6 = net.isIPv6(ip);

  for (const allowed of config.allowedPrivateCidrs) {
    const allowedV4 = net.isIPv4(allowed.network);
    const allowedV6 = net.isIPv6(allowed.network);

    if (v4 && allowedV4 && cidrContainsIPv4(allowed.network, allowed.prefix, ip)) {
      return { blocked: false, category: raw.category + ':allowed-cidr' };
    }
    if (v6 && allowedV6 && cidrContainsIPv6(allowed.network, allowed.prefix, ip)) {
      return { blocked: false, category: raw.category + ':allowed-cidr' };
    }
  }

  return { blocked: true, category: raw.category };
}

// ─── Hostname rules ───────────────────────────────────────────────────────────

/**
 * Always-blocked hostnames (case-insensitive, strip trailing dot).
 * These are blocked regardless of what they resolve to — the name itself is suspicious.
 */
const ALWAYS_BLOCKED_HOSTNAMES = new Set([
  'metadata.google.internal',
  'metadata',
  'instance-data',
  'instance-data.ec2.internal',
  'kubernetes.default.svc',
]);

function isBlockedHostname(hostname: string): boolean {
  const h = hostname.toLowerCase().replace(/\.$/, '');
  if (ALWAYS_BLOCKED_HOSTNAMES.has(h)) return true;
  return false;
}

function isLocalhostVariant(hostname: string): boolean {
  const h = hostname.toLowerCase().replace(/\.$/, '');
  if (h === 'localhost') return true;
  if (h.endsWith('.localhost')) return true;
  if (h.endsWith('.local')) return true;
  return false;
}

// ─── DNS resolution with timeout ──────────────────────────────────────────────

const DNS_TIMEOUT_MS = 3000;

interface DnsResult {
  address: string;
  family: 4 | 6;
}

function dnsLookupAll(hostname: string): Promise<DnsResult[]> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error('DNS resolution timed out'));
    }, DNS_TIMEOUT_MS);

    dns.lookup(hostname, { all: true, verbatim: true }, (err, addresses) => {
      clearTimeout(timer);
      if (err) return reject(err);
      resolve(
        (addresses || []).map((a) => ({
          address: a.address,
          family: a.family as 4 | 6,
        }))
      );
    });
  });
}

// ─── URL parsing helper ────────────────────────────────────────────────────────

/**
 * Normalize a hostname from a URL:
 *  - lowercase
 *  - strip trailing dot
 *  - strip surrounding IPv6 brackets
 */
function normalizeHostname(raw: string): string {
  let h = raw.toLowerCase().replace(/\.$/, '');
  // IPv6 bracket removal — WHATWG URL already does this but strip again for safety
  if (h.startsWith('[') && h.endsWith(']')) {
    h = h.slice(1, -1);
  }
  return h;
}

// ─── validateBackendUrl ────────────────────────────────────────────────────────

export type ValidateResult =
  | { ok: true; url: URL }
  | { ok: false; reason: string };

/**
 * Registration-time validation.
 *
 * Rules (in order):
 *  1. Length limit
 *  2. WHATWG URL parse (handles decimal/octal/hex IP forms, rejects garbage)
 *  3. Scheme must be http or https
 *  4. No credentials in userinfo
 *  5. Non-empty host, no spaces/control chars
 *  6. localhost / *.local rules (config-gated)
 *  7. always-blocked hostnames
 *  8. Literal IP → classify directly
 *  9. Hostname → DNS resolve, classify ALL returned addresses
 *     (unresolvable → reject)
 *
 * Errors returned to callers are generic.  Details are logged internally.
 */
export async function validateBackendUrl(raw: string): Promise<ValidateResult> {
  // 1. Length
  if (!raw || raw.length > 2048) {
    return { ok: false, reason: 'URL is invalid or too long' };
  }

  // Reject empty host pattern e.g. http:///path
  if (/^https?:\/\/\//i.test(raw)) {
    return { ok: false, reason: 'URL must have a non-empty host' };
  }

  // 2. WHATWG parse
  let parsed: URL;
  try {
    parsed = new URL(raw);
  } catch {
    return { ok: false, reason: 'URL is not valid' };
  }

  // 3. Scheme
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return { ok: false, reason: 'URL scheme must be http or https' };
  }

  // 4. No credentials
  if (parsed.username || parsed.password) {
    return { ok: false, reason: 'URL must not contain credentials' };
  }

  // 5. Host checks
  const hostname = normalizeHostname(parsed.hostname);

  if (!hostname) {
    return { ok: false, reason: 'URL must have a non-empty host' };
  }

  // Control characters / spaces in hostname
  if (/[\s\x00-\x1f\x7f]/.test(hostname)) {
    return { ok: false, reason: 'URL host contains invalid characters' };
  }

  // 6. localhost / .local variants
  if (isLocalhostVariant(hostname)) {
    const config = getSsrfConfig();
    if (!config.allowLoopback) {
      return {
        ok: false,
        reason: 'URL targets a disallowed network address',
      };
    }
    // Allowed — return early (loopback allowed in dev)
    return { ok: true, url: parsed };
  }

  // 7. Always-blocked hostnames
  if (isBlockedHostname(hostname)) {
    console.warn(`[SSRF] Blocked hostname at registration: category=always-blocked-hostname`);
    return { ok: false, reason: 'URL targets a disallowed network address' };
  }

  // 8. Literal IP
  const isLiteralV4 = net.isIPv4(hostname);
  const isLiteralV6 = net.isIPv6(hostname);

  if (isLiteralV4 || isLiteralV6) {
    const result = classifyAddress(hostname);
    if (result.blocked) {
      console.warn(`[SSRF] Blocked literal IP at registration: category=${result.category}`);
      return { ok: false, reason: 'URL targets a disallowed network address' };
    }
    return { ok: true, url: parsed };
  }

  // 9. DNS resolution
  let addresses: DnsResult[];
  try {
    addresses = await dnsLookupAll(hostname);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn(`[SSRF] DNS resolution failed for hostname at registration: ${msg}`);
    return { ok: false, reason: 'URL hostname cannot be resolved' };
  }

  if (addresses.length === 0) {
    console.warn('[SSRF] DNS returned no addresses for hostname at registration');
    return { ok: false, reason: 'URL hostname cannot be resolved' };
  }

  // All addresses must pass (mixed public+private → reject)
  for (const addr of addresses) {
    const result = classifyAddress(addr.address);
    if (result.blocked) {
      console.warn(`[SSRF] Blocked hostname at registration: category=${result.category} (DNS resolved to blocked IP)`);
      return { ok: false, reason: 'URL targets a disallowed network address' };
    }
  }

  return { ok: true, url: parsed };
}

// ─── Connect-time guard (DNS rebinding / agent-level) ─────────────────────────

/**
 * Create a guarded dns.lookup function compatible with Node's http/https agent.
 *
 * The callback signature Node uses:
 *   lookup(hostname, options, callback)  where options may have `all` = true/false
 *   or: lookup(hostname, callback)
 *
 * When options.all is true, callback receives (err, addresses[]) where each
 * element is { address, family }.
 * When options.all is false (default), callback receives (err, address, family).
 *
 * We always resolve `all: true` internally so we can check every address.
 * We then either pick the first safe address or throw SsrfBlockedError.
 */
export type GuardedLookupFunction = (
  hostname: string,
  optionsOrCallback: dns.LookupOptions | ((err: NodeJS.ErrnoException | null, ...args: any[]) => void),
  callbackArg?: (err: NodeJS.ErrnoException | null, ...args: any[]) => void
) => void;

export function createGuardedLookup(serverId?: string): GuardedLookupFunction {
  const guardedLookup: GuardedLookupFunction = (
    hostname: string,
    optionsOrCallback: dns.LookupOptions | ((err: NodeJS.ErrnoException | null, ...args: any[]) => void),
    callbackArg?: (err: NodeJS.ErrnoException | null, ...args: any[]) => void
  ) => {
    let options: dns.LookupOptions;
    let callback: (err: NodeJS.ErrnoException | null, ...args: any[]) => void;

    if (typeof optionsOrCallback === 'function') {
      options = {};
      callback = optionsOrCallback;
    } else {
      options = optionsOrCallback ?? {};
      callback = callbackArg!;
    }

    const wantsAll = (options as dns.LookupAllOptions).all === true;

    dns.lookup(hostname, { all: true, verbatim: true }, (err, addresses) => {
      if (err) return (callback as (err: NodeJS.ErrnoException | null, ...args: any[]) => void)(err);

      const allAddrs = addresses || [];

      // Classify every resolved address
      for (const addr of allAddrs) {
        const result = classifyAddress(addr.address);
        if (result.blocked) {
          const sbErr = new SsrfBlockedError(result.category, serverId);
          console.warn(
            `[SSRF] Connect-time blocked: category=${result.category} serverId=${serverId ?? 'unknown'}`
          );
          (callback as (err: NodeJS.ErrnoException | null, ...args: any[]) => void)(
            Object.assign(sbErr, { code: 'SSRF_BLOCKED' }) as unknown as NodeJS.ErrnoException
          );
          return;
        }
      }

      if (allAddrs.length === 0) {
        (callback as (err: NodeJS.ErrnoException | null, ...args: any[]) => void)(
          Object.assign(new Error('DNS returned no addresses'), { code: 'ENOTFOUND' }) as NodeJS.ErrnoException
        );
        return;
      }

      if (wantsAll) {
        // Node expects (err, addresses) where addresses is AddressInfo[]
        (callback as unknown as (err: NodeJS.ErrnoException | null, addresses: dns.LookupAddress[]) => void)(
          null,
          allAddrs
        );
      } else {
        // Pick the first allowed address
        const first = allAddrs[0];
        (callback as (err: NodeJS.ErrnoException | null, address: string, family: number) => void)(
          null,
          first.address,
          first.family
        );
      }
    });
  };

  return guardedLookup;
}

// ─── Shared safe agents ────────────────────────────────────────────────────────

class TimeoutHttpAgent extends http.Agent {
  createConnection(options: any, callback?: any): net.Socket {
    const socket = super.createConnection(options, callback);
    const timeoutMs = getBackendConnectTimeoutMs();

    const timer = setTimeout(() => {
      if (socket && !socket.destroyed) {
        const err = new Error(`connect ETIMEDOUT (connect timeout ${timeoutMs}ms)`);
        (err as any).code = 'ETIMEDOUT';
        socket.destroy(err);
      }
    }, timeoutMs);

    if (socket) {
      socket.once('connect', () => clearTimeout(timer));
      socket.once('error', () => clearTimeout(timer));
      socket.once('close', () => clearTimeout(timer));
    }

    return socket as net.Socket;
  }
}

class TimeoutHttpsAgent extends https.Agent {
  createConnection(options: any, callback?: any): net.Socket {
    const socket = super.createConnection(options, callback);
    const timeoutMs = getBackendConnectTimeoutMs();

    const timer = setTimeout(() => {
      if (socket && !socket.destroyed) {
        const err = new Error(`connect ETIMEDOUT (connect timeout ${timeoutMs}ms)`);
        (err as any).code = 'ETIMEDOUT';
        socket.destroy(err);
      }
    }, timeoutMs);

    if (socket) {
      socket.once('secureConnect', () => clearTimeout(timer));
      socket.once('connect', () => {});
      socket.once('error', () => clearTimeout(timer));
      socket.once('close', () => clearTimeout(timer));
    }

    return socket as net.Socket;
  }
}

interface SafeAgents {
  httpAgent: http.Agent;
  httpsAgent: https.Agent;
}

let _safeAgents: SafeAgents | null = null;

/**
 * Returns a singleton pair of http/https agents that use the guarded DNS lookup
 * and enforce socket-level connection timeout.
 * Do NOT add keepAlive here — that is a separate tuning item (HIGH-XX).
 */
export function getSafeAgents(serverId?: string): SafeAgents {
  if (!_safeAgents) {
    const lookup = createGuardedLookup(serverId);
    _safeAgents = {
      httpAgent: new TimeoutHttpAgent({ lookup } as http.AgentOptions),
      httpsAgent: new TimeoutHttpsAgent({ lookup } as https.AgentOptions),
    };
  }
  return _safeAgents;
}

/** Reset for testing so each test gets fresh agents. */
export function resetSafeAgentsForTesting(): void {
  _safeAgents = null;
}

/**
 * Pre-check a literal IP from a URL before the request is made.
 * Node does NOT call the lookup function for literal IPs, so we must check
 * them explicitly in the forwarder.
 *
 * @throws SsrfBlockedError if the IP is blocked
 */
export function assertLiteralIpAllowed(urlOrIp: string, serverId?: string): void {
  // Try to parse as URL first, then extract hostname
  let ip: string;
  try {
    const u = new URL(urlOrIp);
    ip = normalizeHostname(u.hostname);
  } catch {
    ip = urlOrIp;
  }

  if (!net.isIPv4(ip) && !net.isIPv6(ip)) {
    return; // hostname — will go through guarded lookup
  }

  const result = classifyAddress(ip);
  if (result.blocked) {
    console.warn(
      `[SSRF] Blocked literal IP pre-check: category=${result.category} serverId=${serverId ?? 'unknown'}`
    );
    throw new SsrfBlockedError(result.category, serverId);
  }
}
