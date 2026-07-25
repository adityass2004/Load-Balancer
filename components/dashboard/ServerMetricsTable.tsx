'use client';

import type { ServerMetric } from '@/types/domain';
import { ServerHealth } from '@/src/generated/prisma';

type ServerMetricsTableProps = {
  metrics: ServerMetric[];
};

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

function UptimeBar({ percent }: { percent: number }) {
  const color = percent >= 99 ? 'bg-green-500' : percent >= 95 ? 'bg-amber-400' : 'bg-red-500';
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-20 rounded-full bg-gray-200">
        <div className={`h-1.5 rounded-full ${color}`} style={{ width: `${percent}%` }} />
      </div>
      <span className="text-xs font-medium text-gray-600">{percent}%</span>
    </div>
  );
}

function formatDate(date: Date | null) {
  if (!date) return '—';
  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(date));
}

export function ServerMetricsTable({ metrics }: ServerMetricsTableProps) {
  if (metrics.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-gray-300 p-10 text-center text-gray-400">
        No servers configured yet.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              {[
                'Name',
                'URL',
                'Status',
                'Requests',
                'Active',
                'Avg Response',
                'Last Health Check',
                'Failures',
                'Uptime',
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
          <tbody className="divide-y divide-gray-100 bg-white">
            {metrics.map((m) => (
              <tr key={m.id} className="transition-colors hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">{m.name}</td>
                <td className="max-w-[200px] truncate px-4 py-3 text-gray-500">
                  <a href={m.url} target="_blank" rel="noreferrer" className="hover:text-blue-600 hover:underline">
                    {m.url}
                  </a>
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={m.status} enabled={m.enabled} />
                </td>
                <td className="px-4 py-3 text-gray-700">{m.requestsHandled.toLocaleString()}</td>
                <td className="px-4 py-3">
                  <span className={`font-semibold ${m.activeRequests > 0 ? 'text-blue-600' : 'text-gray-400'}`}>
                    {m.activeRequests}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-700">
                  {m.averageResponseTime > 0 ? `${m.averageResponseTime}ms` : '—'}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-gray-500">
                  {formatDate(m.lastHealthCheck)}
                </td>
                <td className="px-4 py-3">
                  <span className={`font-semibold ${m.failureCount > 0 ? 'text-red-600' : 'text-gray-400'}`}>
                    {m.failureCount}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <UptimeBar percent={m.uptimePercent} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
