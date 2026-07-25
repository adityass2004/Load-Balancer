import { LoadBalancingStrategy } from '../interfaces/LoadBalancingStrategy';
import { Server } from '@/types/domain';

export class RandomStrategy implements LoadBalancingStrategy {
  selectServer(servers: Server[]): Server | null {
    if (servers.length === 0) return null;

    const anyWeighted = servers.some((s) => (s.weight || 1) !== 1);
    if (anyWeighted) {
      let total = 0;
      for (const s of servers) total += s.weight || 1;
      let r = Math.random() * total;
      for (const s of servers) {
        r -= s.weight || 1;
        if (r <= 0) return s;
      }
    }

    const index = Math.floor(Math.random() * servers.length);
    return servers[index];
  }
}
