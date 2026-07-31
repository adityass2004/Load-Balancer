import { db } from '@/lib/db';
import { serverRepository } from '@/repositories/server.repository';
import { settingsRepository } from '@/repositories/settings.repository';
import { cacheService } from '@/services/cache/CacheService';
import { loggingRepository } from '@/services/logging/LoggingRepository';
import { toActionError } from '@/lib/errors';
import type {
  DashboardStats,
  ServerMetric,
  ChartDataPoint,
  HealthDistributionItem,
  CombinedDashboardData,
  Algorithm,
  Server,
} from '@/types/domain';
import { ServerHealth } from '@/src/generated/prisma';
import type { ActionResult } from '@/types/api';

import { globalCache } from '@/lib/cache';

const SERVER_START_TIME = new Date();
const CACHE_TTL_MS = 4000; // 4 seconds

const DEFAULT_SETTINGS = {
  algorithm: 'ROUND_ROBIN' as Algorithm,
  healthCheckInterval: 30,
  healthCheckTimeout: 5,
  maxFailures: 3,
  autoRecovery: true,
  requestTimeout: 10000,
  maxRetries: 3,
};

class AnalyticsService {
  async getDashboardStats(): Promise<ActionResult<DashboardStats>> {
    const cacheKey = 'dashboard-stats';
    const cached = await globalCache.get<ActionResult<DashboardStats>>(cacheKey);
    if (cached) return cached;

    try {
      const rawServers = await serverRepository.findMany({ includeDeleted: false });
      await cacheService.refreshServers();
      const servers = cacheService.mergeRuntimeState(rawServers);
      const settings = await settingsRepository.getOrCreate(DEFAULT_SETTINGS);
      const totalRequestsInDb = await db.requestLog.count();
      const requestsPerMinute = await loggingRepository.getRecentRequestsPerMinute();

      const activeServers = servers.filter((s: Server) => !s.deletedAt);
      const healthyServers = activeServers.filter((s: Server) => s.healthy === ServerHealth.HEALTHY && s.enabled).length;
      const unhealthyServers = activeServers.filter((s: Server) => s.healthy === ServerHealth.UNHEALTHY).length;
      const disabledServers = activeServers.filter((s: Server) => !s.enabled).length;
      const activeRequests = activeServers.reduce((sum: number, s: Server) => sum + s.activeRequests, 0);

      // Include in-memory runtime handled requests sum with DB logs count
      const runtimeHandledSum = activeServers.reduce((sum: number, s: Server) => sum + s.requestsHandled, 0);
      const totalRequests = Math.max(totalRequestsInDb, runtimeHandledSum);

      const validResponseTimes = activeServers
        .filter((s: Server) => s.averageResponseTime > 0)
        .map((s: Server) => s.averageResponseTime);
      const avgResponseTime =
        validResponseTimes.length > 0
          ? Math.round(validResponseTimes.reduce((a: number, b: number) => a + b, 0) / validResponseTimes.length)
          : 0;

      const uptimeSeconds = Math.floor((Date.now() - SERVER_START_TIME.getTime()) / 1000);

      const result: ActionResult<DashboardStats> = {
        success: true,
        data: {
          totalServers: activeServers.length,
          healthyServers,
          unhealthyServers,
          disabledServers,
          totalRequests,
          requestsPerMinute,
          avgResponseTime,
          activeRequests,
          algorithm: settings.algorithm as Algorithm,
          uptimeSeconds,
        },
      };

      await globalCache.set(cacheKey, result, CACHE_TTL_MS);
      return result;
    } catch (e) {
      return { success: false, error: toActionError(e) };
    }
  }

