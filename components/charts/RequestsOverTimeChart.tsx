'use client';

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { ChartDataPoint } from '@/types/domain';

type RequestsOverTimeChartProps = {
  data: ChartDataPoint[];
};

function formatHour(iso: string) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}

export function RequestsOverTimeChart({ data }: RequestsOverTimeChartProps) {
  const chartData = data.map((d) => ({
    time: formatHour(d.timestamp),
    requests: d.value,
  }));

  if (chartData.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-xl border border-dashed border-gray-300 text-gray-400">
        No request data available yet.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <defs>
          <linearGradient id="reqGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25} />
            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="time" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
        <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
        <Tooltip
          contentStyle={{ borderRadius: 8, fontSize: 12, border: '1px solid #e5e7eb' }}
          formatter={(v) => [v as number, 'Requests']}
        />
        <Area
          type="monotone"
          dataKey="requests"
          stroke="#6366f1"
          strokeWidth={2.5}
          fill="url(#reqGrad)"
          dot={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
