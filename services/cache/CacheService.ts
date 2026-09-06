import { projectRepository } from '@/repositories/project.repository';
import { serverRepository } from '@/repositories/server.repository';
import { settingsRepository } from '@/repositories/settings.repository';
import type { Project, Server, Settings } from '@/types/domain';
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
  private projectsById: Map<string, Project> = new Map();
  private projectsBySlug: Map<string, Project> = new Map();
  private serversByProject: Map<string, Server[]> = new Map();
  private settingsByProject: Map<string, Settings> = new Map();
  private runtimeState: Map<string, ServerRuntimeState> = new Map();

  private isFetchingProjects = false;
  private isFetchingServers = false;
  private isFetchingSettings = false;

  private readonly DEFAULT_SETTINGS: Omit<Settings, 'id' | 'createdAt' | 'updatedAt'> = {
    projectId: null,
    algorithm: Algorithm.WEIGHTED_ROUND_ROBIN,
    healthCheckInterval: 30,
    healthCheckTimeout: 5,
    maxFailures: 3,
    autoRecovery: true,
    requestTimeout: 10000,
    maxRetries: 3,
  };

  async resolveProject(identifier: string): Promise<Project | null> {
    if (this.projectsById.size === 0 && this.projectsBySlug.size === 0) {
      await this.refreshProjects();
    }

    let project = this.projectsById.get(identifier) || this.projectsBySlug.get(identifier) || null;
    if (!project) {
      await this.refreshProjects();
      project = this.projectsById.get(identifier) || this.projectsBySlug.get(identifier) || null;
    }

    return project;
  }

  async getServersForProject(projectId: string): Promise<Server[]> {
    if (!this.serversByProject.has(projectId)) {
      await this.refreshServers();
    }
    const servers = (this.serversByProject.get(projectId) || [])
      .filter((server) => server.projectId === projectId);
    return this.mergeRuntimeState(servers);
  }

  async getSettingsForProject(projectId: string): Promise<Settings> {
    if (!this.settingsByProject.has(projectId)) {
      await this.refreshSettingsForProject(projectId);
    }
    return this.settingsByProject.get(projectId) || ({
      ...this.DEFAULT_SETTINGS,
      id: crypto.randomUUID(),
      projectId,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as Settings);
  }

  async getServers(): Promise<Server[]> {
    if (this.serversByProject.size === 0) {
      await this.refreshServers();
    }
    const allServers = Array.from(this.serversByProject.values()).flat();
    return this.mergeRuntimeState(allServers);
  }

  async getSettings(): Promise<Settings> {
    if (this.settingsByProject.size > 0) {
      const first = this.settingsByProject.values().next().value;
      if (first) return first;
    }
    await this.refreshSettings();
    const first = this.settingsByProject.values().next().value;
    return first || ({
      ...this.DEFAULT_SETTINGS,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    } as Settings);
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

  async refreshProjects(): Promise<void> {
    if (this.isFetchingProjects) return;
    this.isFetchingProjects = true;
    try {
      const projects = await projectRepository.findMany({}, { page: 1, pageSize: 100 });
      const newById = new Map<string, Project>();
      const newBySlug = new Map<string, Project>();

      for (const proj of projects) {
        newById.set(proj.id, proj);
        newBySlug.set(proj.slug, proj);
      }

      this.projectsById = newById;
      this.projectsBySlug = newBySlug;
    } catch (e) {
      console.error('[CACHE] Failed to refresh projects:', (e as Error).message);
    } finally {
      this.isFetchingProjects = false;
    }
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

      const grouped = new Map<string, Server[]>();
      let inited = 0;

      for (const server of newServers) {
        if (!this.runtimeState.has(server.id)) {
          this.runtimeState.set(server.id, DEFAULT_RUNTIME());
          inited += 1;
        }
        const pKey = server.projectId || 'unassigned';
        const list = grouped.get(pKey) || [];
        list.push(server);
        grouped.set(pKey, list);
      }

      if (inited > 0) {
        console.log(`[CACHE refreshServers] loaded ${newServers.length} enabled across ${grouped.size} project groups, ${inited} new runtime entries`);
      }

      this.serversByProject = grouped;
    } catch (e) {
      console.error('[CACHE] Failed to refresh servers:', (e as Error).message);
    } finally {
      this.isFetchingServers = false;
    }
  }

  async refreshSettingsForProject(projectId: string): Promise<void> {
    try {
      const settings = await settingsRepository.getOrCreate(this.DEFAULT_SETTINGS, projectId);
      this.settingsByProject.set(projectId, settings);
    } catch (e) {
      console.error(`[CACHE] Failed to refresh settings for project ${projectId}:`, (e as Error).message);
    }
  }

  async refreshSettings(): Promise<void> {
    if (this.isFetchingSettings) return;
    this.isFetchingSettings = true;
    try {
      await this.refreshProjects();
      for (const projectId of this.projectsById.keys()) {
        await this.refreshSettingsForProject(projectId);
      }
    } catch (e) {
      console.error('[CACHE] Failed to refresh settings:', (e as Error).message);
    } finally {
      this.isFetchingSettings = false;
    }
  }

  async refreshAll(): Promise<void> {
    await Promise.all([this.refreshProjects(), this.refreshServers(), this.refreshSettings()]);
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
        failureCount: state.failureCount,
        lastHealthCheck: state.lastHealthCheck ?? server.lastHealthCheck,
      };
    });
  }
}

export const cacheService = new CacheService();
