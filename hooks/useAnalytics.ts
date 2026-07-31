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
  combined: () => [...analyticsKeys.all, 'combined'] as const,
  stats: () => [...analyticsKeys.all, 'stats'] as const,
  serverMetrics: () => [...analyticsKeys.all, 'serverMetrics'] as const,
  requestsOverTime: (hours: number) => [...analyticsKeys.all, 'requestsOverTime', hours] as const,
  responseTimeOverTime: (hours: number) => [...analyticsKeys.all, 'responseTimeOverTime', hours] as const,
  requestsPerServer: () => [...analyticsKeys.all, 'requestsPerServer'] as const,
  healthDistribution: () => [...analyticsKeys.all, 'healthDistribution'] as const,
  activeConnections: () => [...analyticsKeys.all, 'activeConnections'] as const,
};

export function useDashboardData(
  options?: Omit<UseQueryOptions<ActionResult<CombinedDashboardData>>, 'queryKey' | 'queryFn'>
) {
  const { refetchInterval } = useRefresh();
  return useQuery({
    queryKey: analyticsKeys.combined(),
    queryFn: getDashboardSnapshotAction,
    refetchInterval,
    refetchOnWindowFocus: false,
    staleTime: typeof refetchInterval === 'number' ? refetchInterval : Infinity,
    ...options,
  });
}

export function useDashboardStats(
  options?: Omit<UseQueryOptions<ActionResult<DashboardStats>>, 'queryKey' | 'queryFn'>
) {
  const { refetchInterval } = useRefresh();
  return useQuery({
    queryKey: analyticsKeys.stats(),
    queryFn: getDashboardStatsAction,
    refetchInterval,
    refetchOnWindowFocus: false,
    staleTime: typeof refetchInterval === 'number' ? refetchInterval : Infinity,
    ...options,
  });
}

export function useServerMetrics(
  options?: Omit<UseQueryOptions<ActionResult<ServerMetric[]>>, 'queryKey' | 'queryFn'>
) {
  const { refetchInterval } = useRefresh();
  return useQuery({
    queryKey: analyticsKeys.serverMetrics(),
    queryFn: getServerMetricsAction,
    refetchInterval,
    refetchOnWindowFocus: false,
    staleTime: typeof refetchInterval === 'number' ? refetchInterval : Infinity,
    ...options,
  });
}

export function useRequestsOverTime(
  hours = 24,
  options?: Omit<UseQueryOptions<ActionResult<ChartDataPoint[]>>, 'queryKey' | 'queryFn'>
) {
  const { refetchInterval } = useRefresh();
  return useQuery({
    queryKey: analyticsKeys.requestsOverTime(hours),
    queryFn: () => getRequestsOverTimeAction(hours),
    refetchInterval,
    refetchOnWindowFocus: false,
    staleTime: typeof refetchInterval === 'number' ? refetchInterval : Infinity,
    ...options,
  });
}

export function useResponseTimeOverTime(
  hours = 24,
  options?: Omit<UseQueryOptions<ActionResult<ChartDataPoint[]>>, 'queryKey' | 'queryFn'>
) {
  const { refetchInterval } = useRefresh();
  return useQuery({
    queryKey: analyticsKeys.responseTimeOverTime(hours),
    queryFn: () => getResponseTimeOverTimeAction(hours),
    refetchInterval,
    refetchOnWindowFocus: false,
    staleTime: typeof refetchInterval === 'number' ? refetchInterval : Infinity,
    ...options,
  });
}

export function useRequestsPerServer(
  options?: Omit<UseQueryOptions<ActionResult<ChartDataPoint[]>>, 'queryKey' | 'queryFn'>
) {
  const { refetchInterval } = useRefresh();
  return useQuery({
    queryKey: analyticsKeys.requestsPerServer(),
    queryFn: getRequestsPerServerAction,
    refetchInterval,
    refetchOnWindowFocus: false,
    staleTime: typeof refetchInterval === 'number' ? refetchInterval : Infinity,
    ...options,
  });
}

export function useHealthDistribution(
  options?: Omit<UseQueryOptions<ActionResult<HealthDistributionItem[]>>, 'queryKey' | 'queryFn'>
) {
  const { refetchInterval } = useRefresh();
  return useQuery({
    queryKey: analyticsKeys.healthDistribution(),
    queryFn: getHealthDistributionAction,
    refetchInterval,
    refetchOnWindowFocus: false,
    staleTime: typeof refetchInterval === 'number' ? refetchInterval : Infinity,
    ...options,
  });
}

export function useActiveConnections(
  options?: Omit<UseQueryOptions<ActionResult<ChartDataPoint[]>>, 'queryKey' | 'queryFn'>
) {
  const { refetchInterval } = useRefresh();
  return useQuery({
    queryKey: analyticsKeys.activeConnections(),
    queryFn: getActiveConnectionsOverTimeAction,
    refetchInterval,
    refetchOnWindowFocus: false,
    staleTime: typeof refetchInterval === 'number' ? refetchInterval : Infinity,
    ...options,
  });
}


