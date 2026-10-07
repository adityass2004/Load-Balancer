import { z } from 'zod';

const positiveInt = (defaultVal: number) =>
  z
    .string()
    .optional()
    .transform((val) => (val === undefined || val === '' ? defaultVal : Number(val)))
    .pipe(z.number().int().positive());

const fraction = (defaultVal: number) =>
  z
    .string()
    .optional()
    .transform((val) => (val === undefined || val === '' ? defaultVal : Number(val)))
    .pipe(z.number().min(0).max(1));

const LogQueueConfigSchema = z
  .object({
    maxEntries: positiveInt(10_000),
    batchSize: positiveInt(200),
    flushIntervalMs: positiveInt(1_000),
    flushTimeoutMs: positiveInt(5_000),
    shutdownFlushMs: positiveInt(5_000),
    maxRetries: positiveInt(3),
    successSampleRate: fraction(1),
    breakerThreshold: positiveInt(5),
    breakerCooldownMs: positiveInt(30_000),
  })
  .refine((c) => c.batchSize <= c.maxEntries, {
    message: 'LOG_BATCH_SIZE must be <= LOG_QUEUE_MAX_ENTRIES',
    path: ['batchSize'],
  });

export type LogQueueConfig = z.infer<typeof LogQueueConfigSchema>;

let _cached: LogQueueConfig | undefined;

export function parseLogQueueConfig(): LogQueueConfig {
  if (_cached) return _cached;

  const result = LogQueueConfigSchema.safeParse({
    maxEntries: process.env.LOG_QUEUE_MAX_ENTRIES,
    batchSize: process.env.LOG_BATCH_SIZE,
    flushIntervalMs: process.env.LOG_FLUSH_INTERVAL_MS,
    flushTimeoutMs: process.env.LOG_FLUSH_TIMEOUT_MS,
    shutdownFlushMs: process.env.LOG_SHUTDOWN_FLUSH_MS,
    maxRetries: process.env.LOG_MAX_RETRIES,
    successSampleRate: process.env.LOG_SUCCESS_SAMPLE_RATE,
    breakerThreshold: process.env.LOG_BREAKER_THRESHOLD,
    breakerCooldownMs: process.env.LOG_BREAKER_COOLDOWN_MS,
  });

  if (!result.success) {
    const formatted = result.error.issues
      .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
      .join(', ');
    throw new Error(`[LOG_QUEUE_CONFIG] Invalid log queue configuration: ${formatted}`);
  }

  _cached = result.data;
  return _cached;
}

/** Reset the cached config (testing only). */
export function _resetLogQueueConfig(): void {
  _cached = undefined;
}
