'use client';

import React, { useState, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { buildHealthUrl } from '@/lib/utils';
import { useRefresh } from '@/context/RefreshContext';
import { useProject } from '@/context/ProjectContext';
import {
  useServers,
  useCreateServer,
  useUpdateServer,
  useDeleteServer,
  useEnableServer,
  useDisableServer,
  serverKeys,
} from '@/hooks/useServers';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Power,
  PowerOff,
  Server as ServerIcon,
  X,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Activity,
  XCircle,
} from 'lucide-react';
import { ServerHealth } from '@/src/generated/prisma';
import type { Server } from '@/types/domain';
import { testServerConnectionAction } from '@/actions/server.actions';

// ─── Status Badge ──────────────────────────────────────────────────────────

function StatusBadge({ status, enabled }: { status: ServerHealth; enabled: boolean }) {
  if (!enabled) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-gray-600">
        <span className="h-1.5 w-1.5 rounded-full bg-gray-400" />
        Disabled
      </span>
    );
  }
  const map: Record<ServerHealth, { label: string; bg: string; text: string; dot: string }> = {
    [ServerHealth.HEALTHY]: { label: 'Healthy', bg: 'bg-green-100', text: 'text-green-700', dot: 'bg-green-500' },
    [ServerHealth.UNHEALTHY]: { label: 'Unhealthy', bg: 'bg-red-100', text: 'text-red-700', dot: 'bg-red-500' },
    [ServerHealth.UNKNOWN]: { label: 'Unknown', bg: 'bg-amber-100', text: 'text-amber-700', dot: 'bg-amber-400' },
  };
  const { label, bg, text, dot } = map[status];
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${bg} ${text}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
      {label}
    </span>
  );
}

// ─── Main Server Management Page ─────────────────────────────────────────────

