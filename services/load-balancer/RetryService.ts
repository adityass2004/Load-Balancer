import { ServerSelector } from './ServerSelector';
import { RequestForwarder } from './RequestForwarder';
import { MetricsCollector } from './MetricsCollector';
import { Server, Settings, HttpMethod } from '@/types/domain';
import { HealthFilter } from './HealthFilter';
import { loggingService } from '@/services/logging/LoggingService';

export class RetryService {
  constructor(
    private readonly selector: ServerSelector,
    private readonly forwarder: RequestForwarder,
    private readonly metrics: MetricsCollector
  ) { }

  async executeWithRetry(
    request: Request,
    downstreamPath: string,
    servers: Server[],
    settings: Settings,
    projectId: string
  ): Promise<Response> {
    const maxRetries = settings.maxRetries ?? 3;
    const requestTimeout = settings.requestTimeout ?? 10000;
    const maxFailures = settings.maxFailures ?? 3;

    const overallStartTime = Date.now();
    const requestId = crypto.randomUUID();
    const route = downstreamPath;
    const method = (request.method?.toUpperCase() as HttpMethod) || HttpMethod.GET;

    const triedServerIds = new Set<string>();
    let attempt = 0;
    let lastSelectedServer: Server | null = null;
    let lastError: string | null = null;

    while (attempt <= maxRetries) {
      // LoadBalancer normally supplies a project-scoped list. Keep this
      // invariant at the retry boundary as well so a stale or malformed cache
      // can never make a retry cross into another project's pool.
      const projectServers = servers.filter((server) => server.projectId === projectId);
      const healthyServers = HealthFilter.filter(projectServers);
      const availableServers = healthyServers.filter((s) => !triedServerIds.has(s.id));

      if (availableServers.length === 0) {
        const responseTimeMs = Date.now() - overallStartTime;
        const errMsg = 'No healthy backend available.';
        this.logRequestSilently({
          projectId,
          requestId,
          method,
          route,
          backendId: lastSelectedServer?.id ?? null,
          backendUrl: lastSelectedServer?.url ?? null,
          statusCode: 503,
          responseTimeMs,
          retryCount: attempt,
          errorMessage: errMsg,
        });
        return new Response(
          JSON.stringify({ message: errMsg }),
          { status: 503, headers: { 'Content-Type': 'application/json' } }
        );
      }

      const selectedServer = this.selector.select(availableServers, settings.algorithm);

      if (!selectedServer) {
        const responseTimeMs = Date.now() - overallStartTime;
        const errMsg = 'No healthy backend available.';
        this.logRequestSilently({
          projectId,
          requestId,
          method,
          route,
          backendId: lastSelectedServer?.id ?? null,
          backendUrl: lastSelectedServer?.url ?? null,
          statusCode: 503,
          responseTimeMs,
          retryCount: attempt,
          errorMessage: errMsg,
        });
        return new Response(
          JSON.stringify({ message: errMsg }),
          { status: 503, headers: { 'Content-Type': 'application/json' } }
        );
      }

      lastSelectedServer = selectedServer;
      triedServerIds.add(selectedServer.id);

      const startTime = Date.now();
      this.metrics.recordRequestStart(selectedServer.id);

      try {
        const requestClone = request.clone();
        const response = await this.forwarder.forward(
          selectedServer,
          requestClone,
          requestTimeout,
          downstreamPath
        );
        const latency = Date.now() - startTime;

        if (response.status === 502 || response.status === 503 || response.status === 504) {
          throw new Error(`Server returned status ${response.status}`);
        }

        await this.metrics.recordRequestEnd(selectedServer.id, latency, true, maxFailures);

        const responseTimeMs = Date.now() - overallStartTime;
        this.logRequestSilently({
          projectId,
          requestId,
          method,
          route,
          backendId: selectedServer.id,
          backendUrl: selectedServer.url,
          statusCode: response.status,
          responseTimeMs,
          retryCount: attempt,
          errorMessage: null,
        });

        return response;
      } catch (error: any) {
        const latency = Date.now() - startTime;
        lastError = error?.message || 'Request failed';
        await this.metrics.recordRequestEnd(selectedServer.id, latency, false, maxFailures);

        attempt++;
      }
    }

    const responseTimeMs = Date.now() - overallStartTime;
    const finalErrorMessage = lastError || 'No healthy backend available.';
    this.logRequestSilently({
      projectId,
      requestId,
      method,
      route,
      backendId: lastSelectedServer?.id ?? null,
      backendUrl: lastSelectedServer?.url ?? null,
      statusCode: 503,
      responseTimeMs,
      retryCount: maxRetries,
      errorMessage: finalErrorMessage,
    });

    return new Response(
      JSON.stringify({ message: 'No healthy backend available.' }),
      { status: 503, headers: { 'Content-Type': 'application/json' } }
    );
  }

  private logRequestSilently(data: {
    projectId?: string | null;
    requestId: string;
    method: HttpMethod;
    route: string;
    backendId: string | null;
    backendUrl: string | null;
    statusCode: number;
    responseTimeMs: number;
    retryCount: number;
    errorMessage: string | null;
  }): void {
    loggingService.createLog(data).catch((err) => {
      console.error('[LOGGING] Failed to create request log:', err?.message || err);
    });
  }
}
