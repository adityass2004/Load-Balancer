import { Prisma } from '@/src/generated/prisma';
import { db } from '@/lib/db';
import { DatabaseError, NotFoundError } from '@/lib/errors';
import type {
  CreateServerInput,
  UpdateServerInput,
  ServerHealthInput,
  ServerStatsInput,
} from '@/lib/validations';
import type {
  IRepository,
  ServerFilters,
  ServerQueryParams,
  ServerSortField,
  PaginationParams,
  SortOrder,
} from '@/types/repository';
import type { Server } from '@/types/domain';

class ServerRepository implements IRepository<Server, CreateServerInput, UpdateServerInput, ServerFilters> {
  async findById(id: string): Promise<Server | null> {
    try {
      return await db.server.findUnique({ where: { id } });
    } catch (e) {
      throw new DatabaseError(`findById failed: ${(e as Error).message}`);
    }
  }

  async findByIdOrThrow(id: string): Promise<Server> {
    const server = await this.findById(id);
    if (!server) throw new NotFoundError('Server', id);
    return server;
  }

  async findActiveByIdOrThrow(id: string): Promise<Server> {
    try {
      const server = await db.server.findFirst({ where: { id, deletedAt: null } });
      if (!server) throw new NotFoundError('Server', id);
      return server;
    } catch (e) {
      if (e instanceof NotFoundError) throw e;
      throw new DatabaseError(`findActiveByIdOrThrow failed: ${(e as Error).message}`);
    }
  }

  async findByUrl(url: string): Promise<Server | null> {
    try {
      // Only check non-deleted servers for uniqueness
      return await db.server.findFirst({ where: { url, deletedAt: null } });
    } catch (e) {
      throw new DatabaseError(`findByUrl failed: ${(e as Error).message}`);
    }
  }

  async findMany(
    filters: ServerFilters = {},
    pagination: PaginationParams = {}
  ): Promise<Server[]> {
    const { page = 1, pageSize = 20 } = pagination;
    const where = buildServerWhere(filters);

    try {
      return await db.server.findMany({
        where,
        orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
        skip: (page - 1) * pageSize,
        take: pageSize,
      });
    } catch (e) {
      throw new DatabaseError(`findMany failed: ${(e as Error).message}`);
    }
  }

  async findManyWithQuery(params: ServerQueryParams): Promise<Server[]> {
    const {
      page = 1,
      pageSize = 20,
      sortField = 'createdAt',
      sortOrder = 'desc',
      ...filters
    } = params;

    const where = buildServerWhere(filters);
    const orderBy = buildServerOrderBy(sortField, sortOrder);

    try {
      return await db.server.findMany({
        where,
        orderBy,
        skip: (page - 1) * pageSize,
        take: pageSize,
      });
    } catch (e) {
      throw new DatabaseError(`findManyWithQuery failed: ${(e as Error).message}`);
    }
  }

  async findEnabled(): Promise<Server[]> {
    try {
      return await db.server.findMany({
        where: { enabled: true, deletedAt: null },
        orderBy: [{ priority: 'desc' }, { weight: 'desc' }],
      });
    } catch (e) {
      throw new DatabaseError(`findEnabled failed: ${(e as Error).message}`);
    }
  }

  async create(data: CreateServerInput): Promise<Server> {
    try {
      return await db.server.create({ data });
    } catch (e) {
      throw new DatabaseError(`create failed: ${(e as Error).message}`);
    }
  }

  async update(id: string, data: UpdateServerInput): Promise<Server> {
    try {
      return await db.server.update({ where: { id }, data });
    } catch (e) {
      throw new DatabaseError(`update failed: ${(e as Error).message}`);
    }
  }

  async updateHealth(id: string, data: ServerHealthInput): Promise<Server> {
    try {
      return await db.server.update({ where: { id }, data });
    } catch (e) {
      throw new DatabaseError(`updateHealth failed: ${(e as Error).message}`);
    }
  }

  async updateStats(id: string, data: ServerStatsInput): Promise<Server> {
    try {
      return await db.server.update({ where: { id }, data });
    } catch (e) {
      throw new DatabaseError(`updateStats failed: ${(e as Error).message}`);
    }
  }

  async setEnabled(id: string, enabled: boolean): Promise<Server> {
    try {
      return await db.server.update({ where: { id }, data: { enabled } });
    } catch (e) {
      throw new DatabaseError(`setEnabled failed: ${(e as Error).message}`);
    }
  }

