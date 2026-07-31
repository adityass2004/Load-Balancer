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

export async function getDashboardSnapshotAction(): Promise<ActionResult<CombinedDashboardData>> {
  return analyticsService.getDashboardSnapshot();
}

export async function getDashboardStatsAction(): Promise<ActionResult<DashboardStats>> {
  return analyticsService.getDashboardStats();
}

export async function getServerMetricsAction(): Promise<ActionResult<ServerMetric[]>> {
  return analyticsService.getServerMetrics();
}

export async function getRequestsOverTimeAction(
  hours?: number
): Promise<ActionResult<ChartDataPoint[]>> {
  return analyticsService.getRequestsOverTime(hours);
}

export async function getResponseTimeOverTimeAction(
  hours?: number
): Promise<ActionResult<ChartDataPoint[]>> {
  return analyticsService.getResponseTimeOverTime(hours);
}

export async function getRequestsPerServerAction(): Promise<ActionResult<ChartDataPoint[]>> {
  return analyticsService.getRequestsPerServer();
}

export async function getHealthDistributionAction(): Promise<ActionResult<HealthDistributionItem[]>> {
  return analyticsService.getHealthDistribution();
}

export async function getActiveConnectionsOverTimeAction(): Promise<ActionResult<ChartDataPoint[]>> {
  return analyticsService.getActiveConnectionsOverTime();
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