  async getServerMetrics(): Promise<ActionResult<ServerMetric[]>> {
    const cacheKey = 'server-metrics';
    const cached = await globalCache.get<ActionResult<ServerMetric[]>>(cacheKey);
    if (cached) return cached;

    try {
      const rawServers = await serverRepository.findMany({ includeDeleted: false });
      await cacheService.refreshServers();
      const servers = cacheService.mergeRuntimeState(rawServers);
      const metrics: ServerMetric[] = servers
        .filter((s: Server) => !s.deletedAt)
        .map((s: Server) => {
          const totalHandled = s.requestsHandled;
          const failures = s.failureCount;
          const uptimePercent =
            totalHandled > 0
              ? Math.max(0, Math.round(((totalHandled - failures) / totalHandled) * 100))
              : s.healthy === ServerHealth.HEALTHY
              ? 100
              : 0;

          return {
            id: s.id,
            name: s.name,
            url: s.url,
            status: s.healthy,
            enabled: s.enabled,
            requestsHandled: s.requestsHandled,
            activeRequests: s.activeRequests,
            averageResponseTime: Math.round(s.averageResponseTime),
            lastHealthCheck: s.lastHealthCheck,
            failureCount: s.failureCount,
            uptimePercent,
          };
        });

      const result: ActionResult<ServerMetric[]> = { success: true, data: metrics };
      await globalCache.set(cacheKey, result, CACHE_TTL_MS);
      return result;
    } catch (e) {
      return { success: false, error: toActionError(e) };
    }
  }

  async getRequestsOverTime(hours = 24): Promise<ActionResult<ChartDataPoint[]>> {
    const cacheKey = `requests-over-time-${hours}`;
    const cached = await globalCache.get<ActionResult<ChartDataPoint[]>>(cacheKey);
    if (cached) return cached;

    try {
      const raw = await loggingRepository.getRequestsOverTime(hours);
      const data: ChartDataPoint[] = raw.map((r) => ({
        timestamp: r.timestamp.toISOString(),
        value: r.count,
      }));
      const result: ActionResult<ChartDataPoint[]> = { success: true, data };
      await globalCache.set(cacheKey, result, CACHE_TTL_MS);
      return result;
    } catch (e) {
      return { success: false, error: toActionError(e) };
    }
  }

  async getResponseTimeOverTime(hours = 24): Promise<ActionResult<ChartDataPoint[]>> {
    const cacheKey = `response-time-over-time-${hours}`;
    const cached = await globalCache.get<ActionResult<ChartDataPoint[]>>(cacheKey);
    if (cached) return cached;

    try {
      const raw = await loggingRepository.getResponseTimeOverTime(hours);
      const data: ChartDataPoint[] = raw.map((r) => ({
        timestamp: r.timestamp.toISOString(),
        value: r.avgMs,
      }));
      const result: ActionResult<ChartDataPoint[]> = { success: true, data };
      await globalCache.set(cacheKey, result, CACHE_TTL_MS);
      return result;
    } catch (e) {
      return { success: false, error: toActionError(e) };
    }
  }

  async getRequestsPerServer(): Promise<ActionResult<ChartDataPoint[]>> {
    const cacheKey = 'requests-per-server';
    const cached = await globalCache.get<ActionResult<ChartDataPoint[]>>(cacheKey);
    if (cached) return cached;

    try {
      const rawServers = await serverRepository.findMany({ includeDeleted: false });
      await cacheService.refreshServers();
      const servers = cacheService.mergeRuntimeState(rawServers);
      const active = servers.filter((s) => !s.deletedAt);

      const data: ChartDataPoint[] = active.map((s) => ({
        timestamp: '',
        value: s.requestsHandled,
        label: s.name || s.url,
      }));

      const result: ActionResult<ChartDataPoint[]> = { success: true, data };
      await globalCache.set(cacheKey, result, CACHE_TTL_MS);
      return result;
    } catch (e) {
      return { success: false, error: toActionError(e) };
    }
  }

