import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RetryService } from '../RetryService';
import { ServerSelector } from '../ServerSelector';
import { RequestForwarder } from '../RequestForwarder';
import { MetricsCollector } from '../MetricsCollector';
import { Server, Settings, Algorithm, ServerHealth } from '@/types/domain';
import { getLogQueue } from '@/services/logging/LogQueue';

describe('RetryService - Idempotency & Retry Enforcement', () => {
  let selector: ServerSelector;
  let forwarder: RequestForwarder;
  let metrics: MetricsCollector;
  let retryService: RetryService;
  let loggedEntries: any[];

  const serverA: Server = {
    id: 'server-a-uuid',
    projectId: 'proj-1',
    name: 'Server A',
    url: 'https://server-a.internal',
    enabled: true,
    healthy: ServerHealth.HEALTHY,
    weight: 1,
    priority: 0,
    requestsHandled: 0,
    activeRequests: 0,
    averageResponseTime: 0,
    failureCount: 0,
    lastHealthCheck: null,
    deletedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const serverB: Server = {
    id: 'server-b-uuid',
    projectId: 'proj-1',
    name: 'Server B',
    url: 'https://server-b.internal',
    enabled: true,
    healthy: ServerHealth.HEALTHY,
    weight: 1,
    priority: 0,
    requestsHandled: 0,
    activeRequests: 0,
    averageResponseTime: 0,
    failureCount: 0,
    lastHealthCheck: null,
    deletedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const settings: Settings = {
    id: 'settings-1',
    projectId: 'proj-1',
    algorithm: Algorithm.ROUND_ROBIN,
    healthCheckInterval: 30,
    healthCheckTimeout: 5,
    maxFailures: 3,
    autoRecovery: true,
    requestTimeout: 5000,
    maxRetries: 3,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    loggedEntries = [];
    vi.spyOn(getLogQueue(), 'enqueue').mockImplementation((data: any) => {
      loggedEntries.push(data);
    });

    selector = {
      select: vi.fn((servers: Server[]) => (servers.length > 0 ? servers[0] : null)),
    } as unknown as ServerSelector;

    forwarder = {
      forward: vi.fn(),
    } as unknown as RequestForwarder;

    metrics = {
      recordRequestStart: vi.fn(),
      recordRequestEnd: vi.fn().mockResolvedValue(undefined),
    } as unknown as MetricsCollector;

    retryService = new RetryService(selector, forwarder, metrics);
  });

  it('GET: retries on 503 from Server A and succeeds on Server B', async () => {
    const forwardMock = vi.mocked(forwarder.forward);
    forwardMock
      .mockResolvedValueOnce(new Response('Server error', { status: 503 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ ok: true }), { status: 200 }));

    const request = new Request('http://localhost:3000/api/trial/data', {
      method: 'GET',
    });

    const response = await retryService.executeWithRetry(
      request,
      '/data',
      [serverA, serverB],
      settings,
      'proj-1'
    );

    expect(response.status).toBe(200);
    expect(forwardMock).toHaveBeenCalledTimes(2);
    expect(forwardMock.mock.calls[0][0].id).toBe('server-a-uuid');
    expect(forwardMock.mock.calls[1][0].id).toBe('server-b-uuid');

    // Failure was recorded for server A
    expect(metrics.recordRequestEnd).toHaveBeenCalledWith('server-a-uuid', expect.any(Number), false, 3);
    // Success was recorded for server B
    expect(metrics.recordRequestEnd).toHaveBeenCalledWith('server-b-uuid', expect.any(Number), true, 3);
  });

  it('PUT and DELETE: idempotent methods are retried when upstream returns 503', async () => {
    for (const method of ['PUT', 'DELETE']) {
      vi.clearAllMocks();
      const forwardMock = vi.mocked(forwarder.forward);
      forwardMock
        .mockResolvedValueOnce(new Response('Gateway timeout', { status: 504 }))
        .mockResolvedValueOnce(new Response('Deleted/Updated', { status: 200 }));

      const request = new Request('http://localhost:3000/api/trial/resource', {
        method,
      });

      const response = await retryService.executeWithRetry(
        request,
        '/resource',
        [serverA, serverB],
        settings,
        'proj-1'
      );

      expect(response.status).toBe(200);
      expect(forwardMock).toHaveBeenCalledTimes(2);
      expect(forwardMock.mock.calls[0][0].id).toBe('server-a-uuid');
      expect(forwardMock.mock.calls[1][0].id).toBe('server-b-uuid');
    }
  });

  it('POST: upstream fails with 503 on Server A -> exactly 1 attempt, Server B never called, 503 returned to client', async () => {
    const forwardMock = vi.mocked(forwarder.forward);
    forwardMock.mockResolvedValueOnce(new Response('Service Unavailable', { status: 503 }));

    const request = new Request('http://localhost:3000/api/trial/orders', {
      method: 'POST',
      body: JSON.stringify({ item: 'laptop' }),
    });

    const response = await retryService.executeWithRetry(
      request,
      '/orders',
      [serverA, serverB],
      settings,
      'proj-1'
    );

    // Exactly 1 attempt made
    expect(forwardMock).toHaveBeenCalledTimes(1);
    expect(forwardMock.mock.calls[0][0].id).toBe('server-a-uuid');

    // Server B was NEVER called
    expect(selector.select).toHaveBeenCalledTimes(1);

    // Upstream 503 status is passed through directly
    expect(response.status).toBe(503);

    // Server failure counter was still recorded for Server A
    expect(metrics.recordRequestEnd).toHaveBeenCalledWith('server-a-uuid', expect.any(Number), false, 3);

    // Request log was written exactly once
    expect(loggedEntries.length).toBe(1);
    expect(loggedEntries[0].backendId).toBe('server-a-uuid');
    expect(loggedEntries[0].statusCode).toBe(503);
    expect(loggedEntries[0].retryCount).toBe(0);
  });

  it('PATCH: upstream fails with 502 -> exactly 1 attempt, not retried', async () => {
    const forwardMock = vi.mocked(forwarder.forward);
    forwardMock.mockResolvedValueOnce(new Response('Bad Gateway', { status: 502 }));

    const request = new Request('http://localhost:3000/api/trial/users/1', {
      method: 'PATCH',
      body: JSON.stringify({ name: 'Alice' }),
    });

    const response = await retryService.executeWithRetry(
      request,
      '/users/1',
      [serverA, serverB],
      settings,
      'proj-1'
    );

    expect(forwardMock).toHaveBeenCalledTimes(1);
    expect(response.status).toBe(502);
    expect(metrics.recordRequestEnd).toHaveBeenCalledWith('server-a-uuid', expect.any(Number), false, 3);
  });

  it('POST with connection timeout: exactly 1 attempt, returns 504, not retried', async () => {
    const forwardMock = vi.mocked(forwarder.forward);
    const timeoutError: any = new Error('timeout of 5000ms exceeded');
    timeoutError.code = 'ECONNABORTED';
    forwardMock.mockRejectedValueOnce(timeoutError);

    const request = new Request('http://localhost:3000/api/trial/payments', {
      method: 'POST',
      body: JSON.stringify({ amount: 100 }),
    });

    const response = await retryService.executeWithRetry(
      request,
      '/payments',
      [serverA, serverB],
      settings,
      'proj-1'
    );

    expect(forwardMock).toHaveBeenCalledTimes(1);
    expect(response.status).toBe(504);
    expect(metrics.recordRequestEnd).toHaveBeenCalledWith('server-a-uuid', expect.any(Number), false, 3);
    expect(loggedEntries.length).toBe(1);
    expect(loggedEntries[0].statusCode).toBe(504);
  });

  it('POST with connection reset/refused: exactly 1 attempt, returns 502, not retried', async () => {
    const forwardMock = vi.mocked(forwarder.forward);
    const connError: any = new Error('connect ECONNREFUSED');
    connError.code = 'ECONNREFUSED';
    forwardMock.mockRejectedValueOnce(connError);

    const request = new Request('http://localhost:3000/api/trial/payments', {
      method: 'POST',
    });

    const response = await retryService.executeWithRetry(
      request,
      '/payments',
      [serverA, serverB],
      settings,
      'proj-1'
    );

    expect(forwardMock).toHaveBeenCalledTimes(1);
    expect(response.status).toBe(502);
    expect(metrics.recordRequestEnd).toHaveBeenCalledWith('server-a-uuid', expect.any(Number), false, 3);
  });

  it('Unknown method ("FOO"): treated as non-idempotent and fails safe after 1 attempt', async () => {
    const forwardMock = vi.mocked(forwarder.forward);
    forwardMock.mockResolvedValueOnce(new Response('Error', { status: 503 }));

    const request = new Request('http://localhost:3000/api/trial/custom', {
      method: 'FOO',
    });

    const response = await retryService.executeWithRetry(
      request,
      '/custom',
      [serverA, serverB],
      settings,
      'proj-1'
    );

    expect(forwardMock).toHaveBeenCalledTimes(1);
    expect(response.status).toBe(503);
    expect(metrics.recordRequestEnd).toHaveBeenCalledWith('server-a-uuid', expect.any(Number), false, 3);
  });

  it('Lowercase "post": normalized to uppercase and treated as non-idempotent (1 attempt)', async () => {
    const forwardMock = vi.mocked(forwarder.forward);
    forwardMock.mockResolvedValueOnce(new Response('Error', { status: 503 }));

    // Request mock with lowercase method
    const request = {
      method: 'post',
      headers: new Headers(),
      clone: () => request,
    } as unknown as Request;

    const response = await retryService.executeWithRetry(
      request,
      '/data',
      [serverA, serverB],
      settings,
      'proj-1'
    );

    expect(forwardMock).toHaveBeenCalledTimes(1);
    expect(response.status).toBe(503);
  });

  it('Streamed body PUT: fails with 503 and is NOT retried (exactly 1 attempt)', async () => {
    const forwardMock = vi.mocked(forwarder.forward);
    forwardMock.mockResolvedValueOnce(new Response('Error', { status: 503 }));
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const request = new Request('http://localhost:3000/api/trial/upload', {
      method: 'PUT',
    });
    const payload = {
      kind: 'stream' as const,
      stream: new (await import('stream')).Readable({ read() { this.push(null); } }),
    };

    const response = await retryService.executeWithRetry(
      request,
      '/upload',
      [serverA, serverB],
      settings,
      'proj-1',
      payload
    );

    expect(forwardMock).toHaveBeenCalledTimes(1);
    expect(response.status).toBe(503);
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('reason="streamed body, retry skipped"')
    );
    warnSpy.mockRestore();
  });

  it('Buffered body PUT: retried on 503 and succeeds on Server B with identical buffer', async () => {
    const forwardMock = vi.mocked(forwarder.forward);
    forwardMock
      .mockResolvedValueOnce(new Response('Server A 503', { status: 503 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ ok: true }), { status: 200 }));

    const request = new Request('http://localhost:3000/api/trial/upload', {
      method: 'PUT',
    });
    const testBuf = Buffer.from('hello replayable body');
    const payload = {
      kind: 'buffer' as const,
      data: testBuf,
      releaseBudget: vi.fn(),
    };

    const response = await retryService.executeWithRetry(
      request,
      '/upload',
      [serverA, serverB],
      settings,
      'proj-1',
      payload
    );

    expect(forwardMock).toHaveBeenCalledTimes(2);
    expect(forwardMock).toHaveBeenNthCalledWith(1, serverA, request, 5000, '/upload', payload);
    expect(forwardMock).toHaveBeenNthCalledWith(2, serverB, request, 5000, '/upload', payload);
    expect(response.status).toBe(200);
  });

  it('BodyTooLargeError mid-stream: returns 413, does not increment server failure count (isClientError=true)', async () => {
    const { BodyTooLargeError } = await import('../body-policy');
    const forwardMock = vi.mocked(forwarder.forward);
    forwardMock.mockRejectedValueOnce(new BodyTooLargeError(100, 105));

    const request = new Request('http://localhost:3000/api/trial/upload', {
      method: 'POST',
    });

    const response = await retryService.executeWithRetry(
      request,
      '/upload',
      [serverA, serverB],
      settings,
      'proj-1'
    );

    expect(response.status).toBe(413);
    const body = await response.json();
    expect(body.error).toBe('Payload too large');
    expect(body.maxBytes).toBe(100);
    // isClientError flag passed to recordRequestEnd must be true
    expect(metrics.recordRequestEnd).toHaveBeenCalledWith('server-a-uuid', expect.any(Number), false, 3, true);
  });

  it('Client abort mid-stream: returns 499, does not increment server failure count (isClientError=true)', async () => {
    const forwardMock = vi.mocked(forwarder.forward);
    const abortErr = new Error('Premature close');
    (abortErr as any).code = 'ERR_STREAM_PREMATURE_CLOSE';
    forwardMock.mockRejectedValueOnce(abortErr);

    const controller = new AbortController();
    const request = new Request('http://localhost:3000/api/trial/upload', {
      method: 'POST',
      signal: controller.signal,
    });

    const response = await retryService.executeWithRetry(
      request,
      '/upload',
      [serverA, serverB],
      settings,
      'proj-1'
    );

    expect(response.status).toBe(499);
    // isClientError flag passed to recordRequestEnd must be true
    expect(metrics.recordRequestEnd).toHaveBeenCalledWith('server-a-uuid', expect.any(Number), false, 3, true);
  });
});

