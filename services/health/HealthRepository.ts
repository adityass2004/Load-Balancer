import prisma from '@/lib/db';
import { ServerHealth } from '@/src/generated/prisma/client';
import { DatabaseError } from '@/lib/errors';
import type { IHealthRepository } from '@/types/health';

class HealthRepository implements IHealthRepository {
  async markHealthy(
    serverId: string,
    latencyMs: number,
    checkedAt: Date
  ): Promise<void> {
    try {
      await prisma.server.update({
        where: { id: serverId },
        data: {
          healthy: ServerHealth.HEALTHY,
          lastHealthCheck: checkedAt,
        },
      });
    } catch (e) {
      throw new DatabaseError(`markHealthy failed: ${(e as Error).message}`);
    }
  }

  async markUnhealthy(
    serverId: string,
    failureCount: number,
    checkedAt: Date
  ): Promise<void> {
    try {
      await prisma.server.update({
        where: { id: serverId },
        data: {
          healthy: ServerHealth.UNHEALTHY,
          failureCount,
          lastHealthCheck: checkedAt,
        },
      });
    } catch (e) {
      throw new DatabaseError(`markUnhealthy failed: ${(e as Error).message}`);
    }
  }

  async incrementFailureCount(
    serverId: string,
    checkedAt: Date
  ): Promise<number> {
    try {
      const updated = await prisma.server.update({
        where: { id: serverId },
        data: {
          failureCount: { increment: 1 },
          lastHealthCheck: checkedAt,
        },
        select: { failureCount: true },
      });
      return updated.failureCount;
    } catch (e) {
      throw new DatabaseError(`incrementFailureCount failed: ${(e as Error).message}`);
    }
  }

  async resetFailureCount(serverId: string): Promise<void> {
    try {
      await prisma.server.update({
        where: { id: serverId },
        data: { failureCount: 0 },
      });
    } catch (e) {
      throw new DatabaseError(`resetFailureCount failed: ${(e as Error).message}`);
    }
  }

  async getFailureCount(serverId: string): Promise<number> {
    try {
      const server = await prisma.server.findUnique({
        where: { id: serverId },
        select: { failureCount: true },
      });
      return server?.failureCount ?? 0;
    } catch (e) {
      throw new DatabaseError(`getFailureCount failed: ${(e as Error).message}`);
    }
  }
}

export const healthRepository = new HealthRepository();
