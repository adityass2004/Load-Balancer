import { LoadBalancingStrategy } from '../interfaces/LoadBalancingStrategy';
import { Server } from '@/types/domain';
import { WeightedRoundRobinStrategy } from './WeightedRoundRobinStrategy';

export class RoundRobinStrategy implements LoadBalancingStrategy {
  private static currentIndex = 0;
  private static wrr = new WeightedRoundRobinStrategy();

  selectServer(servers: Server[]): Server | null {
    if (servers.length === 0) return null;

    const anyWeighted = servers.some((s) => (s.weight || 1) !== 1);
    if (anyWeighted) {
      return RoundRobinStrategy.wrr.selectServer(servers);
    }

    const index = RoundRobinStrategy.currentIndex % servers.length;
    const selected = servers[index];

    RoundRobinStrategy.currentIndex =
      (RoundRobinStrategy.currentIndex + 1) % servers.length;

    return selected;
  }
}
