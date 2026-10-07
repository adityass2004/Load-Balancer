import { Readable, Transform, type TransformCallback } from 'stream';
import { isIdempotentMethod } from './retry-policy';
import { type BodyConfig, bodyConfig } from './body-config';

export class BodyTooLargeError extends Error {
  readonly maxBytes: number;
  readonly bytesRead: number;

  constructor(maxBytes: number, bytesRead: number) {
    super(`Request body exceeded maximum allowed size of ${maxBytes} bytes`);
    this.name = 'BodyTooLargeError';
    this.maxBytes = maxBytes;
    this.bytesRead = bytesRead;
  }
}

/**
 * Validates and parses the Content-Length header.
 *
 * Rules:
 * - Missing or empty: valid, null length.
 * - Must be plain non-negative integer.
 * - If comma-separated (proxies appending), all values must be identical integers.
 * - Negative, non-numeric, or conflicting -> invalid (400).
 */
export function parseContentLength(headerValue: string | null | undefined): {
  valid: boolean;
  contentLength: number | null;
} {
  if (headerValue === null || headerValue === undefined) {
    return { valid: true, contentLength: null };
  }

  const trimmed = headerValue.trim();
  if (trimmed === '') {
    return { valid: true, contentLength: null };
  }

  // Handle comma-separated lists e.g. "123, 123"
  if (trimmed.includes(',')) {
    const parts = trimmed.split(',').map((p) => p.trim());
    const first = parts[0];
    if (!/^\d+$/.test(first)) {
      return { valid: false, contentLength: null };
    }
    for (let i = 1; i < parts.length; i++) {
      if (parts[i] !== first) {
        // Conflicting duplicate headers
        return { valid: false, contentLength: null };
      }
    }
    const val = Number(first);
    if (!Number.isSafeInteger(val) || val < 0) {
      return { valid: false, contentLength: null };
    }
    return { valid: true, contentLength: val };
  }

  if (!/^\d+$/.test(trimmed)) {
    return { valid: false, contentLength: null };
  }

  const val = Number(trimmed);
  if (!Number.isSafeInteger(val) || val < 0) {
    return { valid: false, contentLength: null };
  }

  return { valid: true, contentLength: val };
}

/**
 * Global buffer budget tracker to prevent concurrent memory exhaustion from replayable buffers.
 */
export class BufferBudget {
  private currentBytes = 0;

  constructor(private readonly maxBudget: number) {}

  tryAcquire(bytes: number): boolean {
    if (bytes <= 0) return true;
    if (this.currentBytes + bytes > this.maxBudget) {
      return false;
    }
    this.currentBytes += bytes;
    return true;
  }

  release(bytes: number): void {
    if (bytes <= 0) return;
    this.currentBytes = Math.max(0, this.currentBytes - bytes);
  }

  getCurrentBytes(): number {
    return this.currentBytes;
  }

  getMaxBudget(): number {
    return this.maxBudget;
  }

  reset(): void {
    this.currentBytes = 0;
  }
}

export const globalBufferBudget = new BufferBudget(bodyConfig.budgetBytes);

/**
 * Byte-counting Transform stream enforcing MAX_REQUEST_BODY_BYTES on the fly.
 * Respects backpressure without accumulating chunks in memory.
 */
export class CountingTransform extends Transform {
  private bytesRead = 0;

  constructor(private readonly maxBytes: number) {
    super();
  }

  _transform(chunk: any, encoding: BufferEncoding, callback: TransformCallback): void {
    const len = Buffer.isBuffer(chunk) ? chunk.length : Buffer.byteLength(chunk, encoding);
    this.bytesRead += len;
    if (this.bytesRead > this.maxBytes) {
      callback(new BodyTooLargeError(this.maxBytes, this.bytesRead));
      return;
    }
    callback(null, chunk);
  }

  getBytesRead(): number {
    return this.bytesRead;
  }
}

/**
 * Reads a web ReadableStream up to maxBytes. Throws BodyTooLargeError if exceeded.
 */
export async function readBoundedBody(
  webStream: ReadableStream<Uint8Array>,
  maxBytes: number
): Promise<Buffer> {
  const reader = webStream.getReader();
  const chunks: Buffer[] = [];
  let totalBytes = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value) {
        totalBytes += value.byteLength;
        if (totalBytes > maxBytes) {
          throw new BodyTooLargeError(maxBytes, totalBytes);
        }
        chunks.push(Buffer.from(value.buffer, value.byteOffset, value.byteLength));
      }
    }
    return Buffer.concat(chunks);
  } finally {
    reader.releaseLock();
  }
}

export type RequestPayload =
  | { kind: 'none' }
  | { kind: 'buffer'; data: Buffer; releaseBudget: () => void }
  | { kind: 'stream'; stream: Readable; contentLength?: number };

/**
 * Determines whether a request body should be ignored, buffered in memory (replayable),
 * or streamed directly to the upstream.
 */
export async function decideBodyMode(
  method: string,
  contentLength: number | null,
  webBody: ReadableStream<Uint8Array> | null,
  config: BodyConfig = bodyConfig,
  budget: BufferBudget = globalBufferBudget,
  signal?: AbortSignal
): Promise<RequestPayload> {
  const normalizedMethod = method.trim().toUpperCase();

  // GET and HEAD have no body
  if (normalizedMethod === 'GET' || normalizedMethod === 'HEAD' || !webBody || contentLength === 0) {
    return { kind: 'none' };
  }

  const isIdempotent = isIdempotentMethod(normalizedMethod);

  // BUFFERED mode only if:
  // 1. Method is idempotent (PUT, DELETE, etc.)
  // 2. Content-Length is known and <= thresholdBytes
  // 3. Global budget has room
  if (
    isIdempotent &&
    contentLength !== null &&
    contentLength <= config.thresholdBytes &&
    budget.tryAcquire(contentLength)
  ) {
    let released = false;
    const releaseBudget = () => {
      if (!released) {
        released = true;
        budget.release(contentLength);
      }
    };

    try {
      const data = await readBoundedBody(webBody, config.thresholdBytes);
      return { kind: 'buffer', data, releaseBudget };
    } catch (err) {
      releaseBudget();
      throw err;
    }
  }

  // STREAMED mode for all POST/PATCH, unknown Content-Length, large bodies, or budget exhausted
  const nodeReadable = Readable.fromWeb(webBody as any);
  const countingTransform = new CountingTransform(config.maxBytes);

  nodeReadable.on('error', (err) => {
    countingTransform.destroy(err);
  });

  if (signal) {
    if (signal.aborted) {
      countingTransform.destroy(new Error('Client aborted'));
    } else {
      signal.addEventListener('abort', () => {
        countingTransform.destroy(new Error('Client aborted'));
      });
    }
  }

  const stream = nodeReadable.pipe(countingTransform);

  return {
    kind: 'stream',
    stream,
    contentLength: contentLength ?? undefined,
  };
}

/**
 * Checks whether an error is caused by a client-side abort or disconnect.
 */
export function isClientAbort(error: any, signal?: AbortSignal): boolean {
  if (signal?.aborted) return true;
  if (error?.name === 'AbortError' || error?.name === 'CanceledError') return true;
  if (error?.code === 'ERR_STREAM_PREMATURE_CLOSE' || error?.code === 'ECONNRESET') return true;
  const msg = String(error?.message || '').toLowerCase();
  if (msg.includes('premature close') || msg.includes('aborted') || msg.includes('client abort')) {
    return true;
  }
  return false;
}
