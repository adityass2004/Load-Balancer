import { ServerSelector } from './ServerSelector';
import { RequestForwarder } from './RequestForwarder';
import { MetricsCollector } from './MetricsCollector';
import { Server, Settings, HttpMethod } from '@/types/domain';
import { HealthFilter } from './HealthFilter';
import { getLogQueue } from '@/services/logging/LogQueue';
import { isIdempotentMethod } from './retry-policy';
import { BodyTooLargeError, isClientAbort, type RequestPayload } from './body-policy';

export class RetryService {
  constructor(
    private readonly selector: ServerSelector,
    private readonly forwarder: RequestForwarder,
    private readonly metrics: MetricsCollector
  ) {}

  async executeWithRetry(
    request: Request,
    downstreamPath: string,
    servers: Server[],
    settings: Settings,
    projectId: string,
    payload?: RequestPayload,
    clientIp?: string,
    nextHop?: number
  ): Promise<Response> {
    const maxRetries = settings.maxRetries ?? 3;
    const requestTimeout = settings.requestTimeout ?? 10000;
    const maxFailures = settings.maxFailures ?? 3;

    const overallStartTime = Date.now();
    const requestId = request.headers.get('x-request-id') || crypto.randomUUID();
    const route = downstreamPath;
    const rawMethod = request.method || 'GET';
    const normalizedMethod = rawMethod.trim().toUpperCase();
    const method = (normalizedMethod as HttpMethod) || HttpMethod.GET;
    const isIdempotent = isIdempotentMethod(normalizedMethod);

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
          {
            status: 503,
            headers: {
              'Content-Type': 'application/json',
              'x-request-id': requestId,
            },
          }
        );
      }

      const selectedServer = this.selector.select(availableServers, settings.algorithm, clientIp);

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
          {
            status: 503,
            headers: {
              'Content-Type': 'application/json',
              'x-request-id': requestId,
            },
          }
        );
      }

      lastSelectedServer = selectedServer;
      triedServerIds.add(selectedServer.id);

      const startTime = Date.now();
      this.metrics.recordRequestStart(selectedServer.id);

      try {
        const forwardCtx =
          clientIp !== undefined || nextHop !== undefined
            ? { clientIp, nextHop }
            : undefined;

        const response = forwardCtx
          ? await this.forwarder.forward(
              selectedServer,
              request,
              requestTimeout,
              downstreamPath,
              payload,
              forwardCtx
            )
          : await this.forwarder.forward(
              selectedServer,
              request,
              requestTimeout,
              downstreamPath,
              payload
            );
        const latency = Date.now() - startTime;

        // Check if server returned a retryable gateway/server error status
        if (response.status === 502 || response.status === 503 || response.status === 504) {
          // Failure still counts against server's health
          await this.metrics.recordRequestEnd(selectedServer.id, latency, false, maxFailures);

          // Non-idempotent methods and streamed bodies must NEVER be auto-retried
          if (!isIdempotent || payload?.kind === 'stream') {
            const reason = !isIdempotent
              ? 'non-idempotent method, retry skipped'
              : 'streamed body, retry skipped';

            console.warn(
              `[RETRY] requestId=${requestId} method=${normalizedMethod} serverId=${selectedServer.id} reason="${reason}"`
            );

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
              errorMessage: `Server returned status ${response.status}`,
            });

            // Ensure x-request-id is propagated
            try {
              response.headers.set('x-request-id', requestId);
            } catch {
              // headers may be immutable in some response wrappers
            }

            return response;
          }

          // Idempotent method with replayable body: throw so it can be retried on next available server
          throw new Error(`Server returned status ${response.status}`);
        }

        // Success or non-retryable response (e.g. 200, 400, 404, 500)
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

        try {
          response.headers.set('x-request-id', requestId);
        } catch {
          // ignore immutable headers
        }

        return response;
      } catch (error: any) {
        const latency = Date.now() - startTime;
        lastError = error?.message || 'Request failed';

        const isBodyTooLarge =
          error instanceof BodyTooLargeError || error?.name === 'BodyTooLargeError';
        const isClientAbortErr = isClientAbort(error, request.signal);
        const isClientError = isBodyTooLarge || isClientAbortErr;

        // Client-caused outcomes do NOT count against backend health
        if (isClientError) {
          await this.metrics.recordRequestEnd(
            selectedServer.id,
            latency,
            false,
            maxFailures,
            true
          );
        } else {
          await this.metrics.recordRequestEnd(
            selectedServer.id,
            latency,
            false,
            maxFailures
          );
        }

        if (isBodyTooLarge) {
          console.warn(
            `[PAYLOAD_413] stream exceeded cap mid-stream: requestId=${requestId} maxBytes=${(error as BodyTooLargeError).maxBytes}`
          );
          return new Response(
            JSON.stringify({
              error: 'Payload too large',
              maxBytes: (error as BodyTooLargeError).maxBytes,
            }),
            {
              status: 413,
              headers: {
                'Content-Type': 'application/json',
                Connection: 'close',
                'x-request-id': requestId,
              },
            }
          );
        }

        if (isClientAbortErr) {
          // Client disconnect mid-upload: free resources, no 5xx logged against backend
          return new Response(JSON.stringify({ error: 'Client disconnected' }), {
            status: 499,
            headers: {
              'Content-Type': 'application/json',
              'x-request-id': requestId,
            },
          });
        }

        // Non-idempotent methods or streamed bodies: make exactly ONE attempt, do NOT retry
        if (!isIdempotent || payload?.kind === 'stream') {
          const reason = !isIdempotent
            ? 'non-idempotent method, retry skipped'
            : 'streamed body, retry skipped';

          console.warn(
            `[RETRY] requestId=${requestId} method=${normalizedMethod} serverId=${selectedServer.id} reason="${reason}"`
          );

          const isTimeout =
            error?.code === 'ECONNABORTED' ||
            error?.code === 'ETIMEDOUT' ||
            error?.message?.toLowerCase().includes('timeout');
          const statusCode = isTimeout ? 504 : 502;

          const responseTimeMs = Date.now() - overallStartTime;
          this.logRequestSilently({
            projectId,
            requestId,
            method,
            route,
            backendId: selectedServer.id,
            backendUrl: selectedServer.url,
            statusCode,
            responseTimeMs,
            retryCount: attempt,
            errorMessage: lastError,
          });

          return new Response(
            JSON.stringify({ message: lastError }),
            {
              status: statusCode,
              headers: {
                'Content-Type': 'application/json',
                'x-request-id': requestId,
              },
            }
          );
        }

        // Idempotent methods with replayable body: advance attempt count and retry with next server
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
      {
        status: 503,
        headers: {
          'Content-Type': 'application/json',
          'x-request-id': requestId,
        },
      }
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
    try {
      getLogQueue().enqueue(data);
    } catch {
      // enqueue should never throw, but guard defensively
    }
  }
}
