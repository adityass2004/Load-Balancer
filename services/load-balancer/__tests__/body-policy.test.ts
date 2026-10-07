import { describe, it, expect, beforeEach } from 'vitest';
import { Readable } from 'stream';
import {
  parseContentLength,
  BufferBudget,
  CountingTransform,
  BodyTooLargeError,
  decideBodyMode,
} from '../body-policy';

describe('CRITICAL-04 Body Policy Unit Tests', () => {
  describe('Content-Length parsing', () => {
    it('handles null, undefined and empty strings', () => {
      expect(parseContentLength(null)).toEqual({ valid: true, contentLength: null });
      expect(parseContentLength(undefined)).toEqual({ valid: true, contentLength: null });
      expect(parseContentLength('')).toEqual({ valid: true, contentLength: null });
      expect(parseContentLength('   ')).toEqual({ valid: true, contentLength: null });
    });

    it('parses valid positive integers', () => {
      expect(parseContentLength('0')).toEqual({ valid: true, contentLength: 0 });
      expect(parseContentLength('1024')).toEqual({ valid: true, contentLength: 1024 });
      expect(parseContentLength(' 5000 ')).toEqual({ valid: true, contentLength: 5000 });
    });

    it('rejects negative, non-numeric, and decimal values', () => {
      expect(parseContentLength('-1')).toEqual({ valid: false, contentLength: null });
      expect(parseContentLength('abc')).toEqual({ valid: false, contentLength: null });
      expect(parseContentLength('12.34')).toEqual({ valid: false, contentLength: null });
      expect(parseContentLength('1e5')).toEqual({ valid: false, contentLength: null });
      expect(parseContentLength('0x10')).toEqual({ valid: false, contentLength: null });
    });

    it('handles duplicate headers: identical passes, conflicting fails', () => {
      expect(parseContentLength('100, 100')).toEqual({ valid: true, contentLength: 100 });
      expect(parseContentLength('100, 200')).toEqual({ valid: false, contentLength: null });
      expect(parseContentLength('100, abc')).toEqual({ valid: false, contentLength: null });
    });
  });

  describe('CountingTransform', () => {
    it('passes exactly MAX bytes through without error', async () => {
      const maxBytes = 100;
      const transform = new CountingTransform(maxBytes);
      const input = Readable.from([Buffer.alloc(50, 'a'), Buffer.alloc(50, 'b')]);

      const chunks: Buffer[] = [];
      await new Promise<void>((resolve, reject) => {
        input
          .pipe(transform)
          .on('data', (c) => chunks.push(c))
          .on('end', () => resolve())
          .on('error', reject);
      });

      expect(Buffer.concat(chunks).length).toBe(100);
      expect(transform.getBytesRead()).toBe(100);
    });

    it('fails with BodyTooLargeError when MAX+1 bytes are sent', async () => {
      const maxBytes = 100;
      const transform = new CountingTransform(maxBytes);
      const input = Readable.from([Buffer.alloc(50, 'a'), Buffer.alloc(51, 'b')]);

      let caughtError: any = null;
      await new Promise<void>((resolve) => {
        input
          .pipe(transform)
          .on('data', () => {})
          .on('end', () => resolve())
          .on('error', (err) => {
            caughtError = err;
            resolve();
          });
      });

      expect(caughtError).toBeInstanceOf(BodyTooLargeError);
      expect(caughtError.name).toBe('BodyTooLargeError');
      expect(caughtError.maxBytes).toBe(100);
      expect(caughtError.bytesRead).toBe(101);
    });

    it('enforces limit across arbitrary chunk boundaries', async () => {
      const maxBytes = 10;
      const transform = new CountingTransform(maxBytes);
      // 6 chunks of 2 bytes = 12 bytes
      const input = Readable.from([
        Buffer.from('12'),
        Buffer.from('34'),
        Buffer.from('56'),
        Buffer.from('78'),
        Buffer.from('90'),
        Buffer.from('xx'), // exceeds
      ]);

      let caughtError: any = null;
      await new Promise<void>((resolve) => {
        input
          .pipe(transform)
          .on('data', () => {})
          .on('end', () => resolve())
          .on('error', (err) => {
            caughtError = err;
            resolve();
          });
      });

      expect(caughtError).toBeInstanceOf(BodyTooLargeError);
      expect(caughtError.bytesRead).toBe(12);
    });
  });

  describe('BufferBudget', () => {
    let budget: BufferBudget;

    beforeEach(() => {
      budget = new BufferBudget(1000);
    });

    it('acquires and releases budget correctly', () => {
      expect(budget.tryAcquire(400)).toBe(true);
      expect(budget.getCurrentBytes()).toBe(400);

      expect(budget.tryAcquire(500)).toBe(true);
      expect(budget.getCurrentBytes()).toBe(900);

      // 900 + 200 > 1000 -> rejected
      expect(budget.tryAcquire(200)).toBe(false);
      expect(budget.getCurrentBytes()).toBe(900);

      budget.release(400);
      expect(budget.getCurrentBytes()).toBe(500);

      // Now 500 + 200 <= 1000 -> succeeds
      expect(budget.tryAcquire(200)).toBe(true);
      expect(budget.getCurrentBytes()).toBe(700);
    });

    it('never goes negative on over-release', () => {
      budget.tryAcquire(100);
      budget.release(200);
      expect(budget.getCurrentBytes()).toBe(0);
    });
  });

  describe('Body-mode Policy decision', () => {
    const config = {
      maxBytes: 10_000,
      thresholdBytes: 1000,
      budgetBytes: 5000,
    };
    let budget: BufferBudget;

    beforeEach(() => {
      budget = new BufferBudget(config.budgetBytes);
    });

    const createWebStream = (content: string) => {
      const encoder = new TextEncoder();
      const u8 = encoder.encode(content);
      return new ReadableStream<Uint8Array>({
        start(controller) {
          controller.enqueue(u8);
          controller.close();
        },
      });
    };

    it('returns "none" for GET and HEAD or null body', async () => {
      const modeGet = await decideBodyMode('GET', null, null, config, budget);
      expect(modeGet.kind).toBe('none');

      const modeHead = await decideBodyMode('HEAD', 100, createWebStream('test'), config, budget);
      expect(modeHead.kind).toBe('none');

      const modeZeroCl = await decideBodyMode('POST', 0, createWebStream(''), config, budget);
      expect(modeZeroCl.kind).toBe('none');
    });

    it('POST and PATCH always stream, never buffer', async () => {
      const stream = createWebStream('hello');
      const modePost = await decideBodyMode('POST', 5, stream, config, budget);
      expect(modePost.kind).toBe('stream');
      expect(budget.getCurrentBytes()).toBe(0); // No budget acquired

      const stream2 = createWebStream('hello');
      const modePatch = await decideBodyMode('PATCH', 5, stream2, config, budget);
      expect(modePatch.kind).toBe('stream');
      expect(budget.getCurrentBytes()).toBe(0);
    });

    it('idempotent method <= threshold with budget -> buffers and releases budget cleanly', async () => {
      const stream = createWebStream('data-to-put');
      const modePut = await decideBodyMode('PUT', 11, stream, config, budget);
      expect(modePut.kind).toBe('buffer');
      if (modePut.kind === 'buffer') {
        expect(modePut.data.toString()).toBe('data-to-put');
        expect(budget.getCurrentBytes()).toBe(11); // Budget held

        modePut.releaseBudget();
        expect(budget.getCurrentBytes()).toBe(0); // Released cleanly

        // Multiple calls to releaseBudget are idempotent
        modePut.releaseBudget();
        expect(budget.getCurrentBytes()).toBe(0);
      }
    });

    it('idempotent method > threshold -> streams', async () => {
      const stream = createWebStream('large-data');
      const modePut = await decideBodyMode('PUT', 2000, stream, config, budget); // 2000 > 1000 threshold
      expect(modePut.kind).toBe('stream');
      expect(budget.getCurrentBytes()).toBe(0);
    });

    it('idempotent method with unknown length -> streams', async () => {
      const stream = createWebStream('chunked');
      const modePut = await decideBodyMode('PUT', null, stream, config, budget);
      expect(modePut.kind).toBe('stream');
      expect(budget.getCurrentBytes()).toBe(0);
    });

    it('idempotent method when budget exhausted -> falls back to streaming', async () => {
      // Consume budget
      budget.tryAcquire(5000);
      expect(budget.getCurrentBytes()).toBe(5000);

      const stream = createWebStream('data');
      const modePut = await decideBodyMode('PUT', 4, stream, config, budget);
      expect(modePut.kind).toBe('stream'); // Streams when budget full!
    });
  });
});
