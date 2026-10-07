/**
 * LogQueue – bounded, non-blocking, batched request-log writer.
 *
 * Design invariants:
 *   1. enqueue() is synchronous, O(1), never throws, never awaits.
 *   2. Memory is bounded: when the queue reaches maxEntries, new entries
 *      are dropped silently (counted in `droppedCount`).
 *   3. Flushes are batched via createMany. Only one flush runs at a time.
 *   4. A circuit breaker pauses DB writes after consecutive failures.
 *   5. The queue is a globalThis singleton to survive Next.js hot-reload.
 */

import type { HttpMethod } from '@/types/domain';
import { parseLogQueueConfig, type LogQueueConfig } from './log-queue-config';

// ─── Types ──────────────────────────────────────────────────────────────────

export interface LogEntry {
  projectId?: string | null;
  requestId: string;
  method: HttpMethod;
  route: string;
  backendId?: string | null;
  backendUrl?: string | null;
  statusCode?: number | null;
  responseTimeMs?: number | null;
  retryCount?: number;
  errorMessage?: string | null;
}

export interface LogQueueStats {
  enqueued: number;
  written: number;
  dropped: number;
  failedBatches: number;
  queueDepth: number;
  lastFlushAt: number | null;
  lastFlushDurationMs: number | null;
  breakerOpen: boolean;
}

/** Injectable writer — receives a batch and returns the count written. */
export type BatchWriter = (batch: LogEntry[]) => Promise<number>;

// ─── Field Truncation ───────────────────────────────────────────────────────

const MAX_ROUTE_LEN = 2048;
const MAX_ERROR_LEN = 512;
const MAX_URL_LEN = 2048;

function truncate(s: string | null | undefined, max: number): string | null {
  if (s == null) return null;
  return s.length > max ? s.slice(0, max) : s;
}

function sanitizeEntry(e: LogEntry): LogEntry {
  return {
    projectId: e.projectId ?? null,
    requestId: e.requestId,
    method: e.method,
    route: truncate(e.route, MAX_ROUTE_LEN) ?? '',
    backendId: e.backendId ?? null,
    backendUrl: truncate(e.backendUrl, MAX_URL_LEN),
    statusCode: e.statusCode ?? null,
    responseTimeMs: e.responseTimeMs ?? null,
    retryCount: e.retryCount ?? 0,
    errorMessage: truncate(e.errorMessage, MAX_ERROR_LEN),
  };
}

// ─── LogQueue ───────────────────────────────────────────────────────────────

export class LogQueue {
  private readonly buffer: LogEntry[] = [];
  private readonly config: LogQueueConfig;
  private readonly writer: BatchWriter;

  // Counters
  private _enqueued = 0;
  private _written = 0;
  private _dropped = 0;
  private _failedBatches = 0;
  private _lastFlushAt: number | null = null;
  private _lastFlushDurationMs: number | null = null;

  // Flush mutex
  private _flushing = false;

  // Circuit breaker
  private _consecutiveFailures = 0;
  private _breakerOpen = false;
  private _breakerOpenedAt = 0;

  // Interval timer
  private _intervalHandle: ReturnType<typeof setInterval> | null = null;

  // Drop-warning throttle
  private _lastDropWarnAt = 0;

  // Shutdown flag
  private _stopped = false;

  constructor(writer: BatchWriter, configOverride?: Partial<LogQueueConfig>) {
    const parsed = parseLogQueueConfig();
    this.config = { ...parsed, ...configOverride };
    this.writer = writer;
  }

  // ── Public API ──────────────────────────────────────────────────────────

  /**
   * Start the interval-based flush timer. Call once at process start.
   * The timer is unref'd so it never keeps the process alive.
   */
  start(): void {
    if (this._intervalHandle) return; // idempotent
    this._intervalHandle = setInterval(() => {
      this._flushInternal().catch(() => {});
    }, this.config.flushIntervalMs);

    // Unref so the timer doesn't keep the event loop alive on shutdown
    if (typeof this._intervalHandle === 'object' && 'unref' in this._intervalHandle) {
      this._intervalHandle.unref();
    }
  }

  /**
   * Enqueue a log entry. Synchronous, O(1), never throws, never awaits.
   * Applies success sampling: if the entry is a 2xx/3xx success, it may be
   * randomly skipped per LOG_SUCCESS_SAMPLE_RATE.
   */
  enqueue(entry: LogEntry): void {
    if (this._stopped) return;

    // Success sampling (errors, 4xx, 5xx are always kept)
    const status = entry.statusCode ?? 0;
    const isSuccess = status >= 200 && status < 400;
    if (isSuccess && this.config.successSampleRate < 1) {
      if (Math.random() >= this.config.successSampleRate) {
        return; // sampled out
      }
    }

    // Bounded queue
    if (this.buffer.length >= this.config.maxEntries) {
      this._dropped++;
      const now = Date.now();
      if (now - this._lastDropWarnAt > 10_000) {
        this._lastDropWarnAt = now;
        console.warn(
          `[LOG_QUEUE] log queue full (${this.config.maxEntries} entries), dropping entries. ` +
            `Total dropped: ${this._dropped}`
        );
      }
      return;
    }

    this.buffer.push(sanitizeEntry(entry));
    this._enqueued++;

    // Trigger flush when batch size is reached
    if (this.buffer.length >= this.config.batchSize) {
      this._flushInternal().catch(() => {});
    }
  }

