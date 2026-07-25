'use client';

import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
} from '@tanstack/react-query';
import {
  getServersAction,
  getServerByIdAction,
  createServerAction,
  updateServerAction,
  deleteServerAction,
  enableServerAction,
  disableServerAction,
  restoreServerAction,
} from '@/actions/server.actions';
import { useRefresh } from '@/context/RefreshContext';
import type { Server } from '@/types/domain';
import type {
  ActionResult,
  PaginatedActionResult,
} from '@/types/api';
import type { ServerQueryInput } from '@/lib/validations';

// ─── Query key factory ─────────────────────────────────────────────────────────────

export const serverKeys = {
  all: ['servers'] as const,
  lists: () => [...serverKeys.all, 'list'] as const,
  list: (params: Partial<ServerQueryInput>) =>
    [...serverKeys.lists(), params] as const,
  details: () => [...serverKeys.all, 'detail'] as const,
  detail: (id: string) => [...serverKeys.details(), id] as const,
};

// ─── useServers ──────────────────────────────────────────────────────────────────

export function useServers(
  params: Partial<ServerQueryInput> = {},
  options?: Omit<UseQueryOptions<PaginatedActionResult<Server>>, 'queryKey' | 'queryFn'>
) {
  const { refetchInterval } = useRefresh();
  return useQuery({
    queryKey: serverKeys.list(params),
    queryFn: () => getServersAction(params),
    refetchInterval,
    refetchOnWindowFocus: false,
    staleTime: typeof refetchInterval === 'number' ? refetchInterval : Infinity,
    ...options,
  });
}

// ─── useServer (single) ───────────────────────────────────────────────────────────

export function useServer(
  id: string,
  options?: Omit<UseQueryOptions<ActionResult<Server>>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: serverKeys.detail(id),
    queryFn: () => getServerByIdAction(id),
    enabled: !!id,
    staleTime: 30_000,
    ...options,
  });
}

// ─── useCreateServer ────────────────────────────────────────────────────────────

export function useCreateServer() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: createServerAction,
    onSuccess: (result) => {
      if (!result.success) return;
      // Invalidate all server list queries
      qc.invalidateQueries({ queryKey: serverKeys.lists() });
    },
  });
}

// ─── useUpdateServer ────────────────────────────────────────────────────────────

export function useUpdateServer() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof updateServerAction>[1] }) =>
      updateServerAction(id, data),
    onSuccess: (result, { id }) => {
      if (!result.success) return;
      qc.invalidateQueries({ queryKey: serverKeys.lists() });
      qc.invalidateQueries({ queryKey: serverKeys.detail(id) });
    },
  });
}

// ─── useDeleteServer ────────────────────────────────────────────────────────────

export function useDeleteServer() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: deleteServerAction,
    onSuccess: (result, id) => {
      if (!result.success) return;
      qc.invalidateQueries({ queryKey: serverKeys.lists() });
      // Remove the detail cache entry immediately
      qc.removeQueries({ queryKey: serverKeys.detail(id) });
    },
  });
}

// ─── useEnableServer ────────────────────────────────────────────────────────────

export function useEnableServer() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: enableServerAction,
    onSuccess: (result, id) => {
      if (!result.success) return;
      qc.invalidateQueries({ queryKey: serverKeys.lists() });
      qc.invalidateQueries({ queryKey: serverKeys.detail(id) });
    },
  });
}

// ─── useDisableServer ───────────────────────────────────────────────────────────

export function useDisableServer() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: disableServerAction,
    onSuccess: (result, id) => {
      if (!result.success) return;
      qc.invalidateQueries({ queryKey: serverKeys.lists() });
      qc.invalidateQueries({ queryKey: serverKeys.detail(id) });
    },
  });
}

// ─── useRestoreServer ───────────────────────────────────────────────────────────

export function useRestoreServer() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: restoreServerAction,
    onSuccess: (result, id) => {
      if (!result.success) return;
      qc.invalidateQueries({ queryKey: serverKeys.lists() });
      qc.invalidateQueries({ queryKey: serverKeys.detail(id) });
    },
  });
}
