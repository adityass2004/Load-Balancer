'use server';

import { analyticsService } from '@/services/analytics/AnalyticsService';
import { requireAdmin } from '@/lib/auth/require-admin';
import { fail } from '@/lib/response';
import type { ActionResult } from '@/types/api';
import type {
  DashboardStats,
  ServerMetric,
  ChartDataPoint,
  HealthDistributionItem,
  CombinedDashboardData,
} from '@/types/domain';

export async function getDashboardSnapshotAction(projectId?: string): Promise<ActionResult<CombinedDashboardData>> {
  try {
    await requireAdmin();
    return analyticsService.getDashboardSnapshot(projectId);
  } catch (e) {
    return fail(e);
  }
}

export async function getDashboardStatsAction(projectId?: string): Promise<ActionResult<DashboardStats>> {
  try {
    await requireAdmin();
    return analyticsService.getDashboardStats(projectId);
  } catch (e) {
    return fail(e);
  }
}

export async function getServerMetricsAction(projectId?: string): Promise<ActionResult<ServerMetric[]>> {
  try {
    await requireAdmin();
    return analyticsService.getServerMetrics(projectId);
  } catch (e) {
    return fail(e);
  }
}

export async function getRequestsOverTimeAction(
  hours?: number,
  projectId?: string
): Promise<ActionResult<ChartDataPoint[]>> {
  try {
    await requireAdmin();
    return analyticsService.getRequestsOverTime(hours, projectId);
  } catch (e) {
    return fail(e);
  }
}

export async function getResponseTimeOverTimeAction(
  hours?: number,
  projectId?: string
): Promise<ActionResult<ChartDataPoint[]>> {
  try {
    await requireAdmin();
    return analyticsService.getResponseTimeOverTime(hours, projectId);
  } catch (e) {
    return fail(e);
  }
}

export async function getRequestsPerServerAction(projectId?: string): Promise<ActionResult<ChartDataPoint[]>> {
  try {
    await requireAdmin();
    return analyticsService.getRequestsPerServer(projectId);
  } catch (e) {
    return fail(e);
  }
}

export async function getHealthDistributionAction(projectId?: string): Promise<ActionResult<HealthDistributionItem[]>> {
  try {
    await requireAdmin();
    return analyticsService.getHealthDistribution(projectId);
  } catch (e) {
    return fail(e);
  }
}

export async function getActiveConnectionsOverTimeAction(
  hours?: number,
  projectId?: string
): Promise<ActionResult<ChartDataPoint[]>> {
  try {
    await requireAdmin();
    return analyticsService.getActiveConnectionsOverTime(hours, projectId);
  } catch (e) {
    return fail(e);
  }
}

export async function triggerHealthCheckAction() {
  try {
    await requireAdmin();
    const { healthScheduler } = await import('@/services/health/HealthScheduler');
    const results = await healthScheduler.checkAllServers();
    return { success: true, data: results };
  } catch (e) {
    return fail(e);
  }
}
