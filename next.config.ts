import type { NextConfig } from 'next';
import { buildAllowedOrigins } from './lib/config/allowed-origins';

const isProd = process.env.NODE_ENV === 'production';

const hstsHeader = {
  key: 'Strict-Transport-Security',
  value: 'max-age=63072000; includeSubDomains',
};

const commonUiHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  {
    key: 'Content-Security-Policy-Report-Only',
    value:
      "default-src 'self'; frame-ancestors 'none'; base-uri 'self'; object-src 'none'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self'; form-action 'self' https://accounts.google.com",
  },
  ...(isProd ? [hstsHeader] : []),
];

const apiAdminAuthHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Cache-Control', value: 'no-store' },
  ...(isProd ? [hstsHeader] : []),
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  experimental: {
    serverActions: {
      allowedOrigins: buildAllowedOrigins(process.env),
    },
  },
  async headers() {
    return [
      {
        source: '/((?!api/).*)',
        headers: commonUiHeaders,
      },
      {
        source: '/api/admin/:path*',
        headers: apiAdminAuthHeaders,
      },
      {
        source: '/api/auth/:path*',
        headers: apiAdminAuthHeaders,
      },
    ];
  },
};

export default nextConfig;
