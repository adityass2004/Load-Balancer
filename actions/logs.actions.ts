'use server';

import { loggingService } from '@/services/logging/LoggingService';
import { requireAdmin } from '@/lib/auth/require-admin';
import { toActionError } from '@/lib/errors';
import type { LogQueryParams, LogFilters } from '@/services/logging/LoggingRepository';
import type { RequestLog } from '@/types/domain';
import type { ActionResult, PaginatedActionResult } from '@/types/api';

export async function getLogsAction(
  params: LogQueryParams = {}
): Promise<PaginatedActionResult<RequestLog>> {
  try {
    await requireAdmin();
    return loggingService.getLogs(params);
  } catch (e) {
    return {
      success: false,
      error: toActionError(e),
    };
  }
}

export async function getAllLogsForExportAction(
  filters: LogFilters = {}
): Promise<ActionResult<RequestLog[]>> {
  try {
    await requireAdmin();
    return loggingService.getAllLogsForExport(filters);
  } catch (e) {
    return {
      success: false,
      error: toActionError(e),
    };
  }
}
