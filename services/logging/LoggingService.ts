

import { loggingRepository, type LogQueryParams, type LogFilters } from './LoggingRepository';
import { toActionError } from '@/lib/errors';
import type { RequestLog, HttpMethod } from '@/types/domain';
import type { ActionResult, PaginatedActionResult } from '@/types/api';

export const loggingService = {
  async createLog(data: {
    requestId: string;
    method: HttpMethod;
    route: string;
    backendId?: string | null;
    backendUrl?: string | null;
    statusCode?: number | null;
    responseTimeMs?: number | null;
    retryCount?: number;
    errorMessage?: string | null;
  }): Promise<ActionResult<RequestLog>> {
    try {
      const log = await loggingRepository.create(data);
      return { success: true, data: log };
    } catch (e) {
      return { success: false, error: toActionError(e) };
    }
  },

  async getLogs(params: LogQueryParams = {}): Promise<PaginatedActionResult<RequestLog>> {
    try {
      const { page = 1, pageSize = 50, ...filters } = params;
      const [data, total] = await Promise.all([
        loggingRepository.findMany({ page, pageSize, ...filters }),
        loggingRepository.count(filters),
      ]);
      const totalPages = Math.ceil(total / pageSize);
      return {
        success: true,
        data,
        meta: {
          total,
          page,
          pageSize,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      };
    } catch (e) {
      return { success: false, error: toActionError(e) };
    }
  },

  async getAllLogsForExport(filters: LogFilters = {}): Promise<ActionResult<RequestLog[]>> {
    try {
      const data = await loggingRepository.findAll(filters);
      return { success: true, data };
    } catch (e) {
      return { success: false, error: toActionError(e) };
    }
  },
};
