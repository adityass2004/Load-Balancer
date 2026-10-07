import { healthChecker } from './HealthChecker';
import { healthRepository } from './HealthRepository';
import { cacheService } from '@/services/cache/CacheService';
import type { IHealthService, HealthCheckResult, HealthConfig } from '@/types/health';
import type { Server } from '@/types/domain';
import { ServerHealth } from '@/types/domain';

class HealthService implements IHealthService {
  private config: HealthConfig;

  constructor(config: HealthConfig) {
    this.config = config;
  }

  updateConfig(config: HealthConfig): void {
    this.config = config;
  }

  async checkServer(server: Server): Promise<HealthCheckResult> {
    if (!server.enabled || server.deletedAt) {
      return {
        serverId: server.id,
        serverName: server.name,
        url: server.url,
        success: false,
        outcome: 'unknown_error',
        statusCode: null,
        latencyMs: 0,
        checkedAt: new Date(),
        error: 'Server is disabled or deleted, skipping health check.',
      };
    }

    if (!cacheService.hasRuntime(server.id)) {
      return {
        serverId: server.id,
        serverName: server.name,
        url: server.url,
        success: false,
        outcome: 'unknown_error',
        statusCode: null,
        latencyMs: 0,
        checkedAt: new Date(),
        error: 'Server is not in enabled runtime state, skipping health check.',
      };
    }

    const result = await healthChecker.check(server, this.config.timeoutMs);

    try {
      if (result.success) {
        this.handleSuccess(server, result);
      } else {
        this.handleFailure(server, result);
      }
    } catch (dbError) {
      log('error', server, `DB update failed after health check: ${(dbError as Error).message}`);
    }

    return result;
  }

  async checkAllServers(): Promise<HealthCheckResult[]> {
    const servers = await cacheService.getServers();

    if (servers.length === 0) return [];

    const enabledServers = servers.filter((s) => s.enabled && !s.deletedAt);
    const envConcurrency = parseInt(process.env.HEALTH_PROBE_CONCURRENCY || '10', 10);
    const concurrency = isNaN(envConcurrency) || envConcurrency < 1 ? 10 : envConcurrency;

    const results: HealthCheckResult[] = [];
    for (let i = 0; i < enabledServers.length; i += concurrency) {
      const chunk = enabledServers.slice(i, i + concurrency);
      const chunkResults = await Promise.allSettled(
        chunk.map((server) => this.checkServer(server))
      );
      for (const res of chunkResults) {
        if (res.status === 'fulfilled') {
          results.push(res.value);
        }
      }
    }

    return results;
  }

  private handleSuccess(server: Server, result: HealthCheckResult): void {
    const previousHealth = cacheService.getCurrentHealth(server.id);
    const statusChanged = previousHealth !== ServerHealth.HEALTHY;

    cacheService.setRuntimeHealthState(
      server.id,
      ServerHealth.HEALTHY,
      0,
      result.latencyMs,
      result.checkedAt
    );

    if (statusChanged) {
      log('recovered', server, `Recovered → HEALTHY. Latency: ${result.latencyMs}ms`);
    }

    healthRepository.markHealthy(server.id, result.latencyMs!, result.checkedAt).catch((e) => {
      log('error', server, `DB persist failed (markHealthy): ${(e as Error).message}`);
    });
  }

  private handleFailure(server: Server, result: HealthCheckResult): void {
    const previousHealth = cacheService.getCurrentHealth(server.id);
    const newFailureCount = cacheService.getFailureCount(server.id) + 1;

    const shouldMarkUnhealthy = newFailureCount >= this.config.maxFailures;

    if (shouldMarkUnhealthy) {
      const statusChanged = previousHealth !== ServerHealth.UNHEALTHY;

      cacheService.setRuntimeHealthState(
        server.id,
        ServerHealth.UNHEALTHY,
        newFailureCount,
        null,
        result.checkedAt
      );

      if (statusChanged) {
        log('failed', server, `Transitioning → UNHEALTHY after ${newFailureCount} failures. Reason: ${result.error} [${result.outcome}]`);
      }

      healthRepository.markUnhealthy(server.id, newFailureCount, result.checkedAt).catch((e) => {
        log('error', server, `DB persist failed (markUnhealthy): ${(e as Error).message}`);
      });
    } else {
      cacheService.setRuntimeHealthState(
        server.id,
        previousHealth === ServerHealth.UNHEALTHY ? ServerHealth.UNHEALTHY : previousHealth,
        newFailureCount,
        null,
        result.checkedAt
      );
      log('warning', server, `Failure ${newFailureCount}/${this.config.maxFailures}. Reason: ${result.error} [${result.outcome}]`);
    }
  }
}

type LogLevel = 'success' | 'failed' | 'recovered' | 'warning' | 'error';

function log(level: LogLevel, server: Pick<Server, 'name' | 'url'>, message: string): void {
  const timestamp = new Date().toISOString();
  const prefix = {
    success: '✓',
    failed: '✗',
    recovered: '↑',
    warning: '⚠',
    error: '!',
  }[level];

  console.log(`[HealthService] ${timestamp} ${prefix} [${server.name}] ${message}`);
}

export function createHealthService(config: HealthConfig): HealthService {
  return new HealthService(config);
}
