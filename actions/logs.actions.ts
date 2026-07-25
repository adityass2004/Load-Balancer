'use server';

import { loggingService } from '@/services/logging/LoggingService';
import type { LogQueryParams, LogFilters } from '@/services/logging/LoggingRepository';
import type { RequestLog } from '@/types/domain';
import type { ActionResult, PaginatedActionResult } from '@/types/api';

export async function getLogsAction(
  params: LogQueryParams = {}
): Promise<PaginatedActionResult<RequestLog>> {
  return loggingService.getLogs(params);
}

export async function getAllLogsForExportAction(
  filters: LogFilters = {}
): Promise<ActionResult<RequestLog[]>> {
  return loggingService.getAllLogsForExport(filters);
}
