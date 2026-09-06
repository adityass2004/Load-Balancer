import { db } from '@/lib/db';
import { DatabaseError, NotFoundError } from '@/lib/errors';
import type { CreateSettingsInput, UpdateSettingsInput } from '@/lib/validations';
import type { Settings } from '@/types/domain';

class SettingsRepository {
  async get(projectId?: string): Promise<Settings> {
    try {
      const where = projectId ? { projectId } : {};
      const settings = await db.settings.findFirst({ where });
      if (!settings) throw new NotFoundError('Settings', projectId ?? 'default');
      return settings;
    } catch (e) {
      if (e instanceof NotFoundError) throw e;
      throw new DatabaseError(`get failed: ${(e as Error).message}`);
    }
  }

  async getByProjectId(projectId: string): Promise<Settings | null> {
    try {
      return await db.settings.findFirst({ where: { projectId } });
    } catch (e) {
      throw new DatabaseError(`getByProjectId failed: ${(e as Error).message}`);
    }
  }

  async getOrCreate(defaults: CreateSettingsInput, projectId?: string): Promise<Settings> {
    try {
      const targetProjectId = projectId || defaults.projectId;
      const where = targetProjectId ? { projectId: targetProjectId } : {};
      const existing = await db.settings.findFirst({ where });
      if (existing) return existing;

      return await db.settings.create({
        data: {
          ...defaults,
          ...(targetProjectId ? { projectId: targetProjectId } : {}),
        },
      });
    } catch (e) {
      throw new DatabaseError(`getOrCreate failed: ${(e as Error).message}`);
    }
  }

  async update(id: string, data: UpdateSettingsInput): Promise<Settings> {
    try {
      return await db.settings.update({ where: { id }, data });
    } catch (e) {
      throw new DatabaseError(`update failed: ${(e as Error).message}`);
    }
  }

  async updateByProjectId(
    projectId: string,
    data: UpdateSettingsInput,
    defaults?: CreateSettingsInput
  ): Promise<Settings> {
    try {
      const existing = await db.settings.findFirst({ where: { projectId } });
      if (existing) {
        return await db.settings.update({ where: { id: existing.id }, data });
      }
      return await db.settings.create({
        data: {
          ...(defaults ?? {
            algorithm: 'ROUND_ROBIN',
            healthCheckInterval: 30,
            healthCheckTimeout: 5,
            maxFailures: 3,
            autoRecovery: true,
            requestTimeout: 10000,
            maxRetries: 3,
          }),
          ...data,
          projectId,
        },
      });
    } catch (e) {
      throw new DatabaseError(`updateByProjectId failed: ${(e as Error).message}`);
    }
  }

  async upsert(data: CreateSettingsInput, projectId?: string): Promise<Settings> {
    try {
      const targetProjectId = projectId || data.projectId;
      const where = targetProjectId ? { projectId: targetProjectId } : {};
      const existing = await db.settings.findFirst({ where });

      if (existing) {
        return await db.settings.update({ where: { id: existing.id }, data });
      }

      return await db.settings.create({
        data: {
          ...data,
          ...(targetProjectId ? { projectId: targetProjectId } : {}),
        },
      });
    } catch (e) {
      throw new DatabaseError(`upsert failed: ${(e as Error).message}`);
    }
  }
}

export const settingsRepository = new SettingsRepository();
