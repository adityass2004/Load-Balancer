import { projectRepository } from '@/repositories/project.repository';
import { settingsRepository } from '@/repositories/settings.repository';
import { ConflictError, toActionError } from '@/lib/errors';
import { ok, fail, paginated, buildPaginationMeta } from '@/lib/response';
import type {
  CreateProjectInput,
  UpdateProjectInput,
  ProjectQueryInput,
} from '@/lib/validations';
import type { Project } from '@/types/domain';
import type { ProjectFilters } from '@/types/repository';
import type { ActionResult, PaginatedActionResult } from '@/types/api';

const DEFAULT_PROJECT_SETTINGS = {
  algorithm: 'ROUND_ROBIN' as const,
  healthCheckInterval: 30,
  healthCheckTimeout: 5,
  maxFailures: 3,
  autoRecovery: true,
  requestTimeout: 10000,
  maxRetries: 3,
};

export const projectService = {
  async getAll(params: ProjectQueryInput): Promise<PaginatedActionResult<Project>> {
    try {
      const [data, total] = await Promise.all([
        projectRepository.findManyWithQuery(params),
        projectRepository.count(params),
      ]);
      const meta = buildPaginationMeta(total, params.page, params.pageSize);
      return paginated(data, meta);
    } catch (e) {
      return { success: false, error: toActionError(e) };
    }
  },

  async getById(id: string): Promise<ActionResult<Project>> {
    try {
      const data = await projectRepository.findByIdOrThrow(id);
      return ok(data);
    } catch (e) {
      return fail(e);
    }
  },

  async getBySlug(slug: string): Promise<ActionResult<Project>> {
    try {
      const data = await projectRepository.findBySlug(slug);
      if (!data) throw new ConflictError(`Project with slug "${slug}" not found`);
      return ok(data);
    } catch (e) {
      return fail(e);
    }
  },

  async create(input: CreateProjectInput): Promise<ActionResult<Project>> {
    try {
      const existing = await projectRepository.findBySlug(input.slug);
      if (existing) {
        throw new ConflictError(`A project with slug "${input.slug}" already exists`);
      }

      const project = await projectRepository.create(input);

      // Auto-initialize default settings for the new project
      await settingsRepository.getOrCreate(
        { ...DEFAULT_PROJECT_SETTINGS, projectId: project.id },
        project.id
      );

      return ok(project);
    } catch (e) {
      return fail(e);
    }
  },

  async update(id: string, input: UpdateProjectInput): Promise<ActionResult<Project>> {
    try {
      await projectRepository.findByIdOrThrow(id);

      if (input.slug) {
        const existing = await projectRepository.findBySlug(input.slug);
        if (existing && existing.id !== id) {
          throw new ConflictError(`A project with slug "${input.slug}" already exists`);
        }
      }

      const data = await projectRepository.update(id, input);
      return ok(data);
    } catch (e) {
      return fail(e);
    }
  },

  async enable(id: string): Promise<ActionResult<Project>> {
    try {
      await projectRepository.findByIdOrThrow(id);
      const data = await projectRepository.setEnabled(id, true);
      return ok(data);
    } catch (e) {
      return fail(e);
    }
  },

  async disable(id: string): Promise<ActionResult<Project>> {
    try {
      await projectRepository.findByIdOrThrow(id);
      const data = await projectRepository.setEnabled(id, false);
      return ok(data);
    } catch (e) {
      return fail(e);
    }
  },

  async delete(id: string): Promise<ActionResult<void>> {
    try {
      await projectRepository.findByIdOrThrow(id);
      await projectRepository.delete(id);
      return ok(undefined as void);
    } catch (e) {
      return fail(e);
    }
  },

  async count(filters?: ProjectFilters): Promise<ActionResult<number>> {
    try {
      const data = await projectRepository.count(filters);
      return ok(data);
    } catch (e) {
      return fail(e);
    }
  },
};
