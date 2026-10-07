import net from 'net';

/**
 * Extracts and validates client IP address according to TRUSTED_PROXY_HOPS.
 *
 * Security rationale:
 * Blindly trusting the leftmost X-Forwarded-For allows malicious clients to spoof
 * their IP by injecting arbitrary header values (e.g. X-Forwarded-For: 1.1.1.1).
 * Instead, we count hops from the rightmost edge corresponding to known, trusted
 * reverse proxies (such as Cloudflare, Cloud Run, or AWS ALB).
 */
export function getClientIp(request: Request): string {
  const hops = Math.max(1, parseInt(process.env.TRUSTED_PROXY_HOPS || '1', 10) || 1);

  const xff = request.headers.get('x-forwarded-for');
  if (xff) {
    const ips = xff
      .split(',')
      .map((ip) => ip.trim())
      .filter((ip) => ip.length > 0);

    if (ips.length >= hops) {
      const candidate = ips[ips.length - hops];
      if (net.isIP(candidate) !== 0) {
        return candidate;
      }
    }
  }

  const xRealIp = request.headers.get('x-real-ip');
  if (xRealIp) {
    const candidate = xRealIp.trim();
    if (net.isIP(candidate) !== 0) {
      return candidate;
    }
  }

  return 'unknown';
}

/**
 * Normalizes an IP address into a consistent rate-limit bucket key:
 * - IPv4: unchanged (e.g. 198.51.100.1)
 * - IPv4-mapped IPv6 (::ffff:198.51.100.1): converted to pure IPv4
 * - IPv6: normalized and reduced to its /64 subnet prefix (first 4 hextets, fully expanded to 4 digits each, lowercase)
 * - Invalid/garbage: 'unknown'
 */
export function rateLimitKeyForIp(ip: string): string {
  if (!ip || ip === 'unknown') {
    return 'unknown';
  }

  const trimmed = ip.trim().toLowerCase();

  // Check for IPv4-mapped IPv6 prefix (e.g., ::ffff:192.0.2.1)
  if (trimmed.startsWith('::ffff:')) {
    const embeddedIpv4 = trimmed.slice(7);
    if (net.isIP(embeddedIpv4) === 4) {
      return embeddedIpv4;
    }
  }

  const ipVersion = net.isIP(trimmed);
  if (ipVersion === 4) {
    return trimmed;
  }

  if (ipVersion === 6) {
    try {
      // Expand IPv6 address to all 8 hextets
      let hextets: string[];

      if (trimmed.includes('::')) {
        const parts = trimmed.split('::');
        if (parts.length !== 2) return 'unknown';

        const left = parts[0] ? parts[0].split(':').filter(Boolean) : [];
        const right = parts[1] ? parts[1].split(':').filter(Boolean) : [];
        const missingCount = 8 - (left.length + right.length);
        if (missingCount < 0) return 'unknown';

        const zeros = Array(missingCount).fill('0000');
        hextets = [...left, ...zeros, ...right];
      } else {
        hextets = trimmed.split(':');
      }

      if (hextets.length !== 8) {
        return 'unknown';
      }

      // Pad each hextet to 4 lowercase hex characters
      const expandedHextets = hextets.map((h) => h.padStart(4, '0'));

      // Return the /64 prefix (first 4 hextets)
      return expandedHextets.slice(0, 4).join(':');
    } catch {
      return 'unknown';
    }
  }

  return 'unknown';
}
