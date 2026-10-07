/**
 * services/load-balancer/header-policy.ts
 *
 * Pure, framework-agnostic header sanitization and construction policy (HIGH-04).
 * RFC 9110 / RFC 9112 compliant.
 */

// ─── Hop-by-Hop Headers (RFC 9110 §7.6.1 / RFC 9112 §6.1) ──────────────────────
export const HOP_BY_HOP_HEADERS = new Set([
  'connection',
  'keep-alive',
  'proxy-authenticate',
  'proxy-authorization',
  'te',
  'trailer',
  'transfer-encoding',
  'upgrade',
  'proxy-connection',
]);

// ─── Spoofable Client-Identity Headers (Always Removed) ────────────────────────
export const CLIENT_IDENTITY_HEADERS = new Set([
  'forwarded',
  'x-forwarded-for',
  'x-forwarded-host',
  'x-forwarded-proto',
  'x-forwarded-port',
  'x-forwarded-server',
  'x-original-forwarded-for',
  'x-real-ip',
  'x-client-ip',
  'x-cluster-client-ip',
  'true-client-ip',
  'cf-connecting-ip',
  'fastly-client-ip',
  'x-azure-clientip',
]);

// ─── Protected Headers Never Stripped via Connection Header List ───────────────
export const CONNECTION_PROTECTED_HEADERS = new Set([
  'content-length',
  'host',
  'authorization',
]);

export interface RequestHeaderContext {
  clientIp?: string;
  host?: string;
  scheme?: 'http' | 'https' | string;
  requestId?: string;
  trustForwardedHost?: boolean;
}

/**
 * Validates a hostname[:port] string strictly according to RFC 1123 / standard URI syntax.
 */
