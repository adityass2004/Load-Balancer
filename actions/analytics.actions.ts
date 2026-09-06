'use server';

import { analyticsService } from '@/services/analytics/AnalyticsService';
import type { ActionResult } from '@/types/api';
import type {
  DashboardStats,
  ServerMetric,
  ChartDataPoint,
  HealthDistributionItem,
  CombinedDashboardData,
} from '@/types/domain';

export async function getDashboardSnapshotAction(projectId?: string): Promise<ActionResult<CombinedDashboardData>> {
  return analyticsService.getDashboardSnapshot(projectId);
}

export async function getDashboardStatsAction(projectId?: string): Promise<ActionResult<DashboardStats>> {
  return analyticsService.getDashboardStats(projectId);
}

export async function getServerMetricsAction(projectId?: string): Promise<ActionResult<ServerMetric[]>> {
  return analyticsService.getServerMetrics(projectId);
}

export async function getRequestsOverTimeAction(
  hours?: number,
  projectId?: string
): Promise<ActionResult<ChartDataPoint[]>> {
  return analyticsService.getRequestsOverTime(hours, projectId);
}

export async function getResponseTimeOverTimeAction(
  hours?: number,
  projectId?: string
): Promise<ActionResult<ChartDataPoint[]>> {
  return analyticsService.getResponseTimeOverTime(hours, projectId);
}

export async function getRequestsPerServerAction(projectId?: string): Promise<ActionResult<ChartDataPoint[]>> {
  return analyticsService.getRequestsPerServer(projectId);
}

export async function getHealthDistributionAction(projectId?: string): Promise<ActionResult<HealthDistributionItem[]>> {
  return analyticsService.getHealthDistribution(projectId);
}

export async function getActiveConnectionsOverTimeAction(
  hours?: number,
  projectId?: string
): Promise<ActionResult<ChartDataPoint[]>> {
  return analyticsService.getActiveConnectionsOverTime(hours, projectId);
}

export async function triggerHealthCheckAction() {
  try {
    const { healthScheduler } = await import('@/services/health/HealthScheduler');
    const results = await healthScheduler.checkAllServers();
    return { success: true, data: results };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}
