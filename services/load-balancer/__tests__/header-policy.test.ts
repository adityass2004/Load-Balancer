import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  sanitizeRequestHeaders,
  sanitizeResponseHeaders,
  parseConnectionTokens,
  isValidHostSyntax,
  HOP_BY_HOP_HEADERS,
  CLIENT_IDENTITY_HEADERS,
} from '../header-policy';

describe('Header Policy - HIGH-04', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    delete process.env.TRUST_FORWARDED_HOST;
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('Host Syntax Validator', () => {
    it('accepts valid hostnames and ports', () => {
      expect(isValidHostSyntax('example.com')).toBe(true);
      expect(isValidHostSyntax('api.example.com:443')).toBe(true);
      expect(isValidHostSyntax('localhost:3000')).toBe(true);
      expect(isValidHostSyntax('192.168.1.1:8080')).toBe(true);
      expect(isValidHostSyntax('[2001:db8::1]:8080')).toBe(true);
      expect(isValidHostSyntax('[::1]')).toBe(true);
    });

    it('rejects invalid host syntax', () => {
      expect(isValidHostSyntax('')).toBe(false);
      expect(isValidHostSyntax('   ')).toBe(false);
      expect(isValidHostSyntax('example..com')).toBe(false);
      expect(isValidHostSyntax('bad host with spaces')).toBe(false);
      expect(isValidHostSyntax('host/with/path')).toBe(false);
      expect(isValidHostSyntax('host:invalidport')).toBe(false);
      expect(isValidHostSyntax('host:70000')).toBe(false);
      expect(isValidHostSyntax('host:0')).toBe(false);
      expect(isValidHostSyntax('[incomplete-bracket')).toBe(false);
    });
  });

  describe('Connection Header Parsing', () => {
    it('parses comma-separated tokens case-insensitively and trims spaces', () => {
      const tokens = parseConnectionTokens('keep-alive, X-Secret-Hop, upgrade ');
      expect(tokens.has('keep-alive')).toBe(true);
      expect(tokens.has('x-secret-hop')).toBe(true);
      expect(tokens.has('upgrade')).toBe(true);
    });

    it('never includes protected headers like content-length or host', () => {
      const tokens = parseConnectionTokens('content-length, host, authorization, custom-header');
      expect(tokens.has('content-length')).toBe(false);
      expect(tokens.has('host')).toBe(false);
      expect(tokens.has('authorization')).toBe(false);
      expect(tokens.has('custom-header')).toBe(true);
    });
  });

  describe('sanitizeRequestHeaders', () => {
    it('strips all standard hop-by-hop headers', () => {
      const incoming = {
        connection: 'keep-alive',
        'keep-alive': 'timeout=5',
        'proxy-authenticate': 'basic',
        'proxy-authorization': 'token',
        te: 'trailers',
        trailer: 'X-Trailer',
        'transfer-encoding': 'chunked',
        upgrade: 'websocket',
        'proxy-connection': 'keep-alive',
        'x-custom': 'allowed',
      };

      const result = sanitizeRequestHeaders(incoming, { clientIp: '1.2.3.4' });
      for (const h of HOP_BY_HOP_HEADERS) {
        expect(result[h]).toBeUndefined();
      }
      expect(result['x-custom']).toBe('allowed');
    });

    it('removes headers listed inside the Connection header', () => {
      const incoming = {
        connection: 'keep-alive, x-secret-hop, X-Foo ',
        'x-secret-hop': '1',
        'x-foo': 'bar',
        'x-keep': 'ok',
      };

      const result = sanitizeRequestHeaders(incoming, { clientIp: '1.2.3.4' });
      expect(result['x-secret-hop']).toBeUndefined();
      expect(result['x-foo']).toBeUndefined();
      expect(result['x-keep']).toBe('ok');
    });

    it('strips spoofable client-identity headers and sets verified ones', () => {
      const incoming = {
        forwarded: 'for=6.6.6.6',
        'x-forwarded-for': '6.6.6.6, 7.7.7.7',
        'x-real-ip': '6.6.6.6',
        'x-client-ip': '6.6.6.6',
        'x-cluster-client-ip': '6.6.6.6',
        'true-client-ip': '6.6.6.6',
        'cf-connecting-ip': '6.6.6.6',
        'fastly-client-ip': '6.6.6.6',
        'x-azure-clientip': '6.6.6.6',
      };

      const result = sanitizeRequestHeaders(incoming, { clientIp: '203.0.113.195' });

      expect(result['forwarded']).toBeUndefined();
      expect(result['cf-connecting-ip']).toBeUndefined();
      expect(result['true-client-ip']).toBeUndefined();
      expect(result['x-client-ip']).toBeUndefined();
      expect(result['x-cluster-client-ip']).toBeUndefined();
      expect(result['x-forwarded-for']).toBe('203.0.113.195');
      expect(result['x-real-ip']).toBe('203.0.113.195');
    });

    it('omits X-Forwarded-For and X-Real-IP if clientIp is unknown or missing', () => {
      const incoming = {
        'x-forwarded-for': '6.6.6.6',
        'x-real-ip': '6.6.6.6',
      };

      const resUnknown = sanitizeRequestHeaders(incoming, { clientIp: 'unknown' });
      expect(resUnknown['x-forwarded-for']).toBeUndefined();
      expect(resUnknown['x-real-ip']).toBeUndefined();

      const resMissing = sanitizeRequestHeaders(incoming, {});
      expect(resMissing['x-forwarded-for']).toBeUndefined();
      expect(resMissing['x-real-ip']).toBeUndefined();
    });

    it('strips framework-internal headers (x-middleware-*, x-invoke-*)', () => {
      const incoming = {
        'x-middleware-subrequest': 'internal',
        'x-middleware-rewrite': 'yes',
        'x-invoke-path': '/secret',
        'x-custom': 'allowed',
      };

      const result = sanitizeRequestHeaders(incoming, { clientIp: '1.2.3.4' });
      expect(result['x-middleware-subrequest']).toBeUndefined();
      expect(result['x-middleware-rewrite']).toBeUndefined();
      expect(result['x-invoke-path']).toBeUndefined();
      expect(result['x-custom']).toBe('allowed');
    });

    it('keeps forwarding authorization, cookie, content-type, content-length, user-agent, custom headers', () => {
      const incoming = {
        authorization: 'Bearer token123',
        cookie: 'session=xyz',
        'content-type': 'application/json',
        'content-length': '42',
        'user-agent': 'Mozilla/5.0',
        'accept-encoding': 'gzip, deflate',
        'x-custom-header': 'hello-world',
      };

      const result = sanitizeRequestHeaders(incoming, { clientIp: '1.2.3.4' });
      expect(result['authorization']).toBe('Bearer token123');
      expect(result['cookie']).toBe('session=xyz');
      expect(result['content-type']).toBe('application/json');
      expect(result['content-length']).toBe('42');
      expect(result['user-agent']).toBe('Mozilla/5.0');
      expect(result['accept-encoding']).toBe('gzip, deflate');
      expect(result['x-custom-header']).toBe('hello-world');
    });

    it('always removes host header so HTTP client sets virtual host header', () => {
      const incoming = {
        host: 'trackit.internal',
        'x-custom': 'val',
      };

      const result = sanitizeRequestHeaders(incoming, { host: 'trackit.internal', clientIp: '1.2.3.4' });
      expect(result['host']).toBeUndefined();
      expect(result['x-forwarded-host']).toBe('trackit.internal');
    });

    it('sets verified proto from rightmost incoming value if valid http/https, else TrackIt scheme', () => {
      // 1. Valid incoming rightmost proto
      const res1 = sanitizeRequestHeaders(
        { 'x-forwarded-proto': 'http, https' },
        { scheme: 'http' }
      );
      expect(res1['x-forwarded-proto']).toBe('https');

      // 2. Invalid incoming proto falls back to seen scheme
      const res2 = sanitizeRequestHeaders(
        { 'x-forwarded-proto': 'ftp' },
        { scheme: 'https' }
      );
      expect(res2['x-forwarded-proto']).toBe('https');

      // 3. No incoming proto uses seen scheme
      const res3 = sanitizeRequestHeaders({}, { scheme: 'http' });
      expect(res3['x-forwarded-proto']).toBe('http');
    });

    it('ignores incoming x-forwarded-host by default and uses Host header', () => {
      const incoming = {
        host: 'trackit.local',
        'x-forwarded-host': 'spoofed.evil.com',
      };

      const result = sanitizeRequestHeaders(incoming, { host: 'trackit.local' });
      expect(result['x-forwarded-host']).toBe('trackit.local');
    });

    it('honors incoming x-forwarded-host when TRUST_FORWARDED_HOST=true', () => {
      process.env.TRUST_FORWARDED_HOST = 'true';
      const incoming = {
        host: 'trackit.local',
        'x-forwarded-host': 'proxy1.domain.com, trusted-edge.example.com:443',
      };

      const result = sanitizeRequestHeaders(incoming, { host: 'trackit.local', trustForwardedHost: true });
      expect(result['x-forwarded-host']).toBe('trusted-edge.example.com:443');
    });

    it('omits x-forwarded-host if incoming host header is malformed', () => {
      const incoming = {
        host: 'bad host with spaces',
      };

      const result = sanitizeRequestHeaders(incoming, { host: 'bad host with spaces' });
      expect(result['x-forwarded-host']).toBeUndefined();
    });
  });

  describe('sanitizeResponseHeaders', () => {
    it('strips response hop-by-hop headers and headers listed in upstream Connection header', () => {
      const upstream = {
        connection: 'keep-alive, x-backend-internal',
        'keep-alive': 'timeout=10',
        'transfer-encoding': 'chunked',
        'x-backend-internal': 'leak',
        'content-type': 'application/json',
        'set-cookie': ['sid=1; Path=/', 'token=abc; Path=/'],
        'x-request-id': 'req-12345',
      };

      const result = sanitizeResponseHeaders(upstream);
      expect(result['connection']).toBeUndefined();
      expect(result['keep-alive']).toBeUndefined();
      expect(result['transfer-encoding']).toBeUndefined();
      expect(result['x-backend-internal']).toBeUndefined();
      expect(result['content-type']).toBe('application/json');
      expect(result['set-cookie']).toEqual(['sid=1; Path=/', 'token=abc; Path=/']);
      expect(result['x-request-id']).toBe('req-12345');
    });
  });
});
