import { createHealthService } from './HealthService';
import type { HealthCheckResult, HealthConfig, MonitorStatus } from '@/types/health';

export class HealthMonitor {
  private service: ReturnType<typeof createHealthService>;
  private config: HealthConfig;
  private intervalHandle: ReturnType<typeof setInterval> | null = null;
  // Prevents two runCycle() calls from executing concurrently (e.g. scheduled
  // tick fires while a manual checkAllServers() call is still in-flight).
  private cycleInFlight: Promise<HealthCheckResult[]> | null = null;

  private status: MonitorStatus = {
    running: false,
    intervalMs: 0,
    lastRunAt: null,
    serversChecked: 0,
    totalChecks: 0,
    totalFailures: 0,
  };

  constructor(config: HealthConfig) {
    this.config = config;
    this.service = createHealthService(config);
    this.status.intervalMs = config.intervalMs;
  }

  async start(): Promise<HealthCheckResult[]> {
    if (this.intervalHandle) {
      console.log('[HealthMonitor] Already running — skipping start');
      return [];
    }

    console.log(`[HealthMonitor] Starting. Interval: ${this.config.intervalMs}ms | Timeout: ${this.config.timeoutMs}ms | MaxFailures: ${this.config.maxFailures}`);

    this.status.running = true;

    const firstResults = await this.runCycle();

    this.intervalHandle = setInterval(() => {
      this.runCycle();
    }, this.config.intervalMs);

    return firstResults;
  }

  stop(): void {
    if (!this.intervalHandle) {
      console.log('[HealthMonitor] Not running — nothing to stop');
      return;
    }

    clearInterval(this.intervalHandle);
    this.intervalHandle = null;
    this.status.running = false;

    console.log('[HealthMonitor] Stopped.');
  }

  async checkAllServers(): Promise<HealthCheckResult[]> {
    return this.service.checkAllServers();
  }

  async checkServer(server: Parameters<typeof this.service.checkServer>[0]): Promise<HealthCheckResult> {
    return this.service.checkServer(server);
  }

  updateConfig(config: HealthConfig): void {
    this.config = config;
    this.service.updateConfig(config);
    this.status.intervalMs = config.intervalMs;

    if (this.intervalHandle) {
      // stop() is synchronous; start() is async — fire-and-forget is safe here
      // because stop() clears the handle before start() creates a new one.
      this.stop();
      void this.start();
    }
  }

  getStatus(): MonitorStatus {
    return { ...this.status };
  }

  isRunning(): boolean {
    return this.status.running;
  }

  private runCycle(): Promise<HealthCheckResult[]> {
    // If a cycle is already executing, return the same promise instead of
    // starting a second concurrent cycle (prevents pile-up on slow backends).
    if (this.cycleInFlight) {
      return this.cycleInFlight;
    }

    this.cycleInFlight = this._doRunCycle().finally(() => {
      this.cycleInFlight = null;
    });
    return this.cycleInFlight;
  }

  private async _doRunCycle(): Promise<HealthCheckResult[]> {
    const cycleStart = Date.now();
    console.log(`[HealthMonitor] Running check cycle at ${new Date().toISOString()}`);

    try {
      const results = await this.service.checkAllServers();
      const failures = results.filter((r) => !r.success).length;

      this.status.lastRunAt = new Date();
      this.status.serversChecked = results.length;
      this.status.totalChecks += results.length;
      this.status.totalFailures += failures;

      const elapsed = Date.now() - cycleStart;
      console.log(`[HealthMonitor] Cycle complete. Checked: ${results.length} | Failures: ${failures} | Elapsed: ${elapsed}ms`);

      return results;
    } catch (e) {
      console.error(`[HealthMonitor] Cycle error: ${(e as Error).message}`);
      return [];
    }
  }
}
