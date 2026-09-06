import { Algorithm } from '@/src/generated/prisma';
import { settingsRepository } from '@/repositories/settings.repository';
import { cacheService } from '@/services/cache/CacheService';
import { toActionError } from '@/lib/errors';
import type { UpdateSettingsInput } from '@/lib/validations';
import type { Settings } from '@/types/domain';
import type { ActionResult } from '@/types/api';

const DEFAULT_SETTINGS = {
  algorithm: Algorithm.ROUND_ROBIN,
  healthCheckInterval: 30,
  healthCheckTimeout: 5,
  maxFailures: 3,
  autoRecovery: true,
  requestTimeout: 10000,
  maxRetries: 3,
};

export const settingsService = {
  async get(projectId?: string): Promise<ActionResult<Settings>> {
    try {
      const defaults = { ...DEFAULT_SETTINGS, ...(projectId ? { projectId } : {}) };
      const data = await settingsRepository.getOrCreate(defaults, projectId);
      return { success: true, data };
    } catch (e) {
      return { success: false, error: toActionError(e) };
    }
  },

  async update(input: UpdateSettingsInput, projectId?: string): Promise<ActionResult<Settings>> {
    try {
      const targetProjectId = projectId || input.projectId || undefined;
      const defaults = { ...DEFAULT_SETTINGS, ...(targetProjectId ? { projectId: targetProjectId } : {}) };
      const existing = await settingsRepository.getOrCreate(defaults, targetProjectId);
      const data = await settingsRepository.update(existing.id, input);
      cacheService.refreshSettings().catch(console.error);
      return { success: true, data };
    } catch (e) {
      return { success: false, error: toActionError(e) };
    }
  },

  async reset(projectId?: string): Promise<ActionResult<Settings>> {
    try {
      const defaults = { ...DEFAULT_SETTINGS, ...(projectId ? { projectId } : {}) };
      const data = await settingsRepository.upsert(defaults, projectId);
      cacheService.refreshSettings().catch(console.error);
      return { success: true, data };
    } catch (e) {
      return { success: false, error: toActionError(e) };
    }
  },
};