export function isValidHostSyntax(hostStr: string): boolean {
  if (!hostStr || typeof hostStr !== 'string') return false;
  const trimmed = hostStr.trim();
  if (trimmed.length === 0 || trimmed.length > 255) return false;

  // IPv6 bracketed address with optional port e.g. [::1]:8080 or [2001:db8::1]
  if (trimmed.startsWith('[')) {
    const closeIdx = trimmed.indexOf(']');
    if (closeIdx === -1) return false;
    const ipPart = trimmed.slice(1, closeIdx);
    const portPart = trimmed.slice(closeIdx + 1);
    if (portPart.length > 0) {
      if (!/^:[0-9]{1,5}$/.test(portPart)) return false;
      const portNum = parseInt(portPart.slice(1), 10);
      if (portNum < 1 || portNum > 65535) return false;
    }
    // Basic IPv6 character validity inside brackets
    return /^[0-9a-fA-F:]+$/.test(ipPart);
  }

  // Regular hostname or IPv4 with optional port
  const hostPortMatch = trimmed.match(/^([^:]+)(?::([0-9]{1,5}))?$/);
  if (!hostPortMatch) return false;

  const hostname = hostPortMatch[1];
  const port = hostPortMatch[2];

  if (port) {
    const portNum = parseInt(port, 10);
    if (portNum < 1 || portNum > 65535) return false;
  }

  // Disallow control characters or whitespace
  if (/[\s\x00-\x1f\x7f]/.test(hostname)) return false;

  // RFC 1123 label validation
  const labels = hostname.split('.');
  for (const label of labels) {
    if (label.length === 0 || label.length > 63) return false;
    if (!/^[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?$/.test(label)) return false;
  }

  return true;
}

/**
 * Normalizes incoming headers from Fetch API Headers or plain object to a lowercase key-value map.
 */
function toHeaderMap(incoming: Headers | Record<string, any>): Map<string, string | string[]> {
  const map = new Map<string, string | string[]>();
  if (!incoming) return map;

  if (typeof (incoming as Headers).forEach === 'function') {
    (incoming as Headers).forEach((value, key) => {
      map.set(key.toLowerCase(), value);
    });
  } else {
    for (const [key, val] of Object.entries(incoming as Record<string, string | string[] | undefined>)) {
      if (val !== undefined && val !== null) {
        map.set(key.toLowerCase(), val);
      }
    }
  }

  return map;
}

/**
 * Parses headers listed in the `Connection` header value (comma-separated, case-insensitive).
 */
export function parseConnectionTokens(connectionHeader?: string | string[] | null): Set<string> {
  const tokens = new Set<string>();
  if (!connectionHeader) return tokens;

  const raw = Array.isArray(connectionHeader) ? connectionHeader.join(', ') : connectionHeader;

  raw
    .split(',')
    .map((t) => t.trim().toLowerCase())
    .filter((t) => t.length > 0)
    .forEach((t) => {
      if (!CONNECTION_PROTECTED_HEADERS.has(t)) {
        tokens.add(t);
      }
    });

  return tokens;
}

/**
 * Sanitizes request headers (B1 & B2).
 *
 * 1. Strips RFC hop-by-hop headers and any header named in the incoming Connection header.
 * 2. Strips spoofable client-identity headers.
 * 3. Strips framework-internal headers (x-middleware-*, x-invoke-*).
 * 4. Strips 'host' header so the upstream client handles virtual hosting.
 * 5. Injects verified headers:
 *    - X-Forwarded-For: verified client IP (if not 'unknown')
 *    - X-Real-IP: verified client IP (if not 'unknown')
 *    - X-Forwarded-Proto: verified scheme ('http' or 'https')
 *    - X-Forwarded-Host: verified Host header if valid syntax (or trusted x-forwarded-host if enabled)
 *    - x-request-id: unchanged or injected
 */
export function sanitizeRequestHeaders(
  incoming: Headers | Record<string, any>,
  ctx: RequestHeaderContext = {}
): Record<string, string> {
  const incomingMap = toHeaderMap(incoming);
  const connectionTokens = parseConnectionTokens(incomingMap.get('connection'));

  // Extract proto before stripping
  let verifiedProto: string = (ctx.scheme === 'https' ? 'https' : 'http');
  const incomingXfp = incomingMap.get('x-forwarded-proto');
  if (incomingXfp) {
    const rawXfp = Array.isArray(incomingXfp) ? incomingXfp.join(', ') : incomingXfp;
    const parts = rawXfp.split(',').map((p) => p.trim().toLowerCase());
    const rightmost = parts[parts.length - 1];
    if (rightmost === 'http' || rightmost === 'https') {
      verifiedProto = rightmost;
    }
  }

  // Extract forwarded host if TRUST_FORWARDED_HOST is enabled
  const trustFwdHost = ctx.trustForwardedHost ?? (process.env.TRUST_FORWARDED_HOST === 'true');
  const incomingXfh = incomingMap.get('x-forwarded-host');

  const result: Record<string, string> = {};

  for (const [lowerKey, val] of incomingMap.entries()) {
    // 1. Hop-by-hop
    if (HOP_BY_HOP_HEADERS.has(lowerKey)) continue;

    // 2. Named in Connection header
    if (connectionTokens.has(lowerKey)) continue;

    // 3. Client identity headers
    if (CLIENT_IDENTITY_HEADERS.has(lowerKey)) continue;

    // 4. Framework internal headers
    if (lowerKey.startsWith('x-middleware-') || lowerKey.startsWith('x-invoke-')) continue;

    // 5. Host header is stripped (Axios/client sets Host to backend URL)
    if (lowerKey === 'host') continue;

    result[lowerKey] = Array.isArray(val) ? val.join(', ') : String(val);
  }

  // Set verified client IP headers
  const clientIp = ctx.clientIp?.trim();
  if (clientIp && clientIp !== 'unknown') {
    result['x-forwarded-for'] = clientIp;
    result['x-real-ip'] = clientIp;
  }

  // Set X-Forwarded-Proto
  result['x-forwarded-proto'] = verifiedProto;

  // Set X-Forwarded-Host
  let candidateHost: string | undefined = undefined;
  if (trustFwdHost && incomingXfh) {
    const rawXfh = Array.isArray(incomingXfh) ? incomingXfh.join(', ') : incomingXfh;
    const parts = rawXfh.split(',').map((p) => p.trim());
    const rightmost = parts[parts.length - 1];
    if (isValidHostSyntax(rightmost)) {
      candidateHost = rightmost;
    }
  }

  if (!candidateHost) {
    const rawHost = ctx.host || incomingMap.get('host');
    const hostStr = Array.isArray(rawHost) ? rawHost[0] : rawHost;
    if (hostStr && isValidHostSyntax(hostStr)) {
      candidateHost = hostStr.trim();
    }
  }

  if (candidateHost) {
    result['x-forwarded-host'] = candidateHost;
  }

  // Ensure x-request-id
  if (ctx.requestId) {
    result['x-request-id'] = ctx.requestId;
  }

  return result;
}

/**
 * Sanitizes response headers (B4: Upstream -> Client).
 * Strips hop-by-hop headers and any header listed in the upstream's Connection header.
 */
export function sanitizeResponseHeaders(
  upstreamHeaders: Headers | Record<string, any>
): Record<string, string | string[]> {
  const map = toHeaderMap(upstreamHeaders);
  const connHeader = map.get('connection');
  const connStr = Array.isArray(connHeader) ? connHeader.join(', ') : connHeader;
  const connectionTokens = parseConnectionTokens(connStr);

  const result: Record<string, string | string[]> = {};

  for (const [lowerKey, value] of map.entries()) {
    if (HOP_BY_HOP_HEADERS.has(lowerKey)) continue;
    if (connectionTokens.has(lowerKey)) continue;

    result[lowerKey] = value;
  }

  return result;
}
