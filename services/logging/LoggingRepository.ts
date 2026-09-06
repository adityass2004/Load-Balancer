import { db } from '@/lib/db';
import { DatabaseError } from '@/lib/errors';
import type { RequestLog, HttpMethod } from '@/types/domain';

export type LogFilters = {
  projectId?: string;
  serverId?: string;
  backendId?: string;
  method?: HttpMethod;
  statusCode?: number;
  statusCategory?: 'success' | 'error' | 'all';
  search?: string;
  requestId?: string;
  dateFrom?: Date;
  dateTo?: Date;
};

export type LogQueryParams = LogFilters & {
  page?: number;
  pageSize?: number;
};

class LoggingRepository {
  async create(data: {
    projectId?: string | null;
    requestId: string;
    method: HttpMethod;
    route: string;
    backendId?: string | null;
    backendUrl?: string | null;
    statusCode?: number | null;
    responseTimeMs?: number | null;
    retryCount?: number;
    errorMessage?: string | null;
  }): Promise<RequestLog> {
    try {
      return await db.requestLog.create({ data }) as unknown as RequestLog;
    } catch (e) {
      throw new DatabaseError(`LoggingRepository.create failed: ${(e as Error).message}`);
    }
  }

  async findMany(params: LogQueryParams = {}): Promise<RequestLog[]> {
    const { page = 1, pageSize = 50, ...filters } = params;
    const where = this.buildWhere(filters);
    try {
      return await db.requestLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }) as unknown as RequestLog[];
    } catch (e) {
      throw new DatabaseError(`LoggingRepository.findMany failed: ${(e as Error).message}`);
    }
  }

  async count(filters: LogFilters = {}): Promise<number> {
    try {
      return await db.requestLog.count({ where: this.buildWhere(filters) });
    } catch (e) {
      throw new DatabaseError(`LoggingRepository.count failed: ${(e as Error).message}`);
    }
  }

  async findAll(filters: LogFilters = {}): Promise<RequestLog[]> {
    try {
      return await db.requestLog.findMany({
        where: this.buildWhere(filters),
        orderBy: { createdAt: 'desc' },
      }) as unknown as RequestLog[];
    } catch (e) {
      throw new DatabaseError(`LoggingRepository.findAll failed: ${(e as Error).message}`);
    }
  }

  async getRecentRequestsPerMinute(projectId?: string): Promise<number> {
    try {
      const oneMinuteAgo = new Date(Date.now() - 60_000);
      return await db.requestLog.count({
        where: {
          createdAt: { gte: oneMinuteAgo },
          ...(projectId ? { projectId } : {}),
        },
      });
    } catch (e) {
      throw new DatabaseError(`LoggingRepository.getRecentRequestsPerMinute failed: ${(e as Error).message}`);
    }
  }

  async getRequestsOverTime(hours = 24, projectId?: string): Promise<{ timestamp: Date; count: number }[]> {
    try {
      const now = new Date();
      const since = new Date(now.getTime() - hours * 3600_000);
      const logs = await db.requestLog.findMany({
        where: {
          createdAt: { gte: since },
          ...(projectId ? { projectId } : {}),
        },
        select: { createdAt: true },
        orderBy: { createdAt: 'asc' },
      });

      const buckets = new Map<string, number>();
      for (let h = 0; h < hours; h++) {
        const d = new Date(now.getTime() - (hours - 1 - h) * 3600_000);
        d.setMinutes(0, 0, 0);
        buckets.set(d.toISOString(), 0);
      }

      for (const log of logs) {
        const hour = new Date(log.createdAt);
        hour.setMinutes(0, 0, 0);
        const key = hour.toISOString();
        if (buckets.has(key)) {
          buckets.set(key, (buckets.get(key) ?? 0) + 1);
        }
      }

      return Array.from(buckets.entries()).map(([ts, count]) => ({
        timestamp: new Date(ts),
        count,
      }));
    } catch (e) {
      throw new DatabaseError(`getRequestsOverTime failed: ${(e as Error).message}`);
    }
  }

  async getResponseTimeOverTime(hours = 24, projectId?: string): Promise<{ timestamp: Date; avgMs: number }[]> {
    try {
      const now = new Date();
      const since = new Date(now.getTime() - hours * 3600_000);
      const logs = await db.requestLog.findMany({
        where: {
          createdAt: { gte: since },
          responseTimeMs: { not: null },
          ...(projectId ? { projectId } : {}),
        },
        select: { createdAt: true, responseTimeMs: true },
        orderBy: { createdAt: 'asc' },
      });

      const buckets = new Map<string, number[]>();
      for (let h = 0; h < hours; h++) {
        const d = new Date(now.getTime() - (hours - 1 - h) * 3600_000);
        d.setMinutes(0, 0, 0);
        buckets.set(d.toISOString(), []);
      }

      for (const log of logs) {
        if (log.responseTimeMs == null) continue;
        const hour = new Date(log.createdAt);
        hour.setMinutes(0, 0, 0);
        const key = hour.toISOString();
        if (buckets.has(key)) {
          buckets.get(key)!.push(log.responseTimeMs);
        }
      }

      return Array.from(buckets.entries()).map(([ts, vals]) => ({
        timestamp: new Date(ts),
        avgMs: vals.length > 0 ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : 0,
      }));
    } catch (e) {
      throw new DatabaseError(`getResponseTimeOverTime failed: ${(e as Error).message}`);
    }
  }

  async getRequestsPerServer(): Promise<{ backendUrl: string; count: number }[]> {
    try {
      const grouped = await db.requestLog.groupBy({
        by: ['backendUrl'],
        _count: { id: true },
        where: { backendUrl: { not: null } },
        orderBy: { _count: { id: 'desc' } },
      });
      return grouped
        .filter((g) => g.backendUrl != null)
        .map((g) => ({ backendUrl: g.backendUrl as string, count: g._count.id }));
    } catch (e) {
      throw new DatabaseError(`getRequestsPerServer failed: ${(e as Error).message}`);
    }
  }

  private buildWhere(filters: LogFilters) {
    const where: Record<string, unknown> = {};

    if (filters.projectId) where.projectId = filters.projectId;

    if (filters.backendId) where.backendId = filters.backendId;

    if (filters.method) where.method = filters.method;

    if (filters.statusCategory === 'success') {
      where.statusCode = { gte: 200, lt: 400 };
    } else if (filters.statusCategory === 'error') {
      where.statusCode = { gte: 400 };
    } else if (filters.statusCode !== undefined) {
      where.statusCode = filters.statusCode;
    }

    if (filters.dateFrom || filters.dateTo) {
      where.createdAt = {
        ...(filters.dateFrom ? { gte: filters.dateFrom } : {}),
        ...(filters.dateTo ? { lte: filters.dateTo } : {}),
      };
    }

    if (filters.requestId) {
      where.requestId = filters.requestId;
    }

    if (filters.search) {
      where.OR = [
        { requestId: { contains: filters.search, mode: 'insensitive' } },
        { route: { contains: filters.search, mode: 'insensitive' } },
        { backendUrl: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    return where;
  }
}

export const loggingRepository = new LoggingRepository();
