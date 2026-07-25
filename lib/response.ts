import type { PaginationMeta, PaginatedActionResult, ActionResult } from '@/types/api';
import { isAppError } from '@/lib/errors';
import { ZodError } from 'zod';

// ─── Success builders ──────────────────────────────────────────────────────────

export function ok<T>(data: T, message = 'Success'): ActionResult<T> {
  return { success: true, data };
}

export function paginated<T>(
  data: T[],
  meta: PaginationMeta
): PaginatedActionResult<T> {
  return { success: true, data, meta };
}

export function buildPaginationMeta(
  total: number,
  page: number,
  pageSize: number
): PaginationMeta {
  const totalPages = Math.ceil(total / pageSize);
  return {
    total,
    page,
    pageSize,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
}

// ─── Error builders ────────────────────────────────────────────────────────────

export function fail<T = void>(error: unknown): ActionResult<T> {
  if (error instanceof ZodError) {
    return {
      success: false,
      error: error.issues[0].message,
      fieldErrors: error.issues.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      })),
    };
  }

  if (isAppError(error)) {
    return { success: false, error: error.message };
  }

  if (error instanceof Error) {
    return { success: false, error: error.message };
  }

  return { success: false, error: 'An unexpected error occurred' };
}

// ─── Zod parse helper — throws ValidationError on failure ─────────────────────

import { ValidationError } from '@/lib/errors';

export function parseOrThrow<T>(
  schema: { safeParse: (data: unknown) => { success: boolean; data?: T; error?: ZodError } },
  data: unknown
): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new ValidationError(result.error!.issues[0].message);
  }
  return result.data!;
}
