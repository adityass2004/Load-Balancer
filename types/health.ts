import type { Server } from './domain';

// ─── Health Check Result ───────────────────────────────────────────────────────

export type HealthStatus = 'healthy' | 'unhealthy' | 'unknown' | 'disabled';

export type HealthCheckOutcome =
  | 'success'
  | 'timeout'
  | 'connection_refused'
  | 'dns_failure'
  | 'invalid_url'
  | 'http_error'
  | 'network_error'
  | 'unknown_error';

export type HealthCheckResult = {
  serverId: string;
  serverName: string;
  url: string;
  success: boolean;
  outcome: HealthCheckOutcome;
  statusCode: number | null;
  latencyMs: number | null;
  checkedAt: Date;
  error: string | null;
};

// ─── Health Config (sourced from Settings table) ──────────────────────────────

export type HealthConfig = {
  intervalMs: number;       // healthCheckInterval * 1000
  timeoutMs: number;        // healthCheckTimeout * 1000
  maxFailures: number;      // threshold before marking unhealthy
  autoRecovery: boolean;    // whether to auto-recover on success
};

// ─── Health State Transition ──────────────────────────────────────────────────

export type HealthStateUpdate = {
  serverId: string;
  wasHealthy: boolean;
  isHealthy: boolean;
  recovered: boolean;
  failed: boolean;
  newFailureCount: number;
  latencyMs: number | null;
  checkedAt: Date;
};

// ─── Monitor Status ───────────────────────────────────────────────────────────

export type MonitorStatus = {
  running: boolean;
  intervalMs: number;
  lastRunAt: Date | null;
  serversChecked: number;
  totalChecks: number;
  totalFailures: number;
};

// ─── IHealthChecker interface ─────────────────────────────────────────────────

export interface IHealthChecker {
  check(server: Pick<Server, 'id' | 'name' | 'url'>, timeoutMs: number): Promise<HealthCheckResult>;
}

// ─── IHealthRepository interface ──────────────────────────────────────────────

export interface IHealthRepository {
  markHealthy(serverId: string, latencyMs: number, checkedAt: Date): Promise<void>;
  markUnhealthy(serverId: string, failureCount: number, checkedAt: Date): Promise<void>;
  incrementFailureCount(serverId: string, checkedAt: Date): Promise<number>;
  resetFailureCount(serverId: string): Promise<void>;
  getFailureCount(serverId: string): Promise<number>;
}

// ─── IHealthService interface ─────────────────────────────────────────────────

export interface IHealthService {
  checkServer(server: Server): Promise<HealthCheckResult>;
  checkAllServers(): Promise<HealthCheckResult[]>;
}

// ─── IHealthScheduler interface ───────────────────────────────────────────────

export interface IHealthScheduler {
  startMonitoring(): Promise<HealthCheckResult[]>;
  stopMonitoring(): Promise<void>;
  getMonitoringStatus(): MonitorStatus;
  isMonitoringRunning(): boolean;
  checkAllServers(): Promise<HealthCheckResult[]>;
  checkServer(server: Server): Promise<HealthCheckResult>;
  runImmediateCycle(reason?: string): Promise<HealthCheckResult[]>;
  reloadConfig(): Promise<void>;
}
