import { cacheService } from '@/services/cache/CacheService';
import { serverRepository } from '@/repositories/server.repository';
import { healthRepository } from '@/services/health/HealthRepository';
import { ServerHealth } from '@/types/domain';

export class MetricsCollector {
  recordRequestStart(serverId: string): void {
    cacheService.updateRuntimeMetrics(serverId, {
      activeRequests: +1,
      requestsHandled: +1,
    });

    serverRepository.incrementRequests(serverId).catch((err) => {
      console.error(`[METRICS] Failed to persist incrementRequests for ${serverId}:`, err.message);
    });
  }

  async recordRequestEnd(
    serverId: string,
    latencyMs: number,
    success: boolean,
    maxFailures: number
  ): Promise<void> {
    cacheService.updateRuntimeMetrics(serverId, {
      activeRequests: -1,
      latencyMs,
      success,
    });

    if (!success) {
      const failures = cacheService.incrementFailureCountForRequest(serverId, new Date());

      if (failures >= maxFailures) {
        const currentHealth = cacheService.getCurrentHealth(serverId);
        if (currentHealth !== ServerHealth.UNHEALTHY) {
          const now = new Date();
          cacheService.setRuntimeHealthState(
            serverId,
            ServerHealth.UNHEALTHY,
            failures,
            null,
            now
          );
          healthRepository.markUnhealthy(serverId, failures, now).catch((e) => {
            console.error(
              `[METRICS] Failed to persist markUnhealthy for ${serverId}:`,
              e.message
            );
          });
          console.log(
            `[MetricsCollector] ${new Date().toISOString()} ✗ [${serverId}] Transitioning → UNHEALTHY after ${failures} consecutive request failures.`
          );
        }
      }
    }

    serverRepository
      .decrementActiveRequests(serverId)
      .catch((err) => {
        console.error(
          `[METRICS] Failed to persist decrementActiveRequests for ${serverId}:`,
          err.message
        );
      });
  }
}
