import { z } from 'zod';
import { Algorithm, ServerHealth } from '@/src/generated/prisma';
import { validateBackendUrl } from '@/lib/security/ssrf-guard';

// ─── Server ────────────────────────────────────────────────────────────────────

/** Base shape without async SSRF check — used internally when URL is not being set. */
const _createServerBaseSchema = z.object({
  projectId: z.string().uuid().optional().nullable(),
  name: z.string().min(1, 'Name is required').max(100, 'Name must be 100 characters or less'),
  url: z
    .string()
    .min(1, 'URL is required')
    .url('Must be a valid URL')
    .refine((u) => u.startsWith('http://') || u.startsWith('https://'), {
      message: 'URL must start with http:// or https://',
    }),
  enabled: z.boolean().default(false),
  weight: z.number({ message: 'Weight must be a number' }).int().min(1, 'Weight must be at least 1').max(100, 'Weight cannot exceed 100').default(1),
  priority: z.number({ message: 'Priority must be a number' }).int().min(0, 'Priority cannot be negative').default(0),
});

/** Full create schema with SSRF guard applied as an async superRefine on the URL field. */
export const createServerSchema = _createServerBaseSchema.superRefine(async (data, ctx) => {
  // Only validate URL when it is present (it's always present on create but guard via check)
  if (!data.url) return;
  const result = await validateBackendUrl(data.url);
  if (!result.ok) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['url'],
      message: result.reason,
    });
  }
});

/**
 * Update schema: partial of the base.  When `url` is present, the SSRF guard runs.
 * When `url` is absent (update changes only name/weight/etc.), the cheap checks are skipped
 * for that field — the connect-time guard in the agents still protects proxy/health paths.
 */
export const updateServerSchema = _createServerBaseSchema
  .partial()
  .superRefine(async (data, ctx) => {
    if (!data.url) return; // URL not being changed — skip DNS round-trip
    const result = await validateBackendUrl(data.url);
    if (!result.ok) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['url'],
        message: result.reason,
      });
    }
  });

export const serverHealthSchema = z.object({
  healthy: z.nativeEnum(ServerHealth),
  lastHealthCheck: z.date().optional(),
  averageResponseTime: z.number().min(0).optional(),
  failureCount: z.number().int().min(0).optional(),
});

export const serverStatsSchema = z.object({
  requestsHandled: z.number().int().min(0),
  activeRequests: z.number().int().min(0),
});

export const serverQuerySchema = z.object({
  projectId: z.string().uuid().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  enabled: z.coerce.boolean().optional(),
  healthy: z.nativeEnum(ServerHealth).optional(),
  includeDeleted: z.coerce.boolean().default(false),
  sortField: z
    .enum(['name', 'url', 'priority', 'weight', 'createdAt', 'updatedAt', 'requestsHandled', 'averageResponseTime'])
    .default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type CreateServerInput = z.infer<typeof createServerSchema>;
export type UpdateServerInput = z.infer<typeof updateServerSchema>;
export type ServerHealthInput = z.infer<typeof serverHealthSchema>;
export type ServerStatsInput = z.infer<typeof serverStatsSchema>;
export type ServerQueryInput = z.infer<typeof serverQuerySchema>;

// ─── Health Check ────────────────────────────────────────────────────────────

export const healthCheckResultSchema = z.object({
  serverId: z.string().min(1),
  statusCode: z.number().int().nullable(),
  latencyMs: z.number().min(0).nullable(),
  success: z.boolean(),
  error: z.string().nullable(),
  checkedAt: z.date(),
});

export type HealthCheckResultInput = z.infer<typeof healthCheckResultSchema>;

// ─── Settings ───────────────────────────────────────────────────────────────

export const createSettingsSchema = z.object({
  projectId: z.string().uuid().optional().nullable(),
  algorithm: z.nativeEnum(Algorithm).default(Algorithm.ROUND_ROBIN),
  healthCheckInterval: z.number().int().min(5).max(300).default(30),
  healthCheckTimeout: z.number().int().min(1).max(60).default(5),
  maxFailures: z.number().int().min(1).max(20).default(3),
  autoRecovery: z.boolean().default(true),
  requestTimeout: z.number().int().min(100).max(60000).default(10000),
  maxRetries: z.number().int().min(0).max(10).default(3),
});

export const updateSettingsSchema = createSettingsSchema.partial();

export type CreateSettingsInput = z.infer<typeof createSettingsSchema>;
export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>;

// ─── Project ─────────────────────────────────────────────────────────────────

export const createProjectSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be 100 characters or less'),
  slug: z
    .string()
    .min(1, 'Slug is required')
    .max(100, 'Slug must be 100 characters or less')
    .regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
  description: z.string().max(500, 'Description must be 500 characters or less').optional().nullable(),
  enabled: z.boolean().default(true),
});

export const updateProjectSchema = createProjectSchema.partial();

export const projectQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  enabled: z.coerce.boolean().optional(),
  sortField: z.enum(['name', 'slug', 'createdAt', 'updatedAt']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
export type ProjectQueryInput = z.infer<typeof projectQuerySchema>;

