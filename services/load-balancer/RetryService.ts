import { ServerSelector } from './ServerSelector';
import { RequestForwarder } from './RequestForwarder';
import { MetricsCollector } from './MetricsCollector';
import { Server, Settings } from '@/types/domain';
import { HealthFilter } from './HealthFilter';

export class RetryService {
  constructor(
    private readonly selector: ServerSelector,
    private readonly forwarder: RequestForwarder,
    private readonly metrics: MetricsCollector
  ) { }

  async executeWithRetry(
    request: Request,
    servers: Server[],
    settings: Settings
  ): Promise<Response> {
    const maxRetries = settings.maxRetries ?? 3;
    const requestTimeout = settings.requestTimeout ?? 10000;
    const maxFailures = settings.maxFailures ?? 3;

    const triedServerIds = new Set<string>();
    let attempt = 0;

    while (attempt <= maxRetries) {
      const healthyServers = HealthFilter.filter(servers);
      const availableServers = healthyServers.filter((s) => !triedServerIds.has(s.id));

      if (availableServers.length === 0) {
        return new Response(
          JSON.stringify({ message: 'No healthy backend available.' }),
          { status: 503, headers: { 'Content-Type': 'application/json' } }
        );
      }

      const selectedServer = this.selector.select(availableServers, settings.algorithm);

      if (!selectedServer) {
        return new Response(
          JSON.stringify({ message: 'No healthy backend available.' }),
          { status: 503, headers: { 'Content-Type': 'application/json' } }
        );
      }

      triedServerIds.add(selectedServer.id);

      const startTime = Date.now();
      this.metrics.recordRequestStart(selectedServer.id);

      try {
        const requestClone = request.clone();
        const response = await this.forwarder.forward(selectedServer, requestClone, requestTimeout);
        const latency = Date.now() - startTime;

        if (response.status === 502 || response.status === 503 || response.status === 504) {
          throw new Error(`Server returned status ${response.status}`);
        }

        await this.metrics.recordRequestEnd(selectedServer.id, latency, true, maxFailures);
        return response;
      } catch (error: any) {
        const latency = Date.now() - startTime;
        await this.metrics.recordRequestEnd(selectedServer.id, latency, false, maxFailures);

        attempt++;
      }
    }

    return new Response(
      JSON.stringify({ message: 'No healthy backend available.' }),
      { status: 503, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
