import { LoadBalancingStrategy } from '../interfaces/LoadBalancingStrategy';
import { Server } from '@/types/domain';

export class WeightedRoundRobinStrategy implements LoadBalancingStrategy {
  // Map of server ID -> current dynamic weight
  private static currentWeights = new Map<string, number>();

  selectServer(servers: Server[]): Server | null {
    if (servers.length === 0) return null;

    // Reset weight mapping if server is no longer in list
    const serverIds = new Set(servers.map((s) => s.id));
    for (const key of WeightedRoundRobinStrategy.currentWeights.keys()) {
      if (!serverIds.has(key)) {
        WeightedRoundRobinStrategy.currentWeights.delete(key);
      }
    }

    let totalWeight = 0;
    let maxServer: Server | null = null;
    let maxWeight = -Infinity;

    for (const server of servers) {
      const weight = server.weight || 1;
      totalWeight += weight;

      // Get or initialize in-memory dynamic weight
      let currentWeight = WeightedRoundRobinStrategy.currentWeights.get(server.id) || 0;
      currentWeight += weight;
      WeightedRoundRobinStrategy.currentWeights.set(server.id, currentWeight);

      if (currentWeight > maxWeight) {
        maxWeight = currentWeight;
        maxServer = server;
      }
    }

    if (maxServer) {
      const currentWeight = WeightedRoundRobinStrategy.currentWeights.get(maxServer.id) || 0;
      WeightedRoundRobinStrategy.currentWeights.set(maxServer.id, currentWeight - totalWeight);
    }

    return maxServer;
  }
}