  async getHealthDistribution(): Promise<ActionResult<HealthDistributionItem[]>> {
    const cacheKey = 'health-distribution';
    const cached = await globalCache.get<ActionResult<HealthDistributionItem[]>>(cacheKey);
    if (cached) return cached;

    try {
      const rawServers = await serverRepository.findMany({ includeDeleted: false });
      await cacheService.refreshServers();
      const servers = cacheService.mergeRuntimeState(rawServers);
      const active = servers.filter((s) => !s.deletedAt);

      const healthy = active.filter((s) => s.healthy === ServerHealth.HEALTHY && s.enabled).length;
      const unhealthy = active.filter((s) => s.healthy === ServerHealth.UNHEALTHY).length;
      const unknown = active.filter((s) => s.healthy === ServerHealth.UNKNOWN).length;
      const disabled = active.filter((s) => !s.enabled).length;

      const result: ActionResult<HealthDistributionItem[]> = {
        success: true,
        data: [
          { name: 'Healthy', value: healthy, color: '#22c55e' },
          { name: 'Unhealthy', value: unhealthy, color: '#ef4444' },
          { name: 'Unknown', value: unknown, color: '#f59e0b' },
          { name: 'Disabled', value: disabled, color: '#6b7280' },
        ].filter((d) => d.value > 0),
      };
      await globalCache.set(cacheKey, result, CACHE_TTL_MS);
      return result;
    } catch (e) {
      return { success: false, error: toActionError(e) };
    }
  }

  async getActiveConnectionsOverTime(hours = 1): Promise<ActionResult<ChartDataPoint[]>> {
    const cacheKey = `active-connections-${hours}`;
    const cached = await globalCache.get<ActionResult<ChartDataPoint[]>>(cacheKey);
    if (cached) return cached;

    try {
      const rawServers = await serverRepository.findMany({ includeDeleted: false });
      await cacheService.refreshServers();
      const servers = cacheService.mergeRuntimeState(rawServers);
      const active = servers.filter((s) => !s.deletedAt && s.enabled);

      const totalActive = active.reduce((sum, s) => sum + s.activeRequests, 0);
      const now = new Date();

      const data: ChartDataPoint[] = [
        {
          timestamp: new Date(now.getTime() - 60_000).toISOString(),
          value: totalActive,
        },
        { timestamp: now.toISOString(), value: totalActive },
      ];

      const result: ActionResult<ChartDataPoint[]> = { success: true, data };
      await globalCache.set(cacheKey, result, CACHE_TTL_MS);
      return result;
    } catch (e) {
      return { success: false, error: toActionError(e) };
    }
  }

  async getDashboardSnapshot(): Promise<ActionResult<CombinedDashboardData>> {
    const cacheKey = 'dashboard-snapshot';
    const cached = await globalCache.get<ActionResult<CombinedDashboardData>>(cacheKey);
    if (cached) return cached;

    try {
      const [
        statsRes,
        serverMetricsRes,
        reqOverTimeRes,
        respOverTimeRes,
        perServerRes,
        healthDistRes,
        activeConnRes,
      ] = await Promise.all([
        this.getDashboardStats(),
        this.getServerMetrics(),
        this.getRequestsOverTime(24),
        this.getResponseTimeOverTime(24),
        this.getRequestsPerServer(),
        this.getHealthDistribution(),
        this.getActiveConnectionsOverTime(),
      ]);

      const result: ActionResult<CombinedDashboardData> = {
        success: true,
        data: {
          stats: statsRes.success ? statsRes.data : null,
          serverMetrics: serverMetricsRes.success ? serverMetricsRes.data : [],
          requestsOverTime: reqOverTimeRes.success ? reqOverTimeRes.data : [],
          responseTimeOverTime: respOverTimeRes.success ? respOverTimeRes.data : [],
          requestsPerServer: perServerRes.success ? perServerRes.data : [],
          healthDistribution: healthDistRes.success ? healthDistRes.data : [],
          activeConnections: activeConnRes.success ? activeConnRes.data : [],
          timestamp: new Date().toISOString(),
        },
      };

      await globalCache.set(cacheKey, result, 2000);
      return result;
    } catch (e) {
      return { success: false, error: toActionError(e) };
    }
  }
}

export const analyticsService = new AnalyticsService();
