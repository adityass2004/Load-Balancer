'use client';

import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { getLogsAction } from '@/actions/logs.actions';
import { useRefresh } from '@/context/RefreshContext';
import type { LogQueryParams } from '@/services/logging/LoggingRepository';
import type { RequestLog } from '@/types/domain';
import type { PaginatedActionResult } from '@/types/api';

export const logKeys = {
  all: ['logs'] as const,
  lists: () => [...logKeys.all, 'list'] as const,
  list: (params: LogQueryParams) => [...logKeys.lists(), params] as const,
};

export function useLogs(
  params: LogQueryParams = {},
  options?: Omit<UseQueryOptions<PaginatedActionResult<RequestLog>>, 'queryKey' | 'queryFn'>
) {
  const { refetchInterval } = useRefresh();
  return useQuery({
    queryKey: logKeys.list(params),
    queryFn: () => getLogsAction(params),
    staleTime: typeof refetchInterval === 'number' ? refetchInterval : 0,
    refetchInterval,
    ...options,
  });
}
