import { Server } from '@/types/domain';

export interface LoadBalancingStrategy {
  selectServer(servers: Server[]): Server | null;
}
