'use server';

import axios from 'axios';
import { serverService } from '@/services/server.service';
import {
  createServerSchema,
  updateServerSchema,
  serverQuerySchema,
  type CreateServerInput,
  type UpdateServerInput,
  type ServerQueryInput,
} from '@/lib/validations';
import { fail } from '@/lib/response';
import { buildHealthUrl } from '@/lib/utils';
import type { ActionResult, PaginatedActionResult } from '@/types/api';
import { type Server, ServerHealth } from '@/types/domain';
import { healthRepository } from '@/services/health/HealthRepository';
import { serverValidator } from '@/services/health/ServerValidator';
import { cacheService } from '@/services/cache/CacheService';
import { healthScheduler } from '@/services/health/HealthScheduler';

async function syncServerCache(): Promise<void> {
  const t0 = Date.now();
  await cacheService.refreshServers();
  const dur = Date.now() - t0;
  if (dur > 100) console.log(`[server.actions] syncServerCache slow: ${dur}ms`);
}

async function runHealthCycle(reason: string): Promise<void> {
  await healthScheduler.runImmediateCycle(reason);
}

export async function getServersAction(
  rawParams: Partial<ServerQueryInput> = {}
): Promise<PaginatedActionResult<Server>> {
  const parsed = serverQuerySchema.safeParse(rawParams);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };
  const result = await serverService.getAll(parsed.data);
  if (!result.success) return result;

  await cacheService.refreshServers();
  const merged = cacheService.mergeRuntimeState(result.data);
  return { ...result, data: merged };
}

export async function getServerByIdAction(
  id: string
): Promise<ActionResult<Server>> {
  if (!id?.trim()) return { success: false, error: 'Server ID is required' };
  const result = await serverService.getById(id);
  if (!result.success) return result;
  await cacheService.refreshServers();
  return { ...result, data: cacheService.mergeRuntimeState([result.data])[0] };
}

export async function getEnabledServersAction(): Promise<ActionResult<Server[]>> {
  return serverService.getEnabled();
}

export async function createServerAction(
  input: CreateServerInput
): Promise<ActionResult<Server>> {
  const parsed = createServerSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0].message,
      fieldErrors: parsed.error.issues.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      })),
    };
  }

  const validation = await serverValidator.validateServer(parsed.data.url);
  if (!validation.isHealthy) {
    return {
      success: false,
      error: validation.errorMessage || 'Backend is unreachable',
    };
  }

  const createPayload: CreateServerInput = { ...parsed.data, enabled: false };

  const createResult = await serverService.create(createPayload);
  if (!createResult.success) return createResult;

  await syncServerCache();
  await runHealthCycle(`create:${createResult.data.id}`);

  return serverService.getById(createResult.data.id);
}

export async function updateServerAction(
  id: string,
  input: UpdateServerInput
): Promise<ActionResult<Server>> {
  if (!id?.trim()) return { success: false, error: 'Server ID is required' };

  const parsed = updateServerSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0].message,
      fieldErrors: parsed.error.issues.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      })),
    };
  }

  const guardedInput: UpdateServerInput = { ...parsed.data, enabled: false };

  const result = await serverService.update(id, guardedInput);
  if (!result.success) return result;

  cacheService.removeRuntime(result.data.id);
  await syncServerCache();
  await runHealthCycle(`update:${id}`);

  return serverService.getById(id);
}

export async function deleteServerAction(
  id: string
): Promise<ActionResult<Server>> {
  if (!id?.trim()) return { success: false, error: 'Server ID is required' };

  const result = await serverService.softDelete(id);
  if (!result.success) return result;

  cacheService.removeRuntime(result.data.id);
  await syncServerCache();
  await runHealthCycle(`delete:${id}`);

  return result;
}

export async function restoreServerAction(
  id: string
): Promise<ActionResult<Server>> {
  if (!id?.trim()) return { success: false, error: 'Server ID is required' };

  const result = await serverService.restore(id);
  if (!result.success) return result;

  await syncServerCache();
  await runHealthCycle(`restore:${id}`);

  return serverService.getById(id);
}

