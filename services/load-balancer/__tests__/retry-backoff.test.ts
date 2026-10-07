import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RetryService, calculateRetryDelay, type SleepFn, type RandomFn } from '../RetryService';
import { ServerSelector } from '../ServerSelector';
import { RequestForwarder } from '../RequestForwarder';
import { MetricsCollector } from '../MetricsCollector';
import { Server, Settings, Algorithm, ServerHealth } from '@/types/domain';
import { getLogQueue } from '@/services/logging/LogQueue';

describe('calculateRetryDelay (MEDIUM-04)', () => {
  it('returns 0 for attempt 0', () => {
    expect(calculateRetryDelay(0)).toBe(0);
  });

  it('calculates full jitter backoff within bounds', () => {
    // Attempt 1: min(300, 50 * 2^0) = 50. Jitter [0, 50]
    const randomMax: RandomFn = () => 0.999;
    const randomZero: RandomFn = () => 0;

    expect(calculateRetryDelay(1, 50, 300, randomZero)).toBe(0);
    expect(calculateRetryDelay(1, 50, 300, randomMax)).toBe(49);

    // Attempt 2: min(300, 50 * 2^1) = 100. Jitter [0, 100]
    expect(calculateRetryDelay(2, 50, 300, randomMax)).toBe(99);

    // Attempt 3: min(300, 50 * 2^2) = 200. Jitter [0, 200]
    expect(calculateRetryDelay(3, 50, 300, randomMax)).toBe(199);

    // Attempt 4: min(300, 50 * 2^3 = 400) -> capped at maxDelayMs 300
    expect(calculateRetryDelay(4, 50, 300, randomMax)).toBe(299);
  });
});

describe('RetryService Backoff & Cancelable Sleep (MEDIUM-04)', () => {
  let selector: ServerSelector;
  let forwarder: RequestForwarder;
  let metrics: MetricsCollector;
  let loggedEntries: any[];
  let sleepLog: number[];

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
    sleepLog = [];
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
  });

  it('GET retry invokes sleepFn before retry attempt with jittered delay', async () => {
    const mockSleep: SleepFn = async (ms) => {
      sleepLog.push(ms);
    };
    const mockRandom: RandomFn = () => 1.0; // max jitter

    const retryService = new RetryService(
      selector,
      forwarder,
      metrics,
      mockSleep,
      mockRandom
    );

    const forwardMock = vi.mocked(forwarder.forward);
    forwardMock
      .mockResolvedValueOnce(new Response('Error', { status: 503 }))
      .mockResolvedValueOnce(new Response('OK', { status: 200 }));

    const req = new Request('http://localhost:3000/api/trial/data', { method: 'GET' });
    const res = await retryService.executeWithRetry(req, '/data', [serverA, serverB], settings, 'proj-1');

    expect(res.status).toBe(200);
    expect(sleepLog.length).toBe(1); // 1 sleep before retry attempt 1
    expect(sleepLog[0]).toBeGreaterThan(0);
  });

  it('POST request never invokes sleepFn even when it fails', async () => {
    const mockSleep: SleepFn = async (ms) => {
      sleepLog.push(ms);
    };

    const retryService = new RetryService(selector, forwarder, metrics, mockSleep);

    const forwardMock = vi.mocked(forwarder.forward);
    forwardMock.mockResolvedValueOnce(new Response('Error', { status: 503 }));

    const req = new Request('http://localhost:3000/api/trial/data', { method: 'POST' });
    const res = await retryService.executeWithRetry(req, '/data', [serverA, serverB], settings, 'proj-1');

    expect(res.status).toBe(503);
    expect(sleepLog.length).toBe(0); // POST makes 1 attempt and never sleeps
  });

  it('client abort during retry sleep returns 499 and stops retries', async () => {
    const controller = new AbortController();
    const mockSleep: SleepFn = async (ms, signal) => {
      sleepLog.push(ms);
      controller.abort(); // simulate client abort during sleep
      if (signal?.aborted) {
        throw new Error('Client aborted');
      }
    };

    const retryService = new RetryService(selector, forwarder, metrics, mockSleep);

    const forwardMock = vi.mocked(forwarder.forward);
    forwardMock.mockResolvedValueOnce(new Response('Error', { status: 503 }));

    const req = new Request('http://localhost:3000/api/trial/data', {
      method: 'GET',
      signal: controller.signal,
    });
    const res = await retryService.executeWithRetry(req, '/data', [serverA, serverB], settings, 'proj-1');

    expect(res.status).toBe(499);
    expect(sleepLog.length).toBe(1); // stopped after 1 sleep attempt
  });
});
