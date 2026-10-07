import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  LogQueue,
  type BatchWriter,
  type LogEntry,
  type LogQueueStats,
} from '../LogQueue';
import { _resetLogQueueConfig } from '../log-queue-config';
import type { HttpMethod } from '@/types/domain';

// ─── Helpers ────────────────────────────────────────────────────────────────

function makeEntry(overrides: Partial<LogEntry> = {}): LogEntry {
  return {
    requestId: 'req-' + Math.random().toString(36).slice(2, 8),
    method: 'GET' as HttpMethod,
    route: '/api/test',
    statusCode: 200,
    responseTimeMs: 42,
    retryCount: 0,
    errorMessage: null,
    ...overrides,
  };
}

function makeQueue(
  writer: BatchWriter,
  overrides: Record<string, unknown> = {}
): LogQueue {
  return new LogQueue(writer, {
    maxEntries: 100,
    batchSize: 10,
    flushIntervalMs: 60_000, // long interval — we flush manually in tests
    flushTimeoutMs: 5_000,
    shutdownFlushMs: 5_000,
    maxRetries: 2,
    successSampleRate: 1,
    breakerThreshold: 3,
    breakerCooldownMs: 30_000,
    ...overrides,
  } as any);
}

// ─── Tests ──────────────────────────────────────────────────────────────────

