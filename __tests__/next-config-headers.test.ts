import { describe, it, expect } from 'vitest';
import nextConfig from '../next.config';

describe('Security Headers Config (MEDIUM-01)', () => {
  it('has poweredByHeader set to false', () => {
    expect(nextConfig.poweredByHeader).toBe(false);
  });

  it('defines header rules for UI routes, admin/auth API, and excludes public proxy route', async () => {
    expect(nextConfig.headers).toBeDefined();
    const rules = await nextConfig.headers!();

    const uiRule = rules.find((r) => r.source === '/((?!api/).*)');
    expect(uiRule).toBeDefined();
    const uiHeaders = uiRule!.headers.map((h) => h.key);
    expect(uiHeaders).toContain('X-Content-Type-Options');
    expect(uiHeaders).toContain('X-Frame-Options');
    expect(uiHeaders).toContain('Referrer-Policy');
    expect(uiHeaders).toContain('Permissions-Policy');
    expect(uiHeaders).toContain('Content-Security-Policy-Report-Only');

    const adminRule = rules.find((r) => r.source === '/api/admin/:path*');
    expect(adminRule).toBeDefined();
    const adminHeaders = adminRule!.headers.map((h) => h.key);
    expect(adminHeaders).toContain('X-Content-Type-Options');
    expect(adminHeaders).toContain('Cache-Control');

    const authRule = rules.find((r) => r.source === '/api/auth/:path*');
    expect(authRule).toBeDefined();
    const authHeaders = authRule!.headers.map((h) => h.key);
    expect(authHeaders).toContain('X-Content-Type-Options');
    expect(authHeaders).toContain('Cache-Control');

    // Public proxy route (/api/[...path]) is excluded from UI rules
    const proxyRule = rules.find((r) => r.source === '/api/:path*');
    expect(proxyRule).toBeUndefined(); // no blanket /api/:path* rule overriding backend responses
  });
});
