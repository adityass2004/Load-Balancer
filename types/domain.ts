import { Algorithm, ServerHealth, HttpMethod } from '@/src/generated/prisma';

// ─── Re-export Prisma enums for use across the app ─────────────────────────────

export { Algorithm, ServerHealth, HttpMethod };

// ─── Project ───────────────────────────────────────────────────────────────────

export type Project = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date;
};

// ─── Server ────────────────────────────────────────────────────────────────────

export type Server = {
  id: string;
  projectId?: string | null;
  name: string;
  url: string;
  enabled: boolean;
  healthy: ServerHealth;
  weight: number;
  priority: number;
  requestsHandled: number;
  activeRequests: number;
  lastHealthCheck: Date | null;
  averageResponseTime: number;
  failureCount: number;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

// Lightweight projection for list views
export type ServerSummary = Pick<
  Server,
  'id' | 'name' | 'url' | 'enabled' | 'healthy' | 'weight' | 'priority' | 'createdAt'
>;

// ─── Settings ───────────────────────────────────────────────────────────────

export type Settings = {
  id: string;
  projectId?: string | null;
  algorithm: Algorithm;
  healthCheckInterval: number;
  healthCheckTimeout: number;
  maxFailures: number;
  autoRecovery: boolean;
  requestTimeout: number;
  maxRetries: number;
  createdAt: Date;
  updatedAt: Date;
};

// ─── Request Log ────────────────────────────────────────────────────────────

export type RequestLog = {
  id: string;
  projectId?: string | null;
  requestId: string;
  method: HttpMethod;
  route: string;
  backendId: string | null;
  backendUrl: string | null;
  statusCode: number | null;
  responseTimeMs: number | null;
  retryCount: number;
  errorMessage: string | null;
  createdAt: Date;
};

// ─── Analytics Types ─────────────────────────────────────────────────────────

export type DashboardStats = {
  totalServers: number;
  healthyServers: number;
  unhealthyServers: number;
  disabledServers: number;
  totalRequests: number;
  requestsPerMinute: number;
  avgResponseTime: number;
  activeRequests: number;
  algorithm: Algorithm;
  uptimeSeconds: number;
};

export type ServerMetric = {
  id: string;
  name: string;
  url: string;
  status: ServerHealth;
  enabled: boolean;
  requestsHandled: number;
  activeRequests: number;
  averageResponseTime: number;
  lastHealthCheck: Date | null;
  failureCount: number;
  uptimePercent: number;
};

export type ChartDataPoint = {
  timestamp: string;
  value: number;
  label?: string;
};

export type HealthDistributionItem = {
  name: string;
  value: number;
  color: string;
};

export type CombinedDashboardData = {
  stats: DashboardStats | null;
  serverMetrics: ServerMetric[];
  requestsOverTime: ChartDataPoint[];
  responseTimeOverTime: ChartDataPoint[];
  requestsPerServer: ChartDataPoint[];
  healthDistribution: HealthDistributionItem[];
  activeConnections: ChartDataPoint[];
  timestamp: string;
};