describe('LogQueue (HIGH-01)', () => {
  beforeEach(() => {
    _resetLogQueueConfig();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ── enqueue behavior ────────────────────────────────────────────────────

  describe('enqueue', () => {
    it('is synchronous and does not call the writer', () => {
      const writer = vi.fn().mockResolvedValue(1);
      const q = makeQueue(writer, { batchSize: 1000 }); // huge batch so no auto-flush
      q.enqueue(makeEntry());
      expect(q.depth).toBe(1);
      expect(writer).not.toHaveBeenCalled();
    });

    it('does not throw even if the writer would throw', () => {
      const writer = vi.fn().mockRejectedValue(new Error('DB down'));
      const q = makeQueue(writer, { batchSize: 1000 });
      expect(() => q.enqueue(makeEntry())).not.toThrow();
    });
  });

  // ── batch-size flush ────────────────────────────────────────────────────

  describe('batch-size flush', () => {
    it('flushes when batchSize entries are enqueued', async () => {
      const writer = vi.fn().mockResolvedValue(10);
      const q = makeQueue(writer, { batchSize: 10 });
      for (let i = 0; i < 10; i++) q.enqueue(makeEntry());
      // Give the async flush a tick
      await new Promise((r) => setTimeout(r, 50));
      expect(writer).toHaveBeenCalledTimes(1);
      expect(writer.mock.calls[0][0]).toHaveLength(10);
      expect(q.stats().written).toBe(10);
    });
  });

  // ── no flush when empty ─────────────────────────────────────────────────

  describe('empty flush', () => {
    it('does nothing when flushed with no entries', async () => {
      const writer = vi.fn().mockResolvedValue(0);
      const q = makeQueue(writer);
      await q.flush();
      expect(writer).not.toHaveBeenCalled();
    });
  });

  // ── bounded queue & drop behavior ───────────────────────────────────────

  describe('bounded queue', () => {
    it('drops new entries when full and increments droppedCount', () => {
      const neverResolve = () => new Promise<number>(() => {}); // writer hangs
      const q = makeQueue(neverResolve, { maxEntries: 50, batchSize: 100 });

      for (let i = 0; i < 100; i++) q.enqueue(makeEntry());

      expect(q.depth).toBe(50);
      expect(q.stats().dropped).toBe(50);
      expect(q.stats().enqueued).toBe(50);
    });

    it('memory stays bounded even with 100k entries and a hanging writer', () => {
      const neverResolve = () => new Promise<number>(() => {});
      const cap = 500;
      const q = makeQueue(neverResolve, { maxEntries: cap, batchSize: cap + 1 });

      for (let i = 0; i < 100_000; i++) q.enqueue(makeEntry());

      expect(q.depth).toBeLessThanOrEqual(cap);
      expect(q.stats().dropped).toBe(100_000 - cap);
    });
  });

  // ── writer failure & retry ──────────────────────────────────────────────

  describe('writer failure', () => {
    it('retries with backoff then drops the batch with correct counters', async () => {
      const writer = vi.fn().mockRejectedValue(new Error('DB down'));
      const q = makeQueue(writer, { batchSize: 5, maxRetries: 2 });

      for (let i = 0; i < 5; i++) q.enqueue(makeEntry());
      await new Promise((r) => setTimeout(r, 3000)); // let retries finish

      // 1 initial + 2 retries = 3 calls
      expect(writer).toHaveBeenCalledTimes(3);
      expect(q.stats().failedBatches).toBe(1);
      expect(q.stats().dropped).toBe(5);
      expect(q.stats().written).toBe(0);
    }, 10_000);

    it('does not leak unhandled rejections', async () => {
      const writer = vi.fn().mockRejectedValue(new Error('boom'));
      const q = makeQueue(writer, { batchSize: 5, maxRetries: 0 });

      for (let i = 0; i < 5; i++) q.enqueue(makeEntry());
      await new Promise((r) => setTimeout(r, 500));

      // If we get here without an unhandled rejection, the test passes
      expect(q.stats().failedBatches).toBe(1);
    });
  });

  // ── circuit breaker ─────────────────────────────────────────────────────

  describe('circuit breaker', () => {
    it('opens after threshold failures, pauses, then probes on cooldown', async () => {
      let callCount = 0;
      const writer: BatchWriter = async (batch) => {
        callCount++;
        if (callCount <= 3) throw new Error('DB down');
        return batch.length; // success on 4th call (probe)
      };

      const q = makeQueue(writer, {
        batchSize: 2,
        maxRetries: 0,
        breakerThreshold: 3,
        breakerCooldownMs: 200,
      });

      // 3 flushes that all fail → breaker opens
      for (let i = 0; i < 6; i++) q.enqueue(makeEntry());
      await new Promise((r) => setTimeout(r, 500));
      expect(q.stats().breakerOpen).toBe(true);
      expect(q.stats().failedBatches).toBe(3);

      // Enqueue more while breaker is open — they should queue up
      q.enqueue(makeEntry());
      q.enqueue(makeEntry());

      // Wait for cooldown
      await new Promise((r) => setTimeout(r, 300));

      // Manually flush — should probe and succeed
      await q.flush();
      expect(q.stats().breakerOpen).toBe(false);
    }, 10_000);
  });

  // ── single flush at a time ──────────────────────────────────────────────

  describe('flush mutex', () => {
    it('concurrent flush calls do not overlap', async () => {
      let concurrentCount = 0;
      let maxConcurrent = 0;

      const writer: BatchWriter = async (batch) => {
        concurrentCount++;
        maxConcurrent = Math.max(maxConcurrent, concurrentCount);
        await new Promise((r) => setTimeout(r, 100));
        concurrentCount--;
        return batch.length;
      };

      const q = makeQueue(writer, { batchSize: 1000 });
      for (let i = 0; i < 20; i++) q.enqueue(makeEntry());

      // Fire multiple flushes concurrently
      await Promise.all([q.flush(), q.flush(), q.flush()]);

      expect(maxConcurrent).toBe(1);
    });
  });

  // ── shutdown timeout ────────────────────────────────────────────────────

  describe('shutdown', () => {
    it('completes within the timeout even if the writer hangs', async () => {
      const writer = () => new Promise<number>(() => {}); // never resolves
      const q = makeQueue(writer, { maxEntries: 100, batchSize: 100, shutdownFlushMs: 200 });

      for (let i = 0; i < 5; i++) q.enqueue(makeEntry());

      const start = Date.now();
      await q.shutdown(200);
      const elapsed = Date.now() - start;

      expect(elapsed).toBeLessThan(1000); // bounded by timeout
    });
  });

  // ── success sampling ────────────────────────────────────────────────────

  describe('sampling', () => {
    it('always keeps errors (4xx/5xx) regardless of sample rate', () => {
      const writer = vi.fn().mockResolvedValue(0);
      const q = makeQueue(writer, { successSampleRate: 0, batchSize: 1000 });

      // 5xx always kept
      q.enqueue(makeEntry({ statusCode: 500 }));
      q.enqueue(makeEntry({ statusCode: 502 }));
      // 4xx always kept
      q.enqueue(makeEntry({ statusCode: 404 }));
      q.enqueue(makeEntry({ statusCode: 429 }));
      // 2xx sampled out at rate=0
      q.enqueue(makeEntry({ statusCode: 200 }));
      q.enqueue(makeEntry({ statusCode: 201 }));
      q.enqueue(makeEntry({ statusCode: 301 }));

      expect(q.depth).toBe(4); // only 4xx/5xx
      expect(q.stats().enqueued).toBe(4);
    });

    it('keeps all entries when sample rate is 1', () => {
      const writer = vi.fn().mockResolvedValue(0);
      const q = makeQueue(writer, { successSampleRate: 1, batchSize: 1000 });

      for (let i = 0; i < 10; i++) q.enqueue(makeEntry({ statusCode: 200 }));
      expect(q.depth).toBe(10);
    });
  });

  // ── field truncation ────────────────────────────────────────────────────

  describe('field truncation', () => {
    it('truncates route and errorMessage to sane lengths', async () => {
      const batches: LogEntry[][] = [];
      const writer: BatchWriter = async (batch) => {
        batches.push([...batch]);
        return batch.length;
      };

      const q = makeQueue(writer, { batchSize: 1 });
      q.enqueue(
        makeEntry({
          route: 'x'.repeat(5000),
          errorMessage: 'e'.repeat(2000),
          backendUrl: 'u'.repeat(5000),
        })
      );

      await new Promise((r) => setTimeout(r, 50));

      expect(batches.length).toBe(1);
      const entry = batches[0][0];
      expect(entry.route.length).toBeLessThanOrEqual(2048);
      expect(entry.errorMessage!.length).toBeLessThanOrEqual(512);
      expect(entry.backendUrl!.length).toBeLessThanOrEqual(2048);
    });

    it('does not store headers, cookies, bodies, or tokens', async () => {
      const batches: LogEntry[][] = [];
      const writer: BatchWriter = async (batch) => {
        batches.push([...batch]);
        return batch.length;
      };

      const q = makeQueue(writer, { batchSize: 1 });
      const entry = makeEntry();
      q.enqueue(entry);
      await new Promise((r) => setTimeout(r, 50));

      const stored = batches[0][0];
      const keys = Object.keys(stored);

      // Verify only expected fields are stored
      const allowed = new Set([
        'projectId',
        'requestId',
        'method',
        'route',
        'backendId',
        'backendUrl',
        'statusCode',
        'responseTimeMs',
        'retryCount',
        'errorMessage',
      ]);

      for (const key of keys) {
        expect(allowed.has(key)).toBe(true);
      }

      // No body, header, cookie, token fields
      expect(keys).not.toContain('body');
      expect(keys).not.toContain('headers');
      expect(keys).not.toContain('cookies');
      expect(keys).not.toContain('token');
      expect(keys).not.toContain('authorization');
    });
  });

  // ── config validation ───────────────────────────────────────────────────

  describe('config validation', () => {
    it('rejects batchSize > maxEntries', () => {
      _resetLogQueueConfig();
      process.env.LOG_QUEUE_MAX_ENTRIES = '10';
      process.env.LOG_BATCH_SIZE = '100';
      expect(() => {
        const writer = vi.fn().mockResolvedValue(0);
        // Force re-parse by resetting cache
        _resetLogQueueConfig();
        new LogQueue(writer);
      }).toThrow('LOG_BATCH_SIZE must be <= LOG_QUEUE_MAX_ENTRIES');
      delete process.env.LOG_QUEUE_MAX_ENTRIES;
      delete process.env.LOG_BATCH_SIZE;
      _resetLogQueueConfig();
    });

    it('rejects negative sample rate', () => {
      _resetLogQueueConfig();
      process.env.LOG_SUCCESS_SAMPLE_RATE = '-0.5';
      expect(() => {
        _resetLogQueueConfig();
        const writer = vi.fn().mockResolvedValue(0);
        new LogQueue(writer);
      }).toThrow();
      delete process.env.LOG_SUCCESS_SAMPLE_RATE;
      _resetLogQueueConfig();
    });

    it('rejects sample rate > 1', () => {
      _resetLogQueueConfig();
      process.env.LOG_SUCCESS_SAMPLE_RATE = '1.5';
      expect(() => {
        _resetLogQueueConfig();
        const writer = vi.fn().mockResolvedValue(0);
        new LogQueue(writer);
      }).toThrow();
      delete process.env.LOG_SUCCESS_SAMPLE_RATE;
      _resetLogQueueConfig();
    });
  });

  // ── stats ───────────────────────────────────────────────────────────────

  describe('stats', () => {
    it('returns all expected counter fields', () => {
      const writer = vi.fn().mockResolvedValue(0);
      const q = makeQueue(writer);
      const s = q.stats();

      expect(s).toEqual({
        enqueued: 0,
        written: 0,
        dropped: 0,
        failedBatches: 0,
        queueDepth: 0,
        lastFlushAt: null,
        lastFlushDurationMs: null,
        breakerOpen: false,
      });
    });
  });
});
