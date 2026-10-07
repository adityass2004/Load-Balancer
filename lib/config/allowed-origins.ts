/**
 * lib/config/allowed-origins.ts
 *
 * Pure configuration helper for Next.js Server Actions allowedOrigins.
 * Contains NO runtime dependencies (no zod, no Next.js imports) so that
 * next.config.ts can import it safely in any environment (including build time).
 */

function validateAndAddOrigin(raw: string, origins: Set<string>): void {
  const origin = raw.trim().toLowerCase();
  if (!origin) return;

  // Reject schemes
  if (
    origin.includes('://') ||
    origin.startsWith('http:') ||
    origin.startsWith('https:')
  ) {
    throw new Error(
      `[ALLOWED_ORIGINS] Entry "${raw}" contains a scheme. Entries must be host[:port] only (e.g. "example.com" or "example.com:8080").`
    );
  }

  // Reject paths
  if (origin.includes('/')) {
    throw new Error(
      `[ALLOWED_ORIGINS] Entry "${raw}" contains a path. Entries must be host[:port] only.`
    );
  }

  // Reject userinfo / credentials
  if (origin.includes('@')) {
    throw new Error(
      `[ALLOWED_ORIGINS] Entry "${raw}" contains credentials/userinfo. Entries must be host[:port] only.`
    );
  }

  // Reject whitespace
  if (/\s/.test(origin)) {
    throw new Error(
      `[ALLOWED_ORIGINS] Entry "${raw}" contains whitespace. Entries must be host[:port] only.`
    );
  }

  // Reject bare "*" or "**"
  if (
    origin === '*' ||
    origin === '**' ||
    origin.startsWith('*:') ||
    origin.startsWith('**:')
  ) {
    throw new Error(
      `[ALLOWED_ORIGINS] Wildcard "*" or "**" alone is not permitted in allowedOrigins.`
    );
  }

  // Validate wildcard usage
  if (origin.includes('*')) {
    // Only permit a single leading wildcard label, e.g. "*.example.com" or "*.example.com:3000"
    const hostPart = origin.split(':')[0];
    if (!hostPart.startsWith('*.') || hostPart.slice(2).includes('*')) {
      throw new Error(
        `[ALLOWED_ORIGINS] Invalid wildcard entry "${raw}". Only a single leading wildcard like "*.example.com" is allowed.`
      );
    }
  }

  origins.add(origin);
}

/**
 * Build the array of allowed origins for Server Actions CSRF protection.
 *
 * Sources merged and de-duplicated:
 *  1. APP_ALLOWED_ORIGINS: comma-separated host[:port]
 *  2. AUTH_URL: host (with port if non-default)
 *  3. "localhost:3000" ONLY when NODE_ENV !== "production"
 *
 * In production with no usable entries, returns [] without throwing, allowing
 * Next.js to use its default same-origin verification.
 */
export function buildAllowedOrigins(
  env: Record<string, string | undefined> = process.env
): string[] {
  const origins = new Set<string>();
  const isProduction = env.NODE_ENV === 'production';

  // 1. APP_ALLOWED_ORIGINS (comma-separated host[:port])
  const rawAllowedOrigins = env.APP_ALLOWED_ORIGINS;
  if (rawAllowedOrigins) {
    const parts = rawAllowedOrigins
      .split(',')
      .map((p) => p.trim())
      .filter(Boolean);
    for (const part of parts) {
      validateAndAddOrigin(part, origins);
    }
  }

  // 2. AUTH_URL host
  const authUrl = env.AUTH_URL;
  if (authUrl && authUrl.trim()) {
    try {
      const u = new URL(authUrl.trim());
      if (u.host) {
        validateAndAddOrigin(u.host, origins);
      }
    } catch {
      throw new Error(
        `[ALLOWED_ORIGINS] Invalid AUTH_URL provided: "${authUrl}"`
      );
    }
  }

  // 3. Dev-only localhost:3000
  if (!isProduction) {
    origins.add('localhost:3000');
  }

  const result = Array.from(origins);

  // In production with no configured entries, return [] and log warning
  if (isProduction && result.length === 0) {
    console.warn(
      '[ALLOWED_ORIGINS] APP_ALLOWED_ORIGINS and AUTH_URL are unset. Server Actions will fall back to default same-origin validation.'
    );
  }

  return result;
}
