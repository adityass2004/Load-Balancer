import { Algorithm, Server } from '@/types/domain';
import { LoadBalancingStrategy } from '../../interfaces/LoadBalancingStrategy';
import { RoundRobinStrategy } from '../../strategies/RoundRobinStrategy';
import { LeastConnectionsStrategy } from '../../strategies/LeastConnectionsStrategy';
import { WeightedRoundRobinStrategy } from '../../strategies/WeightedRoundRobinStrategy';
import { RandomStrategy } from '../../strategies/RandomStrategy';
import { PriorityStrategy } from '../../strategies/PriorityStrategy';

export class ServerSelector {
  private strategies: Record<Algorithm, LoadBalancingStrategy>;

  constructor() {
    const roundRobin = new RoundRobinStrategy();
    
    this.strategies = {
      [Algorithm.ROUND_ROBIN]: roundRobin,
      [Algorithm.LEAST_CONNECTIONS]: new LeastConnectionsStrategy(),
      [Algorithm.WEIGHTED_ROUND_ROBIN]: new WeightedRoundRobinStrategy(),
      [Algorithm.RANDOM]: new RandomStrategy(),
      [Algorithm.PRIORITY]: new PriorityStrategy(),
      // Fallback for IP_HASH to Round Robin (or we can use it directly)
      [Algorithm.IP_HASH]: roundRobin,
    };
  }

  select(servers: Server[], algorithm: Algorithm): Server | null {
    if (servers.length === 0) return null;
    const strategy = this.strategies[algorithm] || this.strategies[Algorithm.ROUND_ROBIN];
    return strategy.selectServer(servers);
  }
}
