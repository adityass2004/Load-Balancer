'use server';

import { healthScheduler } from '@/services/health/HealthScheduler';
import { serverRepository } from '@/repositories/server.repository';
import { ok, fail } from '@/lib/response';
import type { ActionResult } from '@/types/api';
import type { HealthCheckResult, MonitorStatus } from '@/types/health';

// ─── Lifecycle ────────────────────────────────────────────────────────────────

export async function startMonitoringAction(): Promise<ActionResult<void>> {
  try {
    await healthScheduler.startMonitoring();
    return ok(undefined);
  } catch (e) {
    return fail(e);
  }
}

export async function stopMonitoringAction(): Promise<ActionResult<void>> {
  try {
    await healthScheduler.stopMonitoring();
    return ok(undefined);
  } catch (e) {
    return fail(e);
  }
}

export async function reloadHealthConfigAction(): Promise<ActionResult<void>> {
  try {
    await healthScheduler.reloadConfig();
    return ok(undefined);
  } catch (e) {
    return fail(e);
  }
}

// ─── Manual checks ────────────────────────────────────────────────────────────

export async function checkAllServersAction(): Promise<ActionResult<HealthCheckResult[]>> {
  try {
    const results = await healthScheduler.checkAllServers();
    return ok(results);
  } catch (e) {
    return fail(e);
  }
}

export async function checkServerAction(
  serverId: string
): Promise<ActionResult<HealthCheckResult>> {
  try {
    if (!serverId?.trim()) return { success: false, error: 'Server ID is required' };

    const server = await serverRepository.findActiveByIdOrThrow(serverId);
    if (!server.enabled) {
      return { success: false, error: 'Cannot check health of a disabled server' };
    }
    const result = await healthScheduler.checkServer(server);
    return ok(result);
  } catch (e) {
    return fail(e);
  }
}

// ─── Status ───────────────────────────────────────────────────────────────────

export async function getMonitorStatusAction(): Promise<ActionResult<MonitorStatus>> {
  try {
    const status = healthScheduler.getMonitoringStatus();
    return ok(status);
  } catch (e) {
    return fail(e);
  }
}

export async function isMonitorRunningAction(): Promise<ActionResult<boolean>> {
  try {
    return ok(healthScheduler.isMonitoringRunning());
  } catch (e) {
    return fail(e);
  }
}
