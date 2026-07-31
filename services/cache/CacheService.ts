import { serverRepository } from '@/repositories/server.repository';
import { settingsRepository } from '@/repositories/settings.repository';
import type { Server, Settings } from '@/types/domain';
import { Algorithm, ServerHealth } from '@/types/domain';

type ServerRuntimeState = {
  health: ServerHealth;
  activeRequests: number;
  failureCount: number;
  lastHealthCheck: Date | null;
};

const DEFAULT_RUNTIME = (): ServerRuntimeState => ({
  health: ServerHealth.UNKNOWN,
  activeRequests: 0,
  failureCount: 0,
  lastHealthCheck: null,
});

class CacheService {
  private servers: Server[] | null = null;
  private settings: Settings | null = null;
  private runtimeState: Map<string, ServerRuntimeState> = new Map();

  private isFetchingServers = false;
  private isFetchingSettings = false;

  private readonly DEFAULT_SETTINGS = {
    algorithm: Algorithm.WEIGHTED_ROUND_ROBIN,
    healthCheckInterval: 30,
    healthCheckTimeout: 5,
    maxFailures: 3,
    autoRecovery: true,
    requestTimeout: 10000,
    maxRetries: 3,
  };

  async getServers(): Promise<Server[]> {
    if (this.servers === null) {
      await this.refreshServers();
    }
    return this.mergeRuntimeState(this.servers || []);
  }

  async getSettings(): Promise<Settings> {
    if (this.settings === null) {
      await this.refreshSettings();
    }
    return this.settings || (this.DEFAULT_SETTINGS as unknown as Settings);
  }

  updateRuntimeMetrics(
    serverId: string,
    delta: {
      activeRequests?: number;
      success?: boolean;
    }
  ): void {
    const state = this.runtimeState.get(serverId);
    if (!state) return;

    if (delta.activeRequests !== undefined) {
      state.activeRequests = Math.max(0, state.activeRequests + delta.activeRequests);
    }

    if (delta.success === true && state.health !== ServerHealth.UNHEALTHY) {
      state.failureCount = 0;
    }
  }

  setRuntimeHealthState(
    serverId: string,
    health: ServerHealth,
    failureCount: number,
    latencyMs: number | null,
    checkedAt: Date
  ): boolean {
    let state = this.runtimeState.get(serverId);
    if (!state) {
      state = DEFAULT_RUNTIME();
      this.runtimeState.set(serverId, state);
    }
    state.health = health;
    state.failureCount = failureCount;
    state.lastHealthCheck = checkedAt;
    return true;
  }

  incrementFailureCountForRequest(serverId: string, checkedAt: Date): number {
    const state = this.runtimeState.get(serverId);
    if (!state) return 0;
    state.failureCount += 1;
    state.lastHealthCheck = checkedAt;
    return state.failureCount;
  }

  getCurrentHealth(serverId: string): ServerHealth {
    return this.runtimeState.get(serverId)?.health ?? ServerHealth.UNKNOWN;
  }

  getFailureCount(serverId: string): number {
    return this.runtimeState.get(serverId)?.failureCount ?? 0;
  }

  hasRuntime(serverId: string): boolean {
    return this.runtimeState.has(serverId);
  }

  removeRuntime(serverId: string): void {
    this.runtimeState.delete(serverId);
  }

  async refreshServers(): Promise<void> {
    if (this.isFetchingServers) return;
    this.isFetchingServers = true;
    try {
      const newServers = await serverRepository.findEnabled();
      const enabledIds = new Set(newServers.map((s) => s.id));

      for (const id of Array.from(this.runtimeState.keys())) {
        if (!enabledIds.has(id)) this.runtimeState.delete(id);
      }

      let inited = 0;
      for (const server of newServers) {
        if (!this.runtimeState.has(server.id)) {
          this.runtimeState.set(server.id, DEFAULT_RUNTIME());
          inited += 1;
        }
      }
      if (inited > 0) console.log(`[CACHE refreshServers] loaded ${newServers.length} enabled, ${inited} new runtime entries`);

      this.servers = newServers;
    } catch (e) {
      console.error('[CACHE] Failed to refresh servers:', (e as Error).message);
    } finally {
      this.isFetchingServers = false;
    }
  }

  async refreshSettings(): Promise<void> {
    if (this.isFetchingSettings) return;
    this.isFetchingSettings = true;
    try {
      const newSettings = await settingsRepository.getOrCreate(this.DEFAULT_SETTINGS);
      this.settings = newSettings;
    } catch (e) {
      console.error('[CACHE] Failed to refresh settings — keeping previous cache:', (e as Error).message);
    } finally {
      this.isFetchingSettings = false;
    }
  }

  async refreshAll(): Promise<void> {
    await Promise.all([this.refreshServers(), this.refreshSettings()]);
  }

  mergeRuntimeState(servers: Server[]): Server[] {
    return servers.map((server) => {
      const state = this.runtimeState.get(server.id);
      if (!state) return server;
      const dbHealth = server.healthy;
      const runtimeHealth = state.health;
      const effectiveHealth =
        runtimeHealth === ServerHealth.UNKNOWN &&
        (dbHealth === ServerHealth.HEALTHY || dbHealth === ServerHealth.UNHEALTHY)
          ? dbHealth
          : runtimeHealth;
      return {
        ...server,
        healthy: effectiveHealth,
        activeRequests: state.activeRequests,
        requestsHandled: server.requestsHandled,
        averageResponseTime: server.averageResponseTime,
        failureCount: server.failureCount,
        lastHealthCheck: state.lastHealthCheck ?? server.lastHealthCheck,
      };
    });
  }
}

export const cacheService = new CacheService();
