import { serverRepository } from '@/repositories/server.repository';
import { cacheService } from '@/services/cache/CacheService';
import { ConflictError, toActionError } from '@/lib/errors';
import { ok, fail, paginated, buildPaginationMeta } from '@/lib/response';
import type {
  CreateServerInput,
  UpdateServerInput,
  ServerHealthInput,
  ServerStatsInput,
  ServerQueryInput,
} from '@/lib/validations';
import type { Server } from '@/types/domain';
import type { ServerFilters } from '@/types/repository';
import type { ActionResult, PaginatedActionResult } from '@/types/api';

export const serverService = {
  async getAll(params: ServerQueryInput): Promise<PaginatedActionResult<Server>> {
    try {
      const [data, total] = await Promise.all([
        serverRepository.findManyWithQuery(params),
        serverRepository.count(params),
      ]);
      const meta = buildPaginationMeta(total, params.page, params.pageSize);
      return paginated(data, meta);
    } catch (e) {
      return { success: false, error: toActionError(e) };
    }
  },

  async getById(id: string): Promise<ActionResult<Server>> {
    try {
      const data = await serverRepository.findActiveByIdOrThrow(id);
      return ok(data);
    } catch (e) {
      return fail(e);
    }
  },

  async getEnabled(projectId?: string): Promise<ActionResult<Server[]>> {
    try {
      const data = await serverRepository.findEnabled(projectId);
      await cacheService.refreshServers();
      const merged = cacheService.mergeRuntimeState(data);
      return ok(merged);
    } catch (e) {
      return fail(e);
    }
  },

  async create(input: CreateServerInput): Promise<ActionResult<Server>> {
    try {
      const projectId = input.projectId ?? null;
      const existing = await serverRepository.findByUrlAndProject(input.url, projectId);
      if (existing) {
        throw new ConflictError(
          `A server with URL "${input.url}" already exists in this project`
        );
      }

      const data = await serverRepository.create(input);
      return ok(data);
    } catch (e) {
      return fail(e);
    }
  },

  async update(id: string, input: UpdateServerInput): Promise<ActionResult<Server>> {
    try {
      const current = await serverRepository.findActiveByIdOrThrow(id);
      const projectId =
        input.projectId !== undefined ? input.projectId ?? null : current.projectId ?? null;
      const url = input.url ?? current.url;

      const existing = await serverRepository.findByUrlAndProject(url, projectId, id);
      if (existing) {
        throw new ConflictError(
          `A server with URL "${url}" already exists in this project`
        );
      }

      const data = await serverRepository.update(id, input);
      return ok(data);
    } catch (e) {
      return fail(e);
    }
  },

  async enable(id: string): Promise<ActionResult<Server>> {
    try {
      await serverRepository.findActiveByIdOrThrow(id);
      const data = await serverRepository.setEnabled(id, true);
      return ok(data);
    } catch (e) {
      return fail(e);
    }
  },

  async disable(id: string): Promise<ActionResult<Server>> {
    try {
      await serverRepository.findActiveByIdOrThrow(id);
      const data = await serverRepository.setEnabled(id, false);
      return ok(data);
    } catch (e) {
      return fail(e);
    }
  },

  async softDelete(id: string): Promise<ActionResult<Server>> {
    try {
      await serverRepository.findActiveByIdOrThrow(id);
      const data = await serverRepository.softDelete(id);
      return ok(data);
    } catch (e) {
      return fail(e);
    }
  },

  async restore(id: string): Promise<ActionResult<Server>> {
    try {
      const data = await serverRepository.restore(id);
      return ok(data);
    } catch (e) {
      return fail(e);
    }
  },

  async updateHealth(id: string, input: ServerHealthInput): Promise<ActionResult<Server>> {
    try {
      const data = await serverRepository.updateHealth(id, input);
      return ok(data);
    } catch (e) {
      return fail(e);
    }
  },

  async updateStats(id: string, input: ServerStatsInput): Promise<ActionResult<Server>> {
    try {
      const data = await serverRepository.updateStats(id, input);
      return ok(data);
    } catch (e) {
      return fail(e);
    }
  },

  async count(filters?: ServerFilters): Promise<ActionResult<number>> {
    try {
      const data = await serverRepository.count(filters);
      return ok(data);
    } catch (e) {
      return fail(e);
    }
  },
};
