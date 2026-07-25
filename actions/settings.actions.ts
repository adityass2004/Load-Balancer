'use server';

import { settingsService } from '@/services/settings.service';
import {
  updateSettingsSchema,
  type UpdateSettingsInput,
} from '@/lib/validations';
import { toActionError } from '@/lib/errors';
import type { ActionResult } from '@/types/api';
import type { Settings } from '@/types/domain';

export async function getSettingsAction(): Promise<ActionResult<Settings>> {
  return settingsService.get();
}

export async function updateSettingsAction(
  input: UpdateSettingsInput
): Promise<ActionResult<Settings>> {
  try {
    const parsed = updateSettingsSchema.safeParse(input);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message };
    }
    return settingsService.update(parsed.data);
  } catch (e) {
    return { success: false, error: toActionError(e) };
  }
}

export async function resetSettingsAction(): Promise<ActionResult<Settings>> {
  return settingsService.reset();
}
