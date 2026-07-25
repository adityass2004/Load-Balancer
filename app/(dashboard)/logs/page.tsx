'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { useLogs } from '@/hooks/useLogs';
import { getAllLogsForExportAction } from '@/actions/logs.actions';
import type { LogQueryParams } from '@/services/logging/LoggingRepository';
import type { RequestLog, HttpMethod } from '@/types/domain';
import { AlertCircle, Loader2, FileText } from 'lucide-react';

// ─── CSV Export ──────────────────────────────────────────────────────────────

function exportToCsv(logs: RequestLog[]) {
  const headers = [
    'Timestamp',
    'Request ID',
    'Method',
    'Route',
    'Backend',
    'Status',
    'Response Time (ms)',
    'Retry Count',
    'Error',
  ];
  const rows = logs.map((l) => [
    new Date(l.createdAt).toISOString(),
    l.requestId,
    l.method,
    l.route,
    l.backendUrl ?? '',
    l.statusCode ?? '',
    l.responseTimeMs ?? '',
    l.retryCount,
    l.errorMessage ?? '',
  ]);
  const csv = [headers, ...rows].map((r) => r.map((v) => `"${v}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `trackit-logs-${Date.now()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function StatusCodeBadge({ code }: { code: number | null }) {
  if (code == null) return <span className="text-gray-400">—</span>;
  const color =
    code >= 500 ? 'bg-red-100 text-red-700' :
    code >= 400 ? 'bg-orange-100 text-orange-700' :
    code >= 300 ? 'bg-yellow-100 text-yellow-700' :
    'bg-green-100 text-green-700';
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${color}`}>{code}</span>
  );
}

function MethodBadge({ method }: { method: HttpMethod }) {
  const color: Record<string, string> = {
    GET: 'bg-blue-100 text-blue-700',
    POST: 'bg-green-100 text-green-700',
    PUT: 'bg-amber-100 text-amber-700',
    PATCH: 'bg-purple-100 text-purple-700',
    DELETE: 'bg-red-100 text-red-700',
    HEAD: 'bg-gray-100 text-gray-700',
    OPTIONS: 'bg-gray-100 text-gray-700',
  };
  return (
    <span className={`rounded px-1.5 py-0.5 text-xs font-bold ${color[method] ?? 'bg-gray-100 text-gray-600'}`}>
      {method}
    </span>
  );
}

function Pagination({
  page,
  totalPages,
  onPage,
}: {
  page: number;
  totalPages: number;
  onPage: (p: number) => void;
}) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3">
      <button
        onClick={() => onPage(page - 1)}
        disabled={page <= 1}
        className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40"
      >
        ← Previous
      </button>
      <span className="text-sm text-gray-500">
        Page {page} of {totalPages}
      </span>
      <button
        onClick={() => onPage(page + 1)}
        disabled={page >= totalPages}
        className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40"
      >
        Next →
      </button>
    </div>
  );
}

// ─── Main Logs Page ──────────────────────────────────────────────────────────

const HTTP_METHODS: HttpMethod[] = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'];

export default function LogsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [method, setMethod] = useState<HttpMethod | ''>('');
  const [statusCategory, setStatusCategory] = useState<'all' | 'success' | 'error'>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [exporting, setExporting] = useState(false);

  const params: LogQueryParams = useMemo(
    () => ({
      page,
      pageSize: 50,
      search: search || undefined,
      method: (method as HttpMethod) || undefined,
      statusCategory: statusCategory === 'all' ? undefined : statusCategory,
      dateFrom: dateFrom ? new Date(dateFrom) : undefined,
      dateTo: dateTo ? new Date(dateTo) : undefined,
    }),
    [page, search, method, statusCategory, dateFrom, dateTo]
  );

  const {
    data: result,
    isLoading,
    isRefetching,
    isError,
    error,
    refetch,
  } = useLogs(params);

  const logs = result?.success ? result.data : [];
  const meta = result?.success ? result.meta : null;

  const handleExport = useCallback(async () => {
    setExporting(true);
    try {
      const res = await getAllLogsForExportAction(params);
      if (res.success) exportToCsv(res.data);
    } finally {
      setExporting(false);
    }
  }, [params]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleReset = () => {
    setSearch('');
    setMethod('');
    setStatusCategory('all');
    setDateFrom('');
    setDateTo('');
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white px-6 py-5">
        <div className="mx-auto max-w-screen-2xl flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Request Logs</h1>
            <p className="mt-0.5 text-sm text-gray-500">
              {meta ? `${meta.total.toLocaleString()} total records` : 'Loading…'}
            </p>
          </div>
          <button
            onClick={handleExport}
            disabled={exporting}
            className="flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-60"
          >
            {exporting ? '⏳ Exporting…' : '⬇ Export CSV'}
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-screen-2xl px-6 py-6 space-y-5">
        {/* Filters */}
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
            {/* Search */}
            <div className="xl:col-span-2">
              <label className="mb-1 block text-xs font-semibold text-gray-500">Search</label>
              <input
                type="text"
                value={search}
                onChange={handleSearch}
                placeholder="Request ID, URL, backend…"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Method */}
            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-500">Method</label>
              <select
                value={method}
                onChange={(e) => { setMethod(e.target.value as HttpMethod | ''); setPage(1); }}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="">All Methods</option>
                {HTTP_METHODS.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-500">Status</label>
              <select
                value={statusCategory}
                onChange={(e) => { setStatusCategory(e.target.value as 'all' | 'success' | 'error'); setPage(1); }}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="all">All</option>
                <option value="success">Success (2xx/3xx)</option>
                <option value="error">Error (4xx/5xx)</option>
              </select>
            </div>

            {/* Date From */}
            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-500">From</label>
              <input
                type="datetime-local"
                value={dateFrom}
                onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Date To */}
            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-500">To</label>
              <input
                type="datetime-local"
                value={dateTo}
                onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="mt-3 flex justify-end">
            <button
              onClick={handleReset}
              className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50"
            >
              Reset Filters
            </button>
          </div>
        </div>

        {/* Error Banner */}
        {(isError || (result && !result.success)) && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-red-800">
                Failed to load request logs
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

        {/* Table */}
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          {(isLoading || isRefetching) && (
            <div className="h-0.5 w-full animate-pulse bg-blue-500" />
          )}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  {[
                    'Timestamp',
                    'Request ID',
                    'Method',
                    'Route',
                    'Backend',
                    'Status',
                    'Response Time',
                    'Retries',
                    'Error',
                  ].map((h) => (
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
                  Array.from({ length: 10 }).map((_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 9 }).map((_, j) => (
                        <td key={j} className="px-4 py-3">
                          <div className="h-3 animate-pulse rounded bg-gray-200" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : logs.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-16 text-center text-gray-500">
                      <FileText className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                      <p className="font-medium text-gray-600 mb-1">
                        No request logs found matching filters.
                      </p>
                      <ul className="mt-3 inline-block text-left text-xs text-gray-500 space-y-1">
                        <li>💡 Send traffic through the proxy first — logs are recorded on every routed request.</li>
                        <li>💡 Try clearing search/method/status filters or widening the date range.</li>
                        <li>💡 Logs are persisted to DB and retained per your configured retention policy.</li>
                      </ul>
                      <button
                        onClick={handleReset}
                        className="mt-5 inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                      >
                        Reset Filters
                      </button>
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log.id} className="transition-colors hover:bg-gray-50">
                      <td className="whitespace-nowrap px-4 py-3 text-xs text-gray-500">
                        {new Date(log.createdAt).toLocaleString('en-IN')}
                      </td>
                      <td className="px-4 py-3">
                        <span className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-xs text-gray-600">
                          {log.requestId.slice(0, 8)}…
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <MethodBadge method={log.method} />
                      </td>
                      <td className="max-w-[200px] truncate px-4 py-3 text-xs text-gray-700">
                        {log.route}
                      </td>
                      <td className="max-w-[160px] truncate px-4 py-3 text-xs text-gray-500">
                        {log.backendUrl ?? '—'}
                      </td>
                      <td className="px-4 py-3">
                        <StatusCodeBadge code={log.statusCode} />
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-700">
                        {log.responseTimeMs != null ? `${log.responseTimeMs}ms` : '—'}
                      </td>
                      <td className="px-4 py-3 text-center text-xs">
                        {log.retryCount > 0 ? (
                          <span className="font-semibold text-amber-600">{log.retryCount}</span>
                        ) : (
                          <span className="text-gray-400">0</span>
                        )}
                      </td>
                      <td className="max-w-[200px] truncate px-4 py-3 text-xs text-red-500">
                        {log.errorMessage ?? ''}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {meta && (
            <Pagination
              page={page}
              totalPages={meta.totalPages}
              onPage={setPage}
            />
          )}
        </div>
      </div>
    </div>
  );
}
