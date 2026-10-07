'use server';

import { projectService } from '@/services/project.service';
import {
  createProjectSchema,
  updateProjectSchema,
  projectQuerySchema,
  type CreateProjectInput,
  type UpdateProjectInput,
  type ProjectQueryInput,
} from '@/lib/validations';
import { fail } from '@/lib/response';
import { toActionError } from '@/lib/errors';
import type { ActionResult, PaginatedActionResult } from '@/types/api';
import type { Project } from '@/types/domain';
import { requireAdmin } from '@/lib/auth/require-admin';

export async function getProjectsAction(
  rawParams: Partial<ProjectQueryInput> = {}
): Promise<PaginatedActionResult<Project>> {
  try {
    await requireAdmin();
    const parsed = projectQuerySchema.safeParse(rawParams);
    if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };
    return projectService.getAll(parsed.data);
  } catch (e) {
    return { success: false, error: toActionError(e) };
  }
}

export async function getProjectByIdAction(id: string): Promise<ActionResult<Project>> {
  try {
    await requireAdmin();
    return projectService.getById(id);
  } catch (e) {
    return fail(e);
  }
}

export async function getProjectBySlugAction(slug: string): Promise<ActionResult<Project>> {
  try {
    await requireAdmin();
    return projectService.getBySlug(slug);
  } catch (e) {
    return fail(e);
  }
}

export async function createProjectAction(
  rawInput: CreateProjectInput
): Promise<ActionResult<Project>> {
  try {
    await requireAdmin();
    const parsed = createProjectSchema.safeParse(rawInput);
    if (!parsed.success) return fail(parsed.error);
    return projectService.create(parsed.data);
  } catch (e) {
    return fail(e);
  }
}

export async function updateProjectAction(
  id: string,
  rawInput: UpdateProjectInput
): Promise<ActionResult<Project>> {
  try {
    await requireAdmin();
    const parsed = updateProjectSchema.safeParse(rawInput);
    if (!parsed.success) return fail(parsed.error);
    return projectService.update(id, parsed.data);
  } catch (e) {
    return fail(e);
  }
}

export async function toggleProjectStatusAction(
  id: string,
  enabled: boolean
): Promise<ActionResult<Project>> {
  try {
    await requireAdmin();
    return enabled ? projectService.enable(id) : projectService.disable(id);
  } catch (e) {
    return fail(e);
  }
}

export async function deleteProjectAction(id: string): Promise<ActionResult<void>> {
  try {
    await requireAdmin();
    return projectService.delete(id);
  } catch (e) {
    return fail(e);
  }
}
