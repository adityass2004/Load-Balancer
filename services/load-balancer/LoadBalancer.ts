import { cacheService } from '@/services/cache/CacheService';
import { RetryService } from './RetryService';
import type { Project } from '@/types/domain';

export class LoadBalancer {
  constructor(private readonly retryService: RetryService) { }

  async handleRequest(
    request: Request,
    project: Project,
    downstreamPath: string
  ): Promise<Response> {
    try {
      const servers = await cacheService.getServersForProject(project.id);
      const settings = await cacheService.getSettingsForProject(project.id);

      return await this.retryService.executeWithRetry(
        request,
        downstreamPath,
        servers,
        settings,
        project.id
      );
    } catch (error: any) {
      console.error(`[LOAD_BALANCER] Internal Error: ${error.message}`);
      return new Response(
        JSON.stringify({ message: 'No healthy backend available.' }),
        { status: 503, headers: { 'Content-Type': 'application/json' } }
      );
    }
  }
}
