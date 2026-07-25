import { Server, ServerHealth } from '@/types/domain';

export class HealthFilter {
  static filter(servers: Server[]): Server[] {
    return servers.filter(
      (server) =>
        server.enabled &&
        server.healthy === ServerHealth.HEALTHY &&
        !server.deletedAt
    );
  }
}
