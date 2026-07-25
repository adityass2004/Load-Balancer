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
  async get(): Promise<ActionResult<Settings>> {
    try {
      const data = await settingsRepository.getOrCreate(DEFAULT_SETTINGS);
      return { success: true, data };
    } catch (e) {
      return { success: false, error: toActionError(e) };
    }
  },

  async update(input: UpdateSettingsInput): Promise<ActionResult<Settings>> {
    try {
      const existing = await settingsRepository.getOrCreate(DEFAULT_SETTINGS);
      const data = await settingsRepository.update(existing.id, input);
      cacheService.refreshSettings().catch(console.error);
      return { success: true, data };
    } catch (e) {
      return { success: false, error: toActionError(e) };
    }
  },

  async reset(): Promise<ActionResult<Settings>> {
    try {
      const data = await settingsRepository.upsert(DEFAULT_SETTINGS);
      cacheService.refreshSettings().catch(console.error);
      return { success: true, data };
    } catch (e) {
      return { success: false, error: toActionError(e) };
    }
  },
};
