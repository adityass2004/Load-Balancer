import { db } from '@/lib/db';
import { DatabaseError, NotFoundError } from '@/lib/errors';
import type { CreateSettingsInput, UpdateSettingsInput } from '@/lib/validations';
import type { Settings } from '@/types/domain';

class SettingsRepository {
  // Settings is a singleton row — always upsert on first access
  async get(): Promise<Settings> {
    try {
      const settings = await db.settings.findFirst();
      if (!settings) throw new NotFoundError('Settings');
      return settings;
    } catch (e) {
      if (e instanceof NotFoundError) throw e;
      throw new DatabaseError(`get failed: ${(e as Error).message}`);
    }
  }

  async getOrCreate(defaults: CreateSettingsInput): Promise<Settings> {
    try {
      const existing = await db.settings.findFirst();
      if (existing) return existing;
      return await db.settings.create({ data: defaults });
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

  async upsert(data: CreateSettingsInput): Promise<Settings> {
    try {
      const existing = await db.settings.findFirst();

      if (existing) {
        return await db.settings.update({ where: { id: existing.id }, data });
      }

      return await db.settings.create({ data });
    } catch (e) {
      throw new DatabaseError(`upsert failed: ${(e as Error).message}`);
    }
  }
}

export const settingsRepository = new SettingsRepository();
