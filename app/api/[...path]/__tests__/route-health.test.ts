import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from '../route';
import { NextRequest } from 'next/server';
import { cacheService } from '@/services/cache/CacheService';
import { healthScheduler } from '@/services/health/HealthScheduler';
import { ServerHealth } from '@/types/domain';

import { cacheInitializer } from '@/services/cache/CacheInitializer';

describe('Public Root Endpoint GET /api/{projectSlug} (HIGH-06)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(cacheInitializer, 'init').mockResolvedValue();
    vi.spyOn(healthScheduler, 'startMonitoring').mockResolvedValue([]);
  });

  it('reads health ONLY from in-memory cache and makes ZERO calls to healthScheduler.checkServer', async () => {
    const checkServerSpy = vi.spyOn(healthScheduler, 'checkServer');

    const project = {
      id: 'proj-1',
      name: 'Trial Project',
      slug: 'trial',
      description: null,
      enabled: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const servers = [
      {
        id: 'srv-1',
        projectId: 'proj-1',
        name: 'Server 1',
        url: 'http://srv1.internal',
        enabled: true,
        healthy: ServerHealth.HEALTHY,
        weight: 1,
        priority: 0,
        requestsHandled: 0,
        activeRequests: 0,
        averageResponseTime: 45,
        failureCount: 0,
        lastHealthCheck: new Date(),
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    vi.spyOn(cacheService, 'resolveProject').mockResolvedValue(project);
    vi.spyOn(cacheService, 'getServersForProject').mockResolvedValue(servers);

    const req = new NextRequest('http://localhost:3000/api/trial');
    const res = await GET(req, { params: Promise.resolve({ path: ['trial'] }) });

    expect(res.status).toBe(200);
    const body = await res.json();

    // Zero calls to outbound checkServer probe
    expect(checkServerSpy).toHaveBeenCalledTimes(0);
    expect(body.project).toBe('trial');
    expect(body.healthy).toBe(true);
    expect(body.stale).toBe(false);
    expect(body.servers.length).toBe(1);
    expect(body.servers[0].status).toBe('healthy');
    expect(body.servers[0].url).toBeUndefined();
    expect(body.servers[0].error).toBeUndefined();
  });

  it('reports stale=true when lastHealthCheck is missing or older than HEALTH_STALE_AFTER_SEC', async () => {
    const project = {
      id: 'proj-1',
      name: 'Trial Project',
      slug: 'trial',
      description: null,
      enabled: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const staleDate = new Date(Date.now() - 120 * 1000); // 120s ago (> 60s default)
    const servers = [
      {
        id: 'srv-1',
        projectId: 'proj-1',
        name: 'Server 1',
        url: 'http://srv1.internal',
        enabled: true,
        healthy: ServerHealth.HEALTHY,
        weight: 1,
        priority: 0,
        requestsHandled: 0,
        activeRequests: 0,
        averageResponseTime: 45,
        failureCount: 0,
        lastHealthCheck: staleDate,
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    vi.spyOn(cacheService, 'resolveProject').mockResolvedValue(project);
    vi.spyOn(cacheService, 'getServersForProject').mockResolvedValue(servers);

    const req = new NextRequest('http://localhost:3000/api/trial');
    const res = await GET(req, { params: Promise.resolve({ path: ['trial'] }) });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.stale).toBe(true);
  });
});