  async softDelete(id: string): Promise<Server> {
    try {
      return await db.server.update({
        where: { id },
        data: { deletedAt: new Date(), enabled: false },
      });
    } catch (e) {
      throw new DatabaseError(`softDelete failed: ${(e as Error).message}`);
    }
  }

  async restore(id: string): Promise<Server> {
    try {
      return await db.server.update({
        where: { id },
        data: { deletedAt: null },
      });
    } catch (e) {
      throw new DatabaseError(`restore failed: ${(e as Error).message}`);
    }
  }

  async incrementRequests(id: string): Promise<Server> {
    try {
      return await db.server.update({
        where: { id },
        data: {
          requestsHandled: { increment: 1 },
          activeRequests: { increment: 1 },
        },
      });
    } catch (e) {
      throw new DatabaseError(`incrementRequests failed: ${(e as Error).message}`);
    }
  }

  async decrementActiveRequests(id: string): Promise<Server> {
    try {
      return await db.server.update({
        where: { id },
        data: { activeRequests: { decrement: 1 } },
      });
    } catch (e) {
      throw new DatabaseError(`decrementActiveRequests failed: ${(e as Error).message}`);
    }
  }

  async updateAverageResponseTime(id: string, latencyMs: number): Promise<Server> {
    try {
      const server = await db.server.findUnique({
        where: { id },
        select: { averageResponseTime: true },
      });
      const prev = server?.averageResponseTime ?? 0;
      const newAvg = prev === 0 ? latencyMs : Math.round(prev * 0.9 + latencyMs * 0.1);

      return await db.server.update({
        where: { id },
        data: { averageResponseTime: newAvg },
      });
    } catch (e) {
      throw new DatabaseError(`updateAverageResponseTime failed: ${(e as Error).message}`);
    }
  }

  async incrementFailureCount(id: string): Promise<Server> {
    try {
      return await db.server.update({
        where: { id },
        data: { failureCount: { increment: 1 } },
      });
    } catch (e) {
      throw new DatabaseError(`incrementFailureCount failed: ${(e as Error).message}`);
    }
  }

  async recordRequestCompletion(
    id: string,
    options: { latencyMs?: number; success: boolean }
  ): Promise<Server> {
    try {
      const server = await db.server.findUnique({
        where: { id },
        select: { averageResponseTime: true },
      });

      const prevAvg = server?.averageResponseTime ?? 0;
      const newAvg =
        options.success && options.latencyMs && options.latencyMs > 0
          ? prevAvg === 0
            ? options.latencyMs
            : Math.round(prevAvg * 0.9 + options.latencyMs * 0.1)
          : prevAvg;

      return await db.server.update({
        where: { id },
        data: {
          activeRequests: { decrement: 1 },
          averageResponseTime: newAvg,
          ...(options.success ? {} : { failureCount: { increment: 1 } }),
        },
      });
    } catch (e) {
      throw new DatabaseError(`recordRequestCompletion failed: ${(e as Error).message}`);
    }
  }

  // Hard delete — only used internally or for test cleanup
  async delete(id: string): Promise<void> {
    try {
      await db.server.delete({ where: { id } });
    } catch (e) {
      throw new DatabaseError(`delete failed: ${(e as Error).message}`);
    }
  }

  async count(filters: ServerFilters = {}): Promise<number> {
    try {
      return await db.server.count({ where: buildServerWhere(filters) });
    } catch (e) {
      throw new DatabaseError(`count failed: ${(e as Error).message}`);
    }
  }
}

// ─── Query builders ──────────────────────────────────────────────────────────────────

function buildServerWhere(filters: ServerFilters): Prisma.ServerWhereInput {
  const where: Prisma.ServerWhereInput = {};

  // Soft delete: exclude deleted by default
  where.deletedAt = filters.includeDeleted ? undefined : null;

  if (filters.enabled !== undefined) where.enabled = filters.enabled;
  if (filters.healthy !== undefined) where.healthy = filters.healthy;

  if (filters.search) {
    where.OR = [
      { name: { contains: filters.search, mode: 'insensitive' } },
      { url: { contains: filters.search, mode: 'insensitive' } },
    ];
  }

  return where;
}

function buildServerOrderBy(
  field: ServerSortField,
  order: SortOrder
): Prisma.ServerOrderByWithRelationInput[] {
  // Always secondary-sort by createdAt desc for stable pagination
  if (field === 'createdAt') return [{ createdAt: order }];
  return [{ [field]: order }, { createdAt: 'desc' }];
}

export const serverRepository = new ServerRepository();
