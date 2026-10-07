import { ServerSelector } from './ServerSelector';
import { RequestForwarder } from './RequestForwarder';
import { MetricsCollector } from './MetricsCollector';
import { Server, Settings, HttpMethod } from '@/types/domain';
import { HealthFilter } from './HealthFilter';
import { getLogQueue } from '@/services/logging/LogQueue';
import { isIdempotentMethod } from './retry-policy';
import { BodyTooLargeError, isClientAbort, type RequestPayload } from './body-policy';

export type SleepFn = (ms: number, signal?: AbortSignal) => Promise<void>;
export type RandomFn = () => number;

export const defaultSleepFn: SleepFn = (ms: number, signal?: AbortSignal) => {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      return reject(new Error('Client aborted'));
    }
    let timer: NodeJS.Timeout | null = null;

    const onAbort = () => {
      if (timer) clearTimeout(timer);
      reject(new Error('Client aborted'));
    };

    if (signal) {
      signal.addEventListener('abort', onAbort, { once: true });
    }

    timer = setTimeout(() => {
      if (signal) signal.removeEventListener('abort', onAbort);
      resolve();
    }, ms);
  });
};

export function calculateRetryDelay(
  attempt: number,
  baseDelayMs = 50,
  maxDelayMs = 300,
  randomFn = Math.random
): number {
  if (attempt <= 0) return 0;
  const cap = Math.min(maxDelayMs, baseDelayMs * Math.pow(2, attempt - 1));
  return Math.floor(randomFn() * cap);
}

export class RetryService {
  constructor(
    private readonly selector: ServerSelector,
    private readonly forwarder: RequestForwarder,
    private readonly metrics: MetricsCollector,
    private readonly sleepFn: SleepFn = defaultSleepFn,
    private readonly randomFn: RandomFn = Math.random
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

    const baseDelayMs = parseInt(process.env.RETRY_BASE_DELAY_MS || '50', 10) || 50;
    const maxDelayMs = parseInt(process.env.RETRY_MAX_DELAY_MS || '300', 10) || 300;
    const maxTotalMs = parseInt(process.env.RETRY_MAX_TOTAL_MS || '2000', 10) || 2000;
    let totalSleepMs = 0;

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
      if (attempt > 0) {
        let delay = calculateRetryDelay(attempt, baseDelayMs, maxDelayMs, this.randomFn);
        if (totalSleepMs + delay > maxTotalMs) {
          delay = maxTotalMs - totalSleepMs;
        }

        if (delay <= 0 || totalSleepMs >= maxTotalMs) {
          console.warn(`[RETRY_BUDGET] requestId=${requestId} retry sleep budget exhausted (${totalSleepMs}ms / ${maxTotalMs}ms)`);
          break;
        }

        try {
          await this.sleepFn(delay, request.signal);
          totalSleepMs += delay;
        } catch (err: any) {
          if (isClientAbort(err, request.signal)) {
            const responseTimeMs = Date.now() - overallStartTime;
            this.logRequestSilently({
              projectId,
              requestId,
              method,
              route,
              backendId: lastSelectedServer?.id ?? null,
              backendUrl: lastSelectedServer?.url ?? null,
              statusCode: 499,
              responseTimeMs,
              retryCount: attempt,
              errorMessage: 'Client disconnected during retry backoff',
            });
            return new Response(
              JSON.stringify({ error: 'Client disconnected' }),
              {
                status: 499,
                headers: {
                  'Content-Type': 'application/json',
                  'x-request-id': requestId,
                },
              }
            );
          }
          throw err;
        }
      }
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
