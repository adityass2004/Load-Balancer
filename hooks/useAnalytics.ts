'use client';

import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import {
  getDashboardSnapshotAction,
  getDashboardStatsAction,
  getServerMetricsAction,
  getRequestsOverTimeAction,
  getResponseTimeOverTimeAction,
  getRequestsPerServerAction,
  getHealthDistributionAction,
  getActiveConnectionsOverTimeAction,
} from '@/actions/analytics.actions';
import { useRefresh } from '@/context/RefreshContext';
import type {
  DashboardStats,
  ServerMetric,
  ChartDataPoint,
  HealthDistributionItem,
  CombinedDashboardData,
} from '@/types/domain';
import type { ActionResult } from '@/types/api';

export const analyticsKeys = {
  all: ['analytics'] as const,
  combined: (projectId?: string) => [...analyticsKeys.all, 'combined', projectId ?? 'all'] as const,
  stats: (projectId?: string) => [...analyticsKeys.all, 'stats', projectId ?? 'all'] as const,
  serverMetrics: (projectId?: string) => [...analyticsKeys.all, 'serverMetrics', projectId ?? 'all'] as const,
  requestsOverTime: (hours: number, projectId?: string) => [...analyticsKeys.all, 'requestsOverTime', hours, projectId ?? 'all'] as const,
  responseTimeOverTime: (hours: number, projectId?: string) => [...analyticsKeys.all, 'responseTimeOverTime', hours, projectId ?? 'all'] as const,
  requestsPerServer: (projectId?: string) => [...analyticsKeys.all, 'requestsPerServer', projectId ?? 'all'] as const,
  healthDistribution: (projectId?: string) => [...analyticsKeys.all, 'healthDistribution', projectId ?? 'all'] as const,
  activeConnections: (projectId?: string) => [...analyticsKeys.all, 'activeConnections', projectId ?? 'all'] as const,
};

export function useDashboardData(
  projectId?: string,
  options?: Omit<UseQueryOptions<ActionResult<CombinedDashboardData>>, 'queryKey' | 'queryFn'>
) {
  const { refetchInterval } = useRefresh();
  return useQuery({
    queryKey: analyticsKeys.combined(projectId),
    queryFn: () => getDashboardSnapshotAction(projectId),
    refetchInterval,
    refetchOnWindowFocus: false,
    staleTime: typeof refetchInterval === 'number' ? refetchInterval : Infinity,
    ...options,
  });
}

export function useDashboardStats(
  projectId?: string,
  options?: Omit<UseQueryOptions<ActionResult<DashboardStats>>, 'queryKey' | 'queryFn'>
) {
  const { refetchInterval } = useRefresh();
  return useQuery({
    queryKey: analyticsKeys.stats(projectId),
    queryFn: () => getDashboardStatsAction(projectId),
    refetchInterval,
    refetchOnWindowFocus: false,
    staleTime: typeof refetchInterval === 'number' ? refetchInterval : Infinity,
    ...options,
  });
}

export function useServerMetrics(
  projectId?: string,
  options?: Omit<UseQueryOptions<ActionResult<ServerMetric[]>>, 'queryKey' | 'queryFn'>
) {
  const { refetchInterval } = useRefresh();
  return useQuery({
    queryKey: analyticsKeys.serverMetrics(projectId),
    queryFn: () => getServerMetricsAction(projectId),
    refetchInterval,
    refetchOnWindowFocus: false,
    staleTime: typeof refetchInterval === 'number' ? refetchInterval : Infinity,
    ...options,
  });
}

export function useRequestsOverTime(
  hours = 24,
  projectId?: string,
  options?: Omit<UseQueryOptions<ActionResult<ChartDataPoint[]>>, 'queryKey' | 'queryFn'>
) {
  const { refetchInterval } = useRefresh();
  return useQuery({
    queryKey: analyticsKeys.requestsOverTime(hours, projectId),
    queryFn: () => getRequestsOverTimeAction(hours, projectId),
    refetchInterval,
    refetchOnWindowFocus: false,
    staleTime: typeof refetchInterval === 'number' ? refetchInterval : Infinity,
    ...options,
  });
}

export function useResponseTimeOverTime(
  hours = 24,
  projectId?: string,
  options?: Omit<UseQueryOptions<ActionResult<ChartDataPoint[]>>, 'queryKey' | 'queryFn'>
) {
  const { refetchInterval } = useRefresh();
  return useQuery({
    queryKey: analyticsKeys.responseTimeOverTime(hours, projectId),
    queryFn: () => getResponseTimeOverTimeAction(hours, projectId),
    refetchInterval,
    refetchOnWindowFocus: false,
    staleTime: typeof refetchInterval === 'number' ? refetchInterval : Infinity,
    ...options,
  });
}

export function useRequestsPerServer(
  projectId?: string,
  options?: Omit<UseQueryOptions<ActionResult<ChartDataPoint[]>>, 'queryKey' | 'queryFn'>
) {
  const { refetchInterval } = useRefresh();
  return useQuery({
    queryKey: analyticsKeys.requestsPerServer(projectId),
    queryFn: () => getRequestsPerServerAction(projectId),
    refetchInterval,
    refetchOnWindowFocus: false,
    staleTime: typeof refetchInterval === 'number' ? refetchInterval : Infinity,
    ...options,
  });
}

export function useHealthDistribution(
  projectId?: string,
  options?: Omit<UseQueryOptions<ActionResult<HealthDistributionItem[]>>, 'queryKey' | 'queryFn'>
) {
  const { refetchInterval } = useRefresh();
  return useQuery({
    queryKey: analyticsKeys.healthDistribution(projectId),
    queryFn: () => getHealthDistributionAction(projectId),
    refetchInterval,
    refetchOnWindowFocus: false,
    staleTime: typeof refetchInterval === 'number' ? refetchInterval : Infinity,
    ...options,
  });
}

export function useActiveConnections(
  projectId?: string,
  options?: Omit<UseQueryOptions<ActionResult<ChartDataPoint[]>>, 'queryKey' | 'queryFn'>
) {
  const { refetchInterval } = useRefresh();
  return useQuery({
    queryKey: analyticsKeys.activeConnections(projectId),
    queryFn: () => getActiveConnectionsOverTimeAction(1, projectId),
    refetchInterval,
    refetchOnWindowFocus: false,
    staleTime: typeof refetchInterval === 'number' ? refetchInterval : Infinity,
    ...options,
  });
}