export async function enableServerAction(
  id: string
): Promise<ActionResult<Server>> {
  if (!id?.trim()) return { success: false, error: 'Server ID is required' };

  const existing = await serverService.getById(id);
  if (!existing.success) return existing;

  const validation = await serverValidator.validateServer(existing.data.url);

  if (!validation.isHealthy) {
    const now = new Date();
    try {
      await syncServerCache();
      const failureCount = cacheService.getFailureCount(id) + 1;
      cacheService.setRuntimeHealthState(
        id,
        ServerHealth.UNHEALTHY,
        failureCount,
        null,
        now
      );
      await serverService.updateHealth(id, {
        healthy: ServerHealth.UNHEALTHY,
        lastHealthCheck: now,
        failureCount,
      });
      console.error(
        `[enableServerAction] ${id.slice(0, 8)} "${existing.data.name}" ✗ unreachable → persisted UNHEALTHY. ${validation.errorMessage || ''}`
      );
    } catch (err) {
      console.error(
        `[enableServerAction] Failed to persist UNHEALTHY for ${id}:`,
        (err as Error).message
      );
    }
    return {
      success: false,
      error: validation.errorMessage || 'Backend is unreachable — cannot activate an unhealthy server',
    };
  }

  const result = await serverService.enable(id);
  if (!result.success) return result;

  const now = new Date();
  await syncServerCache();
  cacheService.setRuntimeHealthState(
    result.data.id,
    ServerHealth.HEALTHY,
    0,
    validation.responseTime,
    now
  );
  await serverService.updateHealth(result.data.id, {
    healthy: ServerHealth.HEALTHY,
    lastHealthCheck: now,
    averageResponseTime: validation.responseTime,
    failureCount: 0,
  });
  console.log(
    `[enableServerAction] ${id.slice(0, 8)} "${existing.data.name}" ✅ enabled (latency=${validation.responseTime ?? '-'}ms)`
  );

  await runHealthCycle(`enable:${id}`);

  return serverService.getById(id);
}

export async function disableServerAction(
  id: string
): Promise<ActionResult<Server>> {
  if (!id?.trim()) return { success: false, error: 'Server ID is required' };

  const result = await serverService.disable(id);
  if (!result.success) return result;

  const now = new Date();
  cacheService.removeRuntime(result.data.id);
  try {
    await serverService.updateHealth(result.data.id, {
      healthy: ServerHealth.UNKNOWN,
      failureCount: 0,
      lastHealthCheck: now,
      averageResponseTime: 0,
    });
  } catch (err) {
    console.error(
      `[disableServerAction] Failed to reset DB health for ${id}:`,
      (err as Error).message
    );
  }

  console.log(`[disableServerAction] ${id.slice(0, 8)} disabled → runtime+DB reset`);

  await syncServerCache();
  await runHealthCycle(`disable:${id}`);

  return result;
}

export async function testServerConnectionAction(
  url: string,
  serverId?: string
): Promise<ActionResult<{ latencyMs: number; statusCode: number | null }>> {
  if (!url?.trim()) return { success: false, error: 'URL is required' };
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return { success: false, error: 'URL must start with http:// or https://' };
  }

  const healthUrl = buildHealthUrl(url);

  const startTime = Date.now();
  try {
    const response = await axios.get(healthUrl, {
      timeout: 5000,
      headers: { 'User-Agent': 'TrackIt-Tester/1.0' },
      validateStatus: () => true,
    });

    const latencyMs = Date.now() - startTime;
    const statusCode = response.status;
    const isHealthy = statusCode >= 200 && statusCode < 500;

    if (serverId) await persistManualHealthCheck(serverId, isHealthy, latencyMs);

    return {
      success: true,
      data: { latencyMs, statusCode },
    };
  } catch (e) {
    let msg = 'Failed to connect to host';
    if (axios.isAxiosError(e)) {
      if (e.code === 'ECONNREFUSED') msg = 'Connection refused by target host';
      else if (e.code === 'ENOTFOUND') msg = 'DNS lookup failed: host not found';
      else if (e.code === 'ECONNABORTED' || e.code === 'ETIMEDOUT') msg = 'Connection timed out';
      else if (e.message) msg = e.message;
    } else if (e instanceof Error) {
      msg = e.message;
    }

    if (serverId) await persistManualHealthCheck(serverId, false, null);
    return { success: false, error: msg };
  }
}

async function persistManualHealthCheck(
  serverId: string,
  isHealthy: boolean,
  latencyMs: number | null
): Promise<void> {
  const existing = await serverService.getById(serverId);
  if (!existing.success) return;
  const server = existing.data;
  const ctx = serverId.slice(0, 8);
  const now = new Date();

  try {
    await syncServerCache();

    if (isHealthy) {
      cacheService.setRuntimeHealthState(server.id, ServerHealth.HEALTHY, 0, latencyMs, now);
      await healthRepository.markHealthy(server.id, latencyMs ?? 0, now);
      console.log(
        `[ManualHealthCheck] ${new Date().toISOString()} ✓ ["${server.name}"] HEALTHY (latency: ${latencyMs}ms)`
      );
    } else {
      const failureCount = cacheService.getFailureCount(server.id) + 1;
      cacheService.setRuntimeHealthState(
        server.id,
        ServerHealth.UNHEALTHY,
        failureCount,
        null,
        now
      );
      await healthRepository.markUnhealthy(server.id, failureCount, now);
      console.error(
        `[ManualHealthCheck] ${new Date().toISOString()} ✗ ["${server.name}"] UNHEALTHY (failures: ${failureCount})`
      );
    }
  } catch (err) {
    console.error(
      `[ManualHealthCheck] FAILED for ${ctx} "${server.name}":`,
      (err as Error).message
    );
  }
}
