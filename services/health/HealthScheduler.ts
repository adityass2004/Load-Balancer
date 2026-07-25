import { HealthMonitor } from './HealthMonitor';
import type { HealthConfig, IHealthScheduler, MonitorStatus, HealthCheckResult } from '@/types/health';
import { cacheService } from '@/services/cache/CacheService';
import type { Server } from '@/types/domain';

class HealthScheduler implements IHealthScheduler {
  private monitor: HealthMonitor | null = null;
  private config: HealthConfig | null = null;

  private startPromise: Promise<HealthCheckResult[]> | null = null;
  private isStarting = false;

  private readonly DEFAULT_CONFIG: HealthConfig = {
    intervalMs: 30000,
    timeoutMs: 5000,
    maxFailures: 3,
    autoRecovery: false
  };

  async startMonitoring(): Promise<HealthCheckResult[]> {
    if (this.monitor && this.monitor.isRunning()) {
      return []; // Already running — nothing to do
    }
    // Monitor exists but isRunning() is false — this happens during the brief
    // window while updateConfig() has called stop() but start() hasn't resolved
    // yet (fire-and-forget). Treat it as stale and clean up before restarting.
    if (this.monitor && !this.monitor.isRunning()) {
      this.monitor.stop();
      this.monitor = null;
      this.startPromise = null;
    }
    if (this.isStarting && this.startPromise) {
      return this.startPromise;
    }
    this.isStarting = true;
    try {
      this.startPromise = this.doStart();
      return await this.startPromise;
    } finally {
      this.isStarting = false;
    }
  }

  private async doStart(): Promise<HealthCheckResult[]> {
    await this.loadSettingsFromCache();
    const config = this.config || this.DEFAULT_CONFIG;

    // Always stop any existing monitor before creating a new one.
    // This prevents the old setInterval from becoming a ghost when doStart()
    // is called a second time (e.g. after a settings reload race).
    if (this.monitor) {
      this.monitor.stop();
    }

    this.monitor = new HealthMonitor(config);
    console.log(`[HealthScheduler] Starting HealthMonitor — interval: ${config.intervalMs}ms, timeout: ${config.timeoutMs}ms, maxFailures: ${config.maxFailures}`);

    return this.monitor.start();
  }

  async stopMonitoring(): Promise<void> {
    if (!this.monitor) return;
    this.monitor.stop();
    this.monitor = null;
    this.startPromise = null;
  }

  isMonitoringRunning(): boolean {
    return this.monitor ? this.monitor.isRunning() : false;
  }

  getMonitoringStatus(): MonitorStatus {
    if (!this.monitor) {
      return {
        running: false,
        intervalMs: 0,
        lastRunAt: null,
        serversChecked: 0,
        totalChecks: 0,
        totalFailures: 0,
      };
    }
    return this.monitor.getStatus();
  }

  async checkAllServers(): Promise<HealthCheckResult[]> {
    if (!this.monitor) {
      await this.startMonitoring();
    }
    if (!this.monitor) return [];
    return this.monitor.checkAllServers();
  }

  async checkServer(server: Server): Promise<HealthCheckResult> {
    if (!this.monitor) {
      await this.startMonitoring();
    }
    if (!this.monitor) {
      return {
        serverId: server.id,
        serverName: server.name,
        url: server.url,
        success: false,
        outcome: 'unknown_error',
        statusCode: null,
        latencyMs: 0,
        checkedAt: new Date(),
        error: 'Health monitor failed to start',
      };
    }
    return this.monitor.checkServer(server);
  }

  async runImmediateCycle(reason: string = 'manual'): Promise<HealthCheckResult[]> {
    if (!this.monitor) {
      await this.startMonitoring();
    }
    if (!this.monitor) return [];

    console.log(`[HealthScheduler] Triggering immediate cycle (reason: ${reason})`);
    try {
      return await this.monitor.checkAllServers();
    } catch (e) {
      console.error(`[HealthScheduler] Immediate cycle error: ${(e as Error).message}`);
      return [];
    }
  }

  async reloadConfig(): Promise<void> {
    await this.loadSettingsFromCache();
    if (this.monitor && this.config) {
      this.monitor.updateConfig(this.config);
    }
  }

  private async loadSettingsFromCache(): Promise<void> {
    try {
      const settings = await cacheService.getSettings();
      this.config = {
        autoRecovery: settings.autoRecovery ?? this.DEFAULT_CONFIG.autoRecovery,
        intervalMs: settings.healthCheckInterval * 1000,
        timeoutMs: settings.healthCheckTimeout * 1000,
        maxFailures: settings.maxFailures ?? this.DEFAULT_CONFIG.maxFailures,
      };
      console.log('[HealthScheduler] Config reloaded from Settings table');
    } catch (e) {
      console.warn(
        `[HealthScheduler] Failed to load settings from cache, using defaults: ${(e as Error).message}`
      );
      this.config = { ...this.DEFAULT_CONFIG };
    }
  }
}

export const healthScheduler = new HealthScheduler();
