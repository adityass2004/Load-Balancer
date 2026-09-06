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
import type { ActionResult, PaginatedActionResult } from '@/types/api';
import type { Project } from '@/types/domain';

export async function getProjectsAction(
  rawParams: Partial<ProjectQueryInput> = {}
): Promise<PaginatedActionResult<Project>> {
  const parsed = projectQuerySchema.safeParse(rawParams);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };
  return projectService.getAll(parsed.data);
}

export async function getProjectByIdAction(id: string): Promise<ActionResult<Project>> {
  return projectService.getById(id);
}

export async function getProjectBySlugAction(slug: string): Promise<ActionResult<Project>> {
  return projectService.getBySlug(slug);
}

export async function createProjectAction(
  rawInput: CreateProjectInput
): Promise<ActionResult<Project>> {
  const parsed = createProjectSchema.safeParse(rawInput);
  if (!parsed.success) return fail(parsed.error);
  return projectService.create(parsed.data);
}

export async function updateProjectAction(
  id: string,
  rawInput: UpdateProjectInput
): Promise<ActionResult<Project>> {
  const parsed = updateProjectSchema.safeParse(rawInput);
  if (!parsed.success) return fail(parsed.error);
  return projectService.update(id, parsed.data);
}

export async function toggleProjectStatusAction(
  id: string,
  enabled: boolean
): Promise<ActionResult<Project>> {
  return enabled ? projectService.enable(id) : projectService.disable(id);
}

export async function deleteProjectAction(id: string): Promise<ActionResult<void>> {
  return projectService.delete(id);
}
