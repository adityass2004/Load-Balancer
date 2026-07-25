import { cacheService } from '@/services/cache/CacheService';
import { RetryService } from './RetryService';

export class LoadBalancer {
  constructor(private readonly retryService: RetryService) { }

  async handleRequest(request: Request): Promise<Response> {
    try {
      const servers = await cacheService.getServers();
      const settings = await cacheService.getSettings();

      return await this.retryService.executeWithRetry(request, servers, settings);
    } catch (error: any) {
      console.error(`[LOAD_BALANCER] Internal Error: ${error.message}`);
      return new Response(
        JSON.stringify({ message: 'No healthy backend available.' }),
        { status: 503, headers: { 'Content-Type': 'application/json' } }
      );
    }
  }
}
