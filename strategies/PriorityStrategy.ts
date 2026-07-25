import { LoadBalancingStrategy } from '../interfaces/LoadBalancingStrategy';
import { Server } from '@/types/domain';
import { WeightedRoundRobinStrategy } from './WeightedRoundRobinStrategy';

export class PriorityStrategy implements LoadBalancingStrategy {
  private static wrr = new WeightedRoundRobinStrategy();
  private static rrIndices = new Map<number, number>();

  selectServer(servers: Server[]): Server | null {
    if (servers.length === 0) return null;

    let maxPriority = -Infinity;
    for (const server of servers) {
      if (server.priority > maxPriority) maxPriority = server.priority;
    }

    const topServers = servers.filter((s) => s.priority === maxPriority);
    if (topServers.length === 0) return null;

    const anyWeighted = topServers.some((s) => (s.weight || 1) !== 1);
    if (anyWeighted) {
      return PriorityStrategy.wrr.selectServer(topServers);
    }

    let index = PriorityStrategy.rrIndices.get(maxPriority) || 0;
    const selected = topServers[index % topServers.length];
    PriorityStrategy.rrIndices.set(maxPriority, (index + 1) % topServers.length);
    return selected;
  }
}
