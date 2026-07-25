import { LoadBalancingStrategy } from '../interfaces/LoadBalancingStrategy';
import { Server } from '@/types/domain';

export class LeastConnectionsStrategy implements LoadBalancingStrategy {
  selectServer(servers: Server[]): Server | null {
    if (servers.length === 0) return null;

    let selected: Server | null = null;

    for (const server of servers) {
      if (!selected) {
        selected = server;
        continue;
      }

      if (server.activeRequests < selected.activeRequests) {
        selected = server;
      } else if (server.activeRequests === selected.activeRequests) {
        // Tie breaker 1: higher priority first
        if (server.priority > selected.priority) {
          selected = server;
        } else if (server.priority === selected.priority) {
          // Tie breaker 2: higher weight first
          if (server.weight > selected.weight) {
            selected = server;
          }
        }
      }
    }

    return selected;
  }
}
