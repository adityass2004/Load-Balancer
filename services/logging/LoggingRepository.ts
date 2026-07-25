import { db } from '@/lib/db';
import { DatabaseError } from '@/lib/errors';
import type { RequestLog, HttpMethod } from '@/types/domain';

export type LogFilters = {
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

  async getRecentRequestsPerMinute(): Promise<number> {
    try {
      const oneMinuteAgo = new Date(Date.now() - 60_000);
      return await db.requestLog.count({
        where: { createdAt: { gte: oneMinuteAgo } },
      });
    } catch (e) {
      throw new DatabaseError(`LoggingRepository.getRecentRequestsPerMinute failed: ${(e as Error).message}`);
    }
  }

  async getRequestsOverTime(hours = 24): Promise<{ timestamp: Date; count: number }[]> {
    try {
      const since = new Date(Date.now() - hours * 3600_000);
      const logs = await db.requestLog.findMany({
        where: { createdAt: { gte: since } },
        select: { createdAt: true },
        orderBy: { createdAt: 'asc' },
      });

      // Bucket by hour
      const buckets = new Map<string, number>();
      for (const log of logs) {
        const hour = new Date(log.createdAt);
        hour.setMinutes(0, 0, 0);
        const key = hour.toISOString();
        buckets.set(key, (buckets.get(key) ?? 0) + 1);
      }

      return Array.from(buckets.entries()).map(([ts, count]) => ({
        timestamp: new Date(ts),
        count,
      }));
    } catch (e) {
      throw new DatabaseError(`getRequestsOverTime failed: ${(e as Error).message}`);
    }
  }

  async getResponseTimeOverTime(hours = 24): Promise<{ timestamp: Date; avgMs: number }[]> {
    try {
      const since = new Date(Date.now() - hours * 3600_000);
      const logs = await db.requestLog.findMany({
        where: { createdAt: { gte: since }, responseTimeMs: { not: null } },
        select: { createdAt: true, responseTimeMs: true },
        orderBy: { createdAt: 'asc' },
      });

      const buckets = new Map<string, number[]>();
      for (const log of logs) {
        if (log.responseTimeMs == null) continue;
        const hour = new Date(log.createdAt);
        hour.setMinutes(0, 0, 0);
        const key = hour.toISOString();
        const arr = buckets.get(key) ?? [];
        arr.push(log.responseTimeMs);
        buckets.set(key, arr);
      }

      return Array.from(buckets.entries()).map(([ts, vals]) => ({
        timestamp: new Date(ts),
        avgMs: Math.round(vals.reduce((a, b) => a + b, 0) / vals.length),
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
