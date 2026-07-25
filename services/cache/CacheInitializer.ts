import { cacheService } from './CacheService';
import { healthScheduler } from '@/services/health/HealthScheduler';

const REFRESH_INTERVAL_MS = 30_000;

class CacheInitializer {
  private isInitialized = false;
  private refreshInterval: ReturnType<typeof setInterval> | null = null;
  private initPromise: Promise<void> | null = null;
  private initializing = false;

  async init(): Promise<void> {
    if (this.isInitialized) return;

    if (this.initializing && this.initPromise) {
      await this.initPromise;
      return;
    }

    this.initializing = true;
    try {
      this.initPromise = this.doInit();
      await this.initPromise;
      this.isInitialized = true;
    } finally {
      this.initializing = false;
    }
  }

  private async doInit(): Promise<void> {
    await cacheService.refreshAll();
    await healthScheduler.startMonitoring();
    this.startAutoRefresh();
  }

  private startAutoRefresh(): void {
    if (this.refreshInterval) return;

    this.refreshInterval = setInterval(async () => {
      try {
        await cacheService.refreshAll();
      } catch (e) {
        console.error('[CACHE] Auto refresh failed:', (e as Error).message);
      }
    }, REFRESH_INTERVAL_MS);

    if (typeof process !== undefined) {
      process.on('beforeExit', () => this.stopAutoRefresh());
    }
  }

  private stopAutoRefresh(): void {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;
    }
  }

  reset(): void {
    this.stopAutoRefresh();
    this.isInitialized = false;
    this.initPromise = null;
    this.initializing = false;
  }

  isReady(): boolean {
    return this.isInitialized;
  }
}

export const cacheInitializer = new CacheInitializer();
