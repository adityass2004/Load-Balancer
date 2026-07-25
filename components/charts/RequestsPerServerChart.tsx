'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import type { ChartDataPoint } from '@/types/domain';

const COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

type RequestsPerServerChartProps = {
  data: ChartDataPoint[];
};

function truncateUrl(url: string, max = 20) {
  try {
    const u = new URL(url);
    const label = u.hostname + (u.port ? `:${u.port}` : '');
    return label.length > max ? label.slice(0, max) + '…' : label;
  } catch {
    return url.length > max ? url.slice(0, max) + '…' : url;
  }
}

export function RequestsPerServerChart({ data }: RequestsPerServerChartProps) {
  const chartData = data.map((d) => ({
    name: truncateUrl(d.label ?? ''),
    requests: d.value,
    fullUrl: d.label,
  }));

  if (chartData.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-xl border border-dashed border-gray-300 text-gray-400">
        No per-server data yet.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="name" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
        <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
        <Tooltip
          contentStyle={{ borderRadius: 8, fontSize: 12, border: '1px solid #e5e7eb' }}
          formatter={(v) => [v as number, 'Requests']}
          labelFormatter={(_, payload) => payload?.[0]?.payload?.fullUrl ?? ''}
        />
        <Bar dataKey="requests" radius={[4, 4, 0, 0]}>
          {chartData.map((_, index) => (
            <Cell key={index} fill={COLORS[index % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