  /**
   * Explicit flush — returns when all currently queued entries have been
   * written (or dropped after retries). Used for graceful shutdown.
   */
  async flush(): Promise<void> {
    // Keep flushing until the buffer is empty or circuit breaker prevents progress
    let prevLength = -1;
    while (this.buffer.length > 0 && this.buffer.length !== prevLength) {
      if (this._breakerOpen) {
        const elapsed = Date.now() - this._breakerOpenedAt;
        if (elapsed < this.config.breakerCooldownMs) {
          break; // Breaker is cooling down, stop spinning
        }
      }
      prevLength = this.buffer.length;
      await this._flushInternal(true);
    }
  }

  /**
   * Graceful shutdown: flush remaining entries within the timeout, then stop.
   */
  async shutdown(timeoutMs?: number): Promise<void> {
    const limit = timeoutMs ?? this.config.shutdownFlushMs;
    this._stopped = true;

    if (this._intervalHandle) {
      clearInterval(this._intervalHandle);
      this._intervalHandle = null;
    }

    if (this.buffer.length === 0) return;

    // Race: flush vs timeout
    await Promise.race([
      this.flush(),
      new Promise<void>((resolve) => setTimeout(resolve, limit)),
    ]);
  }

  /** Get queue statistics. */
  stats(): LogQueueStats {
    return {
      enqueued: this._enqueued,
      written: this._written,
      dropped: this._dropped,
      failedBatches: this._failedBatches,
      queueDepth: this.buffer.length,
      lastFlushAt: this._lastFlushAt,
      lastFlushDurationMs: this._lastFlushDurationMs,
      breakerOpen: this._breakerOpen,
    };
  }

  /** Depth of the queue (for testing). */
  get depth(): number {
    return this.buffer.length;
  }

  // ── Internal ────────────────────────────────────────────────────────────

  private async _flushInternal(drainPartial = false): Promise<void> {
    // Mutex: only one flush at a time
    if (this._flushing) return;
    if (this.buffer.length === 0) return;

    this._flushing = true;
    try {
      while (
        this.buffer.length > 0 &&
        (drainPartial || this.buffer.length >= this.config.batchSize || this._breakerOpen)
      ) {
        // Circuit breaker check
        if (this._breakerOpen) {
          const elapsed = Date.now() - this._breakerOpenedAt;
          if (elapsed < this.config.breakerCooldownMs) {
            break; // still cooling down
          }
          // Probe: try one batch to see if DB is back
        }

        const flushStart = Date.now();

        // Drain up to batchSize entries
        const batch = this.buffer.splice(0, this.config.batchSize);
        if (batch.length === 0) break;

        let success = false;
        let lastError: unknown;

        for (let attempt = 0; attempt <= this.config.maxRetries; attempt++) {
          try {
            // Timeout wrapper
            const written = await this._withTimeout(
              this.writer(batch),
              this.config.flushTimeoutMs
            );
            this._written += written;
            success = true;
            this._consecutiveFailures = 0;
            if (this._breakerOpen) {
              this._breakerOpen = false;
              console.info('[LOG_QUEUE] circuit breaker closed — DB writes resumed');
            }
            break;
          } catch (err) {
            lastError = err;
            if (attempt < this.config.maxRetries) {
              // Exponential backoff with jitter (capped at 5s)
              const baseMs = Math.min(100 * Math.pow(2, attempt), 5_000);
              const jitter = Math.random() * baseMs * 0.5;
              await new Promise<void>((r) => setTimeout(r, baseMs + jitter));
            }
          }
        }

        if (!success) {
          // All retries exhausted — drop this batch
          this._failedBatches++;
          this._dropped += batch.length;
          this._consecutiveFailures++;

          const errMsg = lastError instanceof Error ? lastError.message : String(lastError);
          console.error(
            `[LOG_QUEUE] batch of ${batch.length} entries dropped after ${this.config.maxRetries + 1} attempts: ${errMsg}. ` +
              `Total failedBatches: ${this._failedBatches}, dropped: ${this._dropped}`
          );

          // Circuit breaker
          if (this._consecutiveFailures >= this.config.breakerThreshold && !this._breakerOpen) {
            this._breakerOpen = true;
            this._breakerOpenedAt = Date.now();
            console.warn(
              `[LOG_QUEUE] circuit breaker OPEN after ${this._consecutiveFailures} consecutive failures. ` +
                `Pausing DB writes for ${this.config.breakerCooldownMs}ms`
            );
            break; // Stop attempting remaining batches immediately when breaker opens
          }
        }

        this._lastFlushAt = Date.now();
        this._lastFlushDurationMs = Date.now() - flushStart;
      }
    } finally {
      this._flushing = false;
    }
  }

  private _withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('Flush timeout')), ms);
      promise.then(
        (val) => {
          clearTimeout(timer);
          resolve(val);
        },
        (err) => {
          clearTimeout(timer);
          reject(err);
        }
      );
    });
  }
}

// ─── Singleton ──────────────────────────────────────────────────────────────

const GLOBAL_KEY = '__trackit_log_queue__';

const globalForQueue = globalThis as unknown as {
  [GLOBAL_KEY]?: LogQueue;
};

/**
 * Get or create the singleton LogQueue instance.
 * The writer is lazily bound to Prisma to avoid importing the DB module
 * at the top level (which pulls in server-only packages).
 */
export function getLogQueue(): LogQueue {
  if (globalForQueue[GLOBAL_KEY]) {
    return globalForQueue[GLOBAL_KEY]!;
  }

  const writer: BatchWriter = async (batch) => {
    // Lazy import to keep this module testable without a real DB
    const { db } = await import('@/lib/db');
    const result = await db.requestLog.createMany({ data: batch });
    return result.count;
  };

  const queue = new LogQueue(writer);
  queue.start();
  globalForQueue[GLOBAL_KEY] = queue;
  return queue;
}

/**
 * Replace the global queue instance (testing only).
 */
export function _setLogQueue(queue: LogQueue): void {
  globalForQueue[GLOBAL_KEY] = queue;
}
