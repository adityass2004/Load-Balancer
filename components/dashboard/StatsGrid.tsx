'use client';

import React from 'react';
import type { DashboardStats } from '@/types/domain';

type StatCardProps = {
  title: string;
  value: string | number;
  subtitle?: string;
  color?: 'green' | 'red' | 'yellow' | 'blue' | 'gray' | 'purple';
  icon: React.ReactNode;
};

function StatCard({ title, value, subtitle, color = 'blue', icon }: StatCardProps) {
  const colorMap = {
    green: 'bg-green-50 border-green-200 text-green-700',
    red: 'bg-red-50 border-red-200 text-red-700',
    yellow: 'bg-amber-50 border-amber-200 text-amber-700',
    blue: 'bg-blue-50 border-blue-200 text-blue-700',
    gray: 'bg-gray-50 border-gray-200 text-gray-700',
    purple: 'bg-purple-50 border-purple-200 text-purple-700',
  };

  const iconColorMap = {
    green: 'text-green-500',
    red: 'text-red-500',
    yellow: 'text-amber-500',
    blue: 'text-blue-500',
    gray: 'text-gray-500',
    purple: 'text-purple-500',
  };

  return (
    <div className={`rounded-xl border-2 p-5 ${colorMap[color]} transition-all duration-200 hover:shadow-md`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider opacity-70">{title}</p>
          <p className="mt-1 text-3xl font-bold">{value}</p>
          {subtitle && <p className="mt-1 text-xs opacity-60">{subtitle}</p>}
        </div>
        <div className={`text-3xl ${iconColorMap[color]}`}>{icon}</div>
      </div>
    </div>
  );
}

function formatUptime(seconds: number): string {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (d > 0) return `${d}d ${h}h ${m}m`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

type StatsGridProps = {
  stats: DashboardStats;
};

export function StatsGrid({ stats }: StatsGridProps) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-5">
      <StatCard
        title="Total Servers"
        value={stats.totalServers}
        color="blue"
        icon={<span>🖥️</span>}
      />
      <StatCard
        title="Healthy"
        value={stats.healthyServers}
        color="green"
        icon={<span>✅</span>}
      />
      <StatCard
        title="Unhealthy"
        value={stats.unhealthyServers}
        color="red"
        icon={<span>❌</span>}
      />
      <StatCard
        title="Disabled"
        value={stats.disabledServers}
        color="gray"
        icon={<span>⛔</span>}
      />
      <StatCard
        title="Total Requests"
        value={stats.totalRequests.toLocaleString()}
        color="purple"
        icon={<span>📊</span>}
      />
      <StatCard
        title="Req / Minute"
        value={stats.requestsPerMinute}
        color="blue"
        icon={<span>⚡</span>}
      />
      <StatCard
        title="Avg Response"
        value={`${stats.avgResponseTime}ms`}
        color="yellow"
        icon={<span>⏱️</span>}
      />
      <StatCard
        title="Active Requests"
        value={stats.activeRequests}
        color="green"
        icon={<span>🔄</span>}
      />
      <StatCard
        title="Algorithm"
        value={stats.algorithm.replace(/_/g, ' ')}
        color="purple"
        icon={<span>🧠</span>}
      />
      <StatCard
        title="Uptime"
        value={formatUptime(stats.uptimeSeconds)}
        color="green"
        icon={<span>🕐</span>}
      />
    </div>
  );
}
