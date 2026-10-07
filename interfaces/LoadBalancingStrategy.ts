import { Server } from '@/types/domain';

export interface LoadBalancingStrategy {
  selectServer(servers: Server[], clientIp?: string): Server | null;
}