export default function ServersPage() {
  const queryClient = useQueryClient();
  const { selectedProjectId, projects } = useProject();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'enabled' | 'disabled'>('all');
  const [healthFilter, setHealthFilter] = useState<'all' | ServerHealth>('all');

  // Query state — stable reference across renders
  const params = useMemo(
    () => ({
      projectId: selectedProjectId ?? undefined,
      search: search || undefined,
      enabled: statusFilter === 'all' ? undefined : statusFilter === 'enabled',
      healthy: healthFilter === 'all' ? undefined : healthFilter,
      page: 1,
      pageSize: 100, // retrieve all for management list
    }),
    [selectedProjectId, search, statusFilter, healthFilter]
  );

  const { refetchInterval } = useRefresh();

  const {
    data: result,
    isLoading,
    isRefetching,
    isError,
    error,
    refetch,
  } = useServers(params, {
    refetchInterval,
    refetchOnWindowFocus: false,
  });
  const servers = result?.success ? result.data : [];

  // Mutations
  const createServer = useCreateServer();
  const updateServer = useUpdateServer();
  const deleteServer = useDeleteServer();
  const enableServer = useEnableServer();
  const disableServer = useDisableServer();

  // Form State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingServer, setEditingServer] = useState<Server | null>(null);
  const [formProjectId, setFormProjectId] = useState<string | null>(selectedProjectId);
  const [formName, setFormName] = useState('');
  const [formUrl, setFormUrl] = useState('');
  const [formWeight, setFormWeight] = useState(1);
  const [formPriority, setFormPriority] = useState(0);
  const [formError, setFormError] = useState<string | null>(null);

  // Testing connection state (modal test)
  const [isTesting, setIsTesting] = useState(false);
  const [testSuccess, setTestSuccess] = useState<boolean | null>(null);
  const [testError, setTestError] = useState<string | null>(null);
  const [testLatency, setTestLatency] = useState<number | null>(null);

  // Per-row test state
  type RowTestResult = {
    state: 'idle' | 'loading' | 'success' | 'error';
    latencyMs?: number | null;
    statusCode?: number | null;
    message?: string | null;
  };
  const [rowTests, setRowTests] = useState<Record<string, RowTestResult>>({});

  const runRowTest = async (server: Server) => {
    const id = server.id;
    setRowTests((prev) => ({ ...prev, [id]: { state: 'loading' } }));
    try {
      const res = await testServerConnectionAction(server.url, server.id);
      if (!res.success) {
        setRowTests((prev) => ({
          ...prev,
          [id]: { state: 'error', message: res.error || 'Failed to reach server' },
        }));
      } else {
        setRowTests((prev) => ({
          ...prev,
          [id]: {
            state: 'success',
            latencyMs: res.data.latencyMs,
            statusCode: res.data.statusCode,
          },
        }));
      }
    } catch (err) {
      setRowTests((prev) => ({
        ...prev,
        [id]: {
          state: 'error',
          message: (err as Error).message || 'Unexpected error during test',
        },
      }));
    } finally {
      queryClient.invalidateQueries({ queryKey: serverKeys.lists() });
      queryClient.invalidateQueries({ queryKey: serverKeys.detail(id) });
    }
  };

  const openAddForm = () => {
    setEditingServer(null);
    setFormProjectId(selectedProjectId ?? (projects[0]?.id || null));
    setFormName('');
    setFormUrl('');
    setFormWeight(1);
    setFormPriority(0);
    setFormError(null);
    setTestSuccess(null);
    setTestError(null);
    setTestLatency(null);
    setIsFormOpen(true);
  };

  const openEditForm = (server: Server) => {
    setEditingServer(server);
    setFormProjectId(server.projectId || selectedProjectId || null);
    setFormName(server.name);
    setFormUrl(server.url);
    setFormWeight(server.weight);
    setFormPriority(server.priority);
    setFormError(null);
    setTestSuccess(null);
    setTestError(null);
    setTestLatency(null);
    setIsFormOpen(true);
  };

  const handleTestConnection = async () => {
    if (!formUrl.trim()) {
      setTestError('Please enter a target URL to test');
      setTestSuccess(false);
      return;
    }
    if (!formUrl.startsWith('http://') && !formUrl.startsWith('https://')) {
      setTestError('URL must start with http:// or https://');
      setTestSuccess(false);
      return;
    }

    setIsTesting(true);
    setTestError(null);
    setTestSuccess(null);
    setTestLatency(null);

    try {
      const res = await testServerConnectionAction(formUrl);
      if (res.success) {
        setTestSuccess(true);
        setTestLatency(res.data.latencyMs);
      } else {
        setTestSuccess(false);
        setTestError(res.error || 'Server is offline or unreachable');
      }
    } catch (err) {
      setTestSuccess(false);
      setTestError((err as Error).message || 'Connection check failed');
    } finally {
      setIsTesting(false);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Simple manual validation match schema
    if (!formName.trim()) return setFormError('Name is required');
    if (!formUrl.trim()) return setFormError('URL is required');
    if (!formUrl.startsWith('http://') && !formUrl.startsWith('https://')) {
      return setFormError('URL must start with http:// or https://');
    }

    // Require successful test connection before adding a new server
    if (!editingServer && testSuccess !== true) {
      return setFormError('You must successfully test the connection before adding the server.');
    }

    try {
      if (editingServer) {
        const res = await updateServer.mutateAsync({
          id: editingServer.id,
          data: {
            projectId: formProjectId || null,
            name: formName,
            url: formUrl,
            weight: formWeight,
            priority: formPriority,
          },
        });
        if (!res.success) {
          setFormError(res.error);
        } else {
          setIsFormOpen(false);
        }
      } else {
        const res = await createServer.mutateAsync({
          projectId: formProjectId || selectedProjectId || null,
          name: formName,
          enabled: true,
          url: formUrl,
          weight: formWeight,
          priority: formPriority,
        });
        if (!res.success) {
          setFormError(res.error);
        } else {
          setIsFormOpen(false);
        }
      }
    } catch (err) {
      setFormError((err as Error).message || 'An error occurred while saving the server');
    }
  };

  const handleToggleEnable = async (server: Server) => {
    try {
      if (server.enabled) {
        await disableServer.mutateAsync(server.id);
      } else {
        await enableServer.mutateAsync(server.id);
      }
    } catch (err) {
      alert((err as Error).message || 'Failed to toggle server state');
    }
  };

  const handleDeleteServer = async (id: string) => {
    if (!confirm('Are you sure you want to delete this server?')) return;
    try {
      await deleteServer.mutateAsync(id);
    } catch (err) {
      alert((err as Error).message || 'Failed to delete server');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white px-6 py-5">
        <div className="mx-auto max-w-screen-2xl flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Backend Servers</h1>
            <p className="mt-0.5 text-sm text-gray-500">Configure and manage targets in the pool</p>
          </div>
          <button
            onClick={openAddForm}
            className="flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 transition"
          >
            <Plus className="h-4 w-4" />
            Add Server
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-screen-2xl px-6 py-6 space-y-5">
        {/* Filters */}
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {/* Search */}
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                <Search className="h-4 w-4" />
              </span>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name or URL…"
                className="w-full rounded-lg border border-gray-300 pl-9 pr-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Status Filter */}
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as 'all' | 'enabled' | 'disabled')}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="all">All Enabled States</option>
                <option value="enabled">Enabled Only</option>
                <option value="disabled">Disabled Only</option>
              </select>
            </div>

            {/* Health Filter */}
            <div>
              <select
                value={healthFilter}
                onChange={(e) => setHealthFilter(e.target.value as 'all' | ServerHealth)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="all">All Health States</option>
                <option value={ServerHealth.HEALTHY}>Healthy Only</option>
                <option value={ServerHealth.UNHEALTHY}>Unhealthy Only</option>
                <option value={ServerHealth.UNKNOWN}>Unknown Only</option>
              </select>
            </div>
          </div>
        </div>

        {/* Error Banner */}
        {(isError || (result && !result.success)) && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-red-800">
                Failed to load servers
              </p>
              <p className="text-sm text-red-700 mt-1">
                {isError
                  ? (error instanceof Error ? error.message : 'Unknown network error')
                  : (!result.success ? (result as any).error : undefined)}
              </p>
              <button
                onClick={() => refetch()}
                className="mt-3 inline-flex items-center gap-2 rounded-lg border border-red-300 bg-white px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50"
              >
                <Loader2 className="h-3.5 w-3.5" />
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Server List Table */}
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          {(isLoading || isRefetching) && (
            <div className="h-1 w-full bg-blue-500 animate-pulse" />
          )}

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  {['Server details', 'Status', 'Weight', 'Priority', 'Requests Handled', 'Active Requests', 'Actions'].map((h) => (
                    <th
                      key={h}
                      className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {isLoading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 7 }).map((_, j) => (
                        <td key={j} className="px-4 py-4">
                          <div className="h-4 animate-pulse rounded bg-gray-200 w-24" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : servers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-16 text-center text-gray-500">
                      <ServerIcon className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                      <p className="font-medium text-gray-600 mb-1">
                        No backend servers found matching filters.
                      </p>
                      <ul className="mt-3 inline-block text-left text-xs text-gray-500 space-y-1">
                        <li>💡 Newly created servers start in <span className="font-semibold">Disabled</span> state.</li>
                        <li>💡 Edited servers are auto-disabled after every change.</li>
                        <li>💡 Set Status filter to <span className="font-semibold">&apos;All Enabled States&apos;</span> to see them.</li>
                        <li>💡 A server must pass a health check (<span className="font-semibold">HEALTHY</span>) before it can be Enabled.</li>
                      </ul>
                      <button
                        onClick={() => {
                          setSearch('');
                          setStatusFilter('all');
                          setHealthFilter('all');
                        }}
                        className="mt-5 inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                      >
                        Reset Filters
                      </button>
                    </td>
                  </tr>
                ) : (
                  servers.map((server) => (
                    <tr key={server.id} className="transition-colors hover:bg-gray-50">
                      <td className="px-4 py-4">
                        <div className="font-semibold text-gray-900 flex items-center gap-2">
                          <span>{server.name}</span>
                          {(() => {
                            const proj = projects.find((p) => p.id === server.projectId);
                            return proj ? (
                              <span className="rounded-md bg-gray-100 border border-gray-200 px-1.5 py-0.5 text-[10px] font-semibold text-gray-600">
                                {proj.name}
                              </span>
                            ) : server.projectId ? (
                              <span className="rounded-md bg-gray-100 border border-gray-200 px-1.5 py-0.5 text-[10px] font-semibold text-gray-400">
                                Project
                              </span>
                            ) : null;
                          })()}
                        </div>
                        <div className="text-xs text-gray-500 font-mono mt-0.5">{server.url}</div>
                        <div className="text-[10px] text-gray-400 font-mono mt-0.5">
                          health: {buildHealthUrl(server.url)}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <StatusBadge status={server.healthy} enabled={server.enabled} />
                      </td>
                      <td className="px-4 py-4 text-gray-700 font-medium">
                        {server.weight}
                      </td>
                      <td className="px-4 py-4 text-gray-700">
                        {server.priority}
                      </td>
                      <td className="px-4 py-4 text-gray-600">
                        {server.requestsHandled.toLocaleString()}
                      </td>
                      <td className="px-4 py-4">
                        <span className={`font-semibold ${server.activeRequests > 0 ? 'text-blue-600' : 'text-gray-400'}`}>
                          {server.activeRequests}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          {/* Toggle Status */}
                          {(() => {
                            const isEnableAction = !server.enabled;
                            const canEnable =
                              !isEnableAction || server.healthy === ServerHealth.HEALTHY;
                            const enableTitle = isEnableAction
                              ? canEnable
                                ? 'Enable Server'
                                : `Cannot enable — last health check: ${server.healthy}. Server must be HEALTHY first.`
                              : 'Disable Server';
                            return (
                              <button
                                onClick={() => handleToggleEnable(server)}
                                disabled={isEnableAction && !canEnable}
                                title={enableTitle}
                                className={`p-1.5 rounded-lg border transition ${
                                  server.enabled
                                    ? 'border-red-200 text-red-600 hover:bg-red-50'
                                    : canEnable
                                      ? 'border-green-200 text-green-600 hover:bg-green-50'
                                      : 'border-gray-200 text-gray-300 bg-gray-50 cursor-not-allowed'
                                }`}
                              >
                                {server.enabled ? (
                                  <PowerOff className="h-4 w-4" />
                                ) : (
                                  <Power className="h-4 w-4" />
                                )}
                              </button>
                            );
                          })()}

                          {/* Test Connection */}
                          {(() => {
                            const rowResult = rowTests[server.id] || { state: 'idle' as const };
                            let btnTitle = 'Test Connection';
                            if (rowResult.state === 'loading') btnTitle = 'Testing connection…';
                            else if (rowResult.state === 'success') {
                              const parts = [];
                              if (rowResult.statusCode !== undefined && rowResult.statusCode !== null)
                                parts.push(`HTTP ${rowResult.statusCode}`);
                              if (rowResult.latencyMs !== undefined && rowResult.latencyMs !== null)
                                parts.push(`${rowResult.latencyMs}ms`);
                              btnTitle = parts.length ? `Connected ✓ — ${parts.join(' • ')}` : 'Connected ✓';
                            } else if (rowResult.state === 'error') {
                              btnTitle = `Connection failed ✗ — ${rowResult.message || 'Unknown error'}`;
                            }
                            const isLoading = rowResult.state === 'loading';
                            const isSuccess = rowResult.state === 'success';
                            const isError = rowResult.state === 'error';
                            const btnClass = `p-1.5 rounded-lg border transition ${
                              isLoading
                                ? 'border-gray-200 text-gray-400 bg-gray-50 cursor-wait'
                                : isSuccess
                                  ? 'border-green-200 text-green-600 bg-green-50 hover:bg-green-100'
                                  : isError
                                    ? 'border-red-200 text-red-600 bg-red-50 hover:bg-red-100'
                                    : 'border-blue-200 text-blue-600 hover:bg-blue-50'
                            }`;
                            return (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  runRowTest(server);
                                }}
                                disabled={isLoading}
                                title={btnTitle}
                                className={btnClass}
                              >
                                {isLoading ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : isSuccess ? (
                                  <CheckCircle2 className="h-4 w-4" />
                                ) : isError ? (
                                  <XCircle className="h-4 w-4" />
                                ) : (
                                  <Activity className="h-4 w-4" />
                                )}
                              </button>
                            );
                          })()}

                          {/* Edit Server */}
                          <button
                            onClick={() => openEditForm(server)}
                            title="Edit Server Config"
                            className="p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>

                          {/* Delete Server */}
                          <button
                            onClick={() => handleDeleteServer(server.id)}
                            title="Delete Server"
                            className="p-1.5 rounded-lg border border-red-100 text-red-500 hover:bg-red-50 transition"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Form Dialog Backdrop/Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-6 shadow-xl relative animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => setIsFormOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="text-lg font-bold text-gray-900">
              {editingServer ? 'Edit Server Configuration' : 'Add Backend Server'}
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              {editingServer
                ? 'Modify parameters for routing target selection'
                : 'Configure a new server instance to balance incoming load'}
            </p>

            <form onSubmit={handleFormSubmit} className="mt-5 space-y-4">
              {formError && (
                <div className="flex items-start gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-100">
                  <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                  <div>{formError}</div>
                </div>
              )}

              {/* Associated Project */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wider">
                  Associated Project
                </label>
                <select
                  value={formProjectId || ''}
                  onChange={(e) => setFormProjectId(e.target.value || null)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white font-medium text-gray-900"
                >
                  <option value="">Unassigned / Global</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.slug})
                    </option>
                  ))}
                </select>
              </div>

              {/* Name */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wider">
                  Server Name
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Backend Node 1"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* URL with Test Button */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wider">
                  Target URL
                </label>
                <div className="flex gap-2 items-end">
                  <div className="flex-1">
                    <input
                      type="url"
                      required
                      value={formUrl}
                      onChange={(e) => {
                        setFormUrl(e.target.value);
                        setTestSuccess(null);
                        setTestError(null);
                        setTestLatency(null);
                      }}
                      placeholder="e.g. http://localhost:3000/"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleTestConnection}
                    disabled={isTesting || !formUrl.trim()}
                    className="rounded-lg border border-gray-300 bg-gray-50 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100 disabled:opacity-50 transition shrink-0 flex items-center gap-1.5 h-[38px]"
                  >
                    {isTesting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                    Test
                  </button>
                </div>

                {/* Resolved health endpoint hint */}
                {formUrl.trim() && (
                  <div className="mt-1 text-[11px] text-gray-400 font-mono flex items-center gap-1">
                    <Activity className="h-3 w-3 shrink-0" />
                    <span>
                      will test&nbsp;
                      <span className="text-gray-600 font-semibold">
                        {(() => {
                          try { return buildHealthUrl(formUrl.trim()); }
                          catch { return `${formUrl.trim().replace(/\/+$/, '')}/api/health`; }
                        })()}
                      </span>
                    </span>
                  </div>
                )}

                {/* Connection check visual feedback */}
                <div className="mt-1.5">
                  {testSuccess === true && (
                    <div className="flex items-center gap-1.5 text-xs text-green-600 font-medium">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>
                        Reachable &amp; online — {testLatency}ms
                        {' '}via&nbsp;
                        <span className="font-mono">
                          {(() => {
                            try { return buildHealthUrl(formUrl.trim()); }
                            catch { return '/api/health'; }
                          })()}
                        </span>
                      </span>
                    </div>
                  )}
                  {testSuccess === false && (
                    <div className="flex items-center gap-1.5 text-xs text-red-600 font-medium bg-red-50 border border-red-100 p-2 rounded-md">
                      <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                      <span>Test failed: {testError}</span>
                    </div>
                  )}
                  {testSuccess === null && !editingServer && (
                    <div className="text-[11px] text-gray-400 font-medium flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      <span>Test the /api/health endpoint to unlock saving</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Weight */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wider">
                    Weight (1-100)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    required
                    value={formWeight}
                    onChange={(e) => setFormWeight(Number(e.target.value))}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                {/* Priority */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wider">
                    Priority (&gt;= 0)
                  </label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={formPriority}
                    onChange={(e) => setFormPriority(Number(e.target.value))}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={(!editingServer && testSuccess !== true) || createServer.isPending || updateServer.isPending || isTesting}
                  className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 transition flex items-center gap-1.5 disabled:opacity-50"
                >
                  {(createServer.isPending || updateServer.isPending) && (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  )}
                  Save Server
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
