'use server';

import { settingsService } from '@/services/settings.service';
import {
  updateSettingsSchema,
  type UpdateSettingsInput,
} from '@/lib/validations';
import { fail } from '@/lib/response';
import type { ActionResult } from '@/types/api';
import type { Settings } from '@/types/domain';
import { requireAdmin } from '@/lib/auth/require-admin';

export async function getSettingsAction(projectId?: string): Promise<ActionResult<Settings>> {
  try {
    await requireAdmin();
    return settingsService.get(projectId);
  } catch (e) {
    return fail(e);
  }
}

export async function updateSettingsAction(
  input: UpdateSettingsInput,
  projectId?: string
): Promise<ActionResult<Settings>> {
  try {
    await requireAdmin();
    const parsed = updateSettingsSchema.safeParse(input);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message };
    }
    return settingsService.update(parsed.data, projectId);
  } catch (e) {
    return fail(e);
  }
}

export async function resetSettingsAction(projectId?: string): Promise<ActionResult<Settings>> {
  try {
    await requireAdmin();
    return settingsService.reset(projectId);
  } catch (e) {
    return fail(e);
  }
}
