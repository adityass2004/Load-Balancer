import { describe, it, expect, vi, beforeEach } from 'vitest';
import { buildAllowedOrigins } from '../allowed-origins';

describe('buildAllowedOrigins (HIGH-03)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('Development vs Production behavior', () => {
    it('adds localhost:3000 in development mode', () => {
      const origins = buildAllowedOrigins({ NODE_ENV: 'development' });
      expect(origins).toContain('localhost:3000');
    });

    it('adds localhost:3000 when NODE_ENV is unset or test', () => {
      const origins = buildAllowedOrigins({ NODE_ENV: 'test' });
      expect(origins).toContain('localhost:3000');
    });

    it('does NOT add localhost:3000 in production mode', () => {
      const origins = buildAllowedOrigins({
        NODE_ENV: 'production',
        APP_ALLOWED_ORIGINS: 'app.example.com',
      });
      expect(origins).not.toContain('localhost:3000');
      expect(origins).toEqual(['app.example.com']);
    });

    it('returns empty array [] without throwing in production when no origins configured', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const origins = buildAllowedOrigins({ NODE_ENV: 'production' });
      expect(origins).toEqual([]);
      expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('APP_ALLOWED_ORIGINS and AUTH_URL are unset'));
    });
  });

  describe('AUTH_URL host extraction', () => {
    it('extracts host and default port omitted', () => {
      const origins = buildAllowedOrigins({
        NODE_ENV: 'production',
        AUTH_URL: 'https://lb.example.com',
      });
      expect(origins).toEqual(['lb.example.com']);
    });

    it('extracts host and custom port', () => {
      const origins = buildAllowedOrigins({
        NODE_ENV: 'production',
        AUTH_URL: 'https://lb.example.com:8443/auth/callback',
      });
      expect(origins).toEqual(['lb.example.com:8443']);
    });

    it('throws clear error on malformed AUTH_URL', () => {
      expect(() =>
        buildAllowedOrigins({
          NODE_ENV: 'production',
          AUTH_URL: 'not-a-valid-url',
        })
      ).toThrow(/Invalid AUTH_URL/);
    });
  });

  describe('APP_ALLOWED_ORIGINS parsing and de-duplication', () => {
    it('parses, trims, lowercases, and de-duplicates comma-separated origins', () => {
      const origins = buildAllowedOrigins({
        NODE_ENV: 'production',
        APP_ALLOWED_ORIGINS: ' LB.Example.COM, admin.example.com:3001, lb.example.com ',
        AUTH_URL: 'https://lb.example.com',
      });
      expect(origins).toEqual(['lb.example.com', 'admin.example.com:3001']);
    });

    it('ignores empty segments from extra commas', () => {
      const origins = buildAllowedOrigins({
        NODE_ENV: 'production',
        APP_ALLOWED_ORIGINS: ',,,admin.example.com,,',
      });
      expect(origins).toEqual(['admin.example.com']);
    });
  });

  describe('Input validation & Rejection rules', () => {
    it('rejects scheme (https://)', () => {
      expect(() =>
        buildAllowedOrigins({ APP_ALLOWED_ORIGINS: 'https://admin.example.com' })
      ).toThrow(/scheme/);
    });

    it('rejects scheme (http://)', () => {
      expect(() =>
        buildAllowedOrigins({ APP_ALLOWED_ORIGINS: 'http://admin.example.com' })
      ).toThrow(/scheme/);
    });

    it('rejects path components', () => {
      expect(() =>
        buildAllowedOrigins({ APP_ALLOWED_ORIGINS: 'admin.example.com/dashboard' })
      ).toThrow(/path/);
    });

    it('rejects userinfo / credentials', () => {
      expect(() =>
        buildAllowedOrigins({ APP_ALLOWED_ORIGINS: 'user:pass@admin.example.com' })
      ).toThrow(/credentials/);
    });

    it('rejects whitespace within origin', () => {
      expect(() =>
        buildAllowedOrigins({ APP_ALLOWED_ORIGINS: 'admin .example.com' })
      ).toThrow(/whitespace/);
    });

    it('rejects bare wildcard "*"', () => {
      expect(() =>
        buildAllowedOrigins({ APP_ALLOWED_ORIGINS: '*' })
      ).toThrow(/Wildcard "\*" or "\*\*" alone is not permitted/);
    });

    it('rejects bare wildcard "**"', () => {
      expect(() =>
        buildAllowedOrigins({ APP_ALLOWED_ORIGINS: '**' })
      ).toThrow(/Wildcard "\*" or "\*\*" alone is not permitted/);
    });

    it('rejects double wildcard labels like "*.*.example.com"', () => {
      expect(() =>
        buildAllowedOrigins({ APP_ALLOWED_ORIGINS: '*.*.example.com' })
      ).toThrow(/Invalid wildcard/);
    });

    it('rejects non-leading wildcard labels like "sub.*.example.com"', () => {
      expect(() =>
        buildAllowedOrigins({ APP_ALLOWED_ORIGINS: 'sub.*.example.com' })
      ).toThrow(/Invalid wildcard/);
    });
  });

  describe('Permitted wildcard domains', () => {
    it('allows a single leading wildcard label like "*.example.com"', () => {
      const origins = buildAllowedOrigins({
        NODE_ENV: 'production',
        APP_ALLOWED_ORIGINS: '*.example.com',
      });
      expect(origins).toEqual(['*.example.com']);
    });

    it('allows a single leading wildcard with port like "*.example.com:8443"', () => {
      const origins = buildAllowedOrigins({
        NODE_ENV: 'production',
        APP_ALLOWED_ORIGINS: '*.example.com:8443',
      });
      expect(origins).toEqual(['*.example.com:8443']);
    });
  });
});
