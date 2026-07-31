'use client';

import React from 'react';
import { useDashboardData } from '@/hooks/useAnalytics';
import { StatsGrid } from '@/components/dashboard/StatsGrid';
import { ServerMetricsTable } from '@/components/dashboard/ServerMetricsTable';
import { RequestsOverTimeChart } from '@/components/charts/RequestsOverTimeChart';
import { ResponseTimeChart } from '@/components/charts/ResponseTimeChart';
import { RequestsPerServerChart } from '@/components/charts/RequestsPerServerChart';
import { HealthDistributionChart } from '@/components/charts/HealthDistributionChart';
import { ActiveConnectionsChart } from '@/components/charts/ActiveConnectionsChart';

function SectionTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-4">
      <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
      {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
    </div>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <h3 className="mb-4 text-sm font-semibold text-gray-700">{title}</h3>
      {children}
    </div>
  );
}

import { useRefresh } from '@/context/RefreshContext';

function LiveIndicator() {
  const { enabled, intervalMs } = useRefresh();
  const label = intervalMs >= 1000 ? `${intervalMs / 1000}s` : `${intervalMs}ms`;

  return (
    <div className="flex items-center gap-2">
      <span className="relative flex h-2.5 w-2.5">
        {enabled && (
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
        )}
        <span
          className={`relative inline-flex h-2.5 w-2.5 rounded-full ${
            enabled ? 'bg-green-500' : 'bg-gray-400'
          }`}
        />
      </span>
      <span className={`text-xs font-medium ${enabled ? 'text-green-600' : 'text-gray-500'}`}>
        {enabled ? `Live — refreshes every ${label}` : 'Auto-refresh paused'}
      </span>
    </div>
  );
}

export default function DashboardPage() {
  const { data: snapshotResult, isLoading } = useDashboardData();

  const snapshot = snapshotResult?.success ? snapshotResult.data : null;

  const stats = snapshot?.stats ?? null;
  const metrics = snapshot?.serverMetrics ?? [];
  const requestsOverTime = snapshot?.requestsOverTime ?? [];
  const responseOverTime = snapshot?.responseTimeOverTime ?? [];
  const perServerData = snapshot?.requestsPerServer ?? [];
  const healthData = snapshot?.healthDistribution ?? [];
  const activeData = snapshot?.activeConnections ?? [];
  const statsLoading = isLoading;
  const metricsLoading = isLoading;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white px-6 py-5">
        <div className="mx-auto max-w-screen-2xl flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Monitoring Dashboard</h1>
            <p className="mt-0.5 text-sm text-gray-500">Real-time performance and health metrics</p>
          </div>
          <LiveIndicator />
        </div>
      </div>

      <div className="mx-auto max-w-screen-2xl space-y-8 px-6 py-6">
        {/* Stats Grid */}
        <section>
          <SectionTitle title="Overview" subtitle="System-wide metrics at a glance" />
          {statsLoading ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-5">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="h-24 animate-pulse rounded-xl bg-gray-200" />
              ))}
            </div>
          ) : stats ? (
            <StatsGrid stats={stats} />
          ) : (
            <p className="text-sm text-gray-400">Failed to load stats.</p>
          )}
        </section>

        {/* Charts */}
        <section>
          <SectionTitle title="Performance Charts" subtitle="Last 24 hours" />
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <ChartCard title="Requests Over Time">
              <RequestsOverTimeChart data={requestsOverTime} />
            </ChartCard>
            <ChartCard title="Avg Response Time (ms)">
              <ResponseTimeChart data={responseOverTime} />
            </ChartCard>
            <ChartCard title="Requests Per Server">
              <RequestsPerServerChart data={perServerData} />
            </ChartCard>
            <ChartCard title="Health Status Distribution">
              <HealthDistributionChart data={healthData} />
            </ChartCard>
          </div>
        </section>

        {/* Active Connections */}
        <section>
          <SectionTitle title="Active Connections" subtitle="Current active request count" />
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <ActiveConnectionsChart data={activeData} />
          </div>
        </section>

        {/* Server Metrics Table */}
        <section>
          <SectionTitle title="Server Metrics" subtitle="Detailed per-server performance" />
          {metricsLoading ? (
            <div className="h-40 animate-pulse rounded-xl bg-gray-200" />
          ) : (
            <ServerMetricsTable metrics={metrics ?? []} />
          )}
        </section>
      </div>
    </div>
  );
}
