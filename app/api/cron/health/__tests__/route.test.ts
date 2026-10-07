import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';

// Mock healthScheduler
vi.mock('@/services/health/HealthScheduler', () => ({
  healthScheduler: {
    checkAllServers: vi.fn().mockResolvedValue([
      { serverId: 'server-1', isHealthy: true },
    ]),
  },
}));

// Mock rateLimit and clientIp
vi.mock('@/lib/rate-limit', () => ({
  rateLimit: vi.fn().mockResolvedValue(null),
}));

vi.mock('@/lib/client-ip', () => ({
  getClientIp: vi.fn().mockReturnValue('127.0.0.1'),
}));

import { GET } from '../route';
import { _resetCronThrottleForTesting } from '@/lib/cron/health-cron';
import { healthScheduler } from '@/services/health/HealthScheduler';
import { rateLimit } from '@/lib/rate-limit';

describe('GET /api/cron/health (MEDIUM-03)', () => {
  const originalEnv = process.env;
  const VALID_SECRET = 'super-secret-cron-token-1234567890'; // > 16 chars

  beforeEach(() => {
    vi.clearAllMocks();
    _resetCronThrottleForTesting();
    process.env = { ...originalEnv };
    // Clear console spies
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('rejects with 401 and does NOT call scheduler when CRON_SECRET is unset', async () => {
    delete process.env.CRON_SECRET;

    const req = new NextRequest('http://localhost:3000/api/cron/health', {
      headers: { authorization: `Bearer ${VALID_SECRET}` },
    });

    const res = await GET(req);
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toBe('Unauthorized');
    expect(healthScheduler.checkAllServers).not.toHaveBeenCalled();
    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining('CRON_SECRET is not configured; cron endpoint disabled')
    );
  });

  it('rejects with 401 when CRON_SECRET is shorter than 16 characters even with matching header', async () => {
    process.env.CRON_SECRET = 'short-secret'; // 12 chars < 16

    const req = new NextRequest('http://localhost:3000/api/cron/health', {
      headers: { authorization: 'Bearer short-secret' },
    });

    const res = await GET(req);
    expect(res.status).toBe(401);
    expect(healthScheduler.checkAllServers).not.toHaveBeenCalled();
    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining('CRON_SECRET is not configured; cron endpoint disabled')
    );
  });

  it('rejects with 401 when Authorization header is missing', async () => {
    process.env.CRON_SECRET = VALID_SECRET;

    const req = new NextRequest('http://localhost:3000/api/cron/health');

    const res = await GET(req);
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toBe('Unauthorized');
    expect(healthScheduler.checkAllServers).not.toHaveBeenCalled();
  });

  it('rejects with 401 when Authorization header is not Bearer scheme', async () => {
    process.env.CRON_SECRET = VALID_SECRET;

    const req = new NextRequest('http://localhost:3000/api/cron/health', {
      headers: { authorization: `Basic ${VALID_SECRET}` },
    });

    const res = await GET(req);
    expect(res.status).toBe(401);
    expect(healthScheduler.checkAllServers).not.toHaveBeenCalled();
  });

  it('rejects with 401 when token has wrong value (same length)', async () => {
    process.env.CRON_SECRET = VALID_SECRET;

    const wrongToken = 'wrong-secret-cron-token-1234567890';
    const req = new NextRequest('http://localhost:3000/api/cron/health', {
      headers: { authorization: `Bearer ${wrongToken}` },
    });

    const res = await GET(req);
    expect(res.status).toBe(401);
    expect(healthScheduler.checkAllServers).not.toHaveBeenCalled();
  });

  it('rejects with 401 without throwing when token has mismatched length', async () => {
    process.env.CRON_SECRET = VALID_SECRET;

    const mismatchedLengthToken = 'too-short';
    const req = new NextRequest('http://localhost:3000/api/cron/health', {
      headers: { authorization: `Bearer ${mismatchedLengthToken}` },
    });

    const res = await GET(req);
    expect(res.status).toBe(401);
    expect(healthScheduler.checkAllServers).not.toHaveBeenCalled();
  });

  it('accepts with 200 and invokes healthScheduler when correct token is supplied', async () => {
    process.env.CRON_SECRET = VALID_SECRET;

    const req = new NextRequest('http://localhost:3000/api/cron/health', {
      headers: { authorization: `Bearer ${VALID_SECRET}` },
    });

    const res = await GET(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.resultsCount).toBe(1);
    expect(healthScheduler.checkAllServers).toHaveBeenCalledTimes(1);
  });

  it('enforces rate limiting before checking auth', async () => {
    process.env.CRON_SECRET = VALID_SECRET;

    // Simulate rate limiter returning 429
    const { NextResponse } = await import('next/server');
    vi.mocked(rateLimit).mockResolvedValueOnce(
      NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    );

    const req = new NextRequest('http://localhost:3000/api/cron/health', {
      headers: { authorization: `Bearer ${VALID_SECRET}` },
    });

    const res = await GET(req);
    expect(res.status).toBe(429);
    expect(rateLimit).toHaveBeenCalledWith('cron:ip', '127.0.0.1', expect.anything());
    expect(healthScheduler.checkAllServers).not.toHaveBeenCalled();
  });
});
