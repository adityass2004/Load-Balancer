const http = require('http');
const crypto = require('crypto');
const zlib = require('zlib');

const PORT = parseInt(process.env.PORT || '4001', 10);
const SERVER_ID = process.env.SERVER_ID || 'server-1';
const ENABLE_TEST_FAILURES = process.env.ENABLE_TEST_FAILURES === 'true';
const MAX_BODY_BYTES = parseInt(process.env.TEST_BACKEND_MAX_BODY_BYTES || '52428800', 10); // default 50 MB

// Allowed headers for /test/info
const ALLOWED_HEADERS = new Set([
  'x-request-id',
  'host',
  'user-agent',
  'content-type',
  'content-length',
  'x-forwarded-for',
  'x-forwarded-proto',
  'x-forwarded-host',
]);

// Allowed status codes for /test/status/:code
const ALLOWED_STATUS_CODES = new Set([200, 400, 429, 500, 502, 503, 504]);

// Metrics counters
let totalRequests = 0;
let requestsByMethod = {};
let abortedRequests = 0;
let recentBodies = []; // max 10 entries { method, path, bytes, sha256 }

function resetCounters() {
  totalRequests = 0;
  requestsByMethod = {};
  abortedRequests = 0;
  recentBodies = [];
}

function recordMetric(method) {
  totalRequests++;
  const m = method.toUpperCase();
  requestsByMethod[m] = (requestsByMethod[m] || 0) + 1;
}

function recordRecentBody(entry) {
  recentBodies.push(entry);
  if (recentBodies.length > 10) {
    recentBodies.shift();
  }
}

function readBody(req, maxBytes = MAX_BODY_BYTES) {
  return new Promise((resolve, reject) => {
    let bytesRead = 0;
    let limitExceeded = false;
    let finished = false;
    const hash = crypto.createHash('sha256');

    req.on('data', (chunk) => {
      if (limitExceeded) return;
      bytesRead += chunk.length;
      if (bytesRead > maxBytes) {
        limitExceeded = true;
        reject(new Error('PAYLOAD_TOO_LARGE'));
        return;
      }
      hash.update(chunk);
    });

    req.on('end', () => {
      finished = true;
      if (!limitExceeded) {
        resolve({
          bytes: bytesRead,
          sha256: hash.digest('hex'),
        });
      }
    });

    req.on('close', () => {
      if (!finished && !limitExceeded) {
        abortedRequests++;
      }
    });

    req.on('error', (err) => {
      reject(err);
    });
  });
}

const server = http.createServer(async (req, res) => {
  const method = (req.method || 'GET').toUpperCase();
  const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
  const pathname = url.pathname;

  // Request ID resolution: echo if present or generate
  const requestId = (req.headers['x-request-id'] && String(req.headers['x-request-id'])) || crypto.randomUUID();
  res.setHeader('x-request-id', requestId);

  // Counter exclusion check
  const isExcludedFromMetrics =
    pathname === '/health' ||
    pathname === '/api/health' ||
    pathname === '/test/stats' ||
    pathname === '/test/reset';

  if (!isExcludedFromMetrics) {
    recordMetric(method);
  }

  // A7: GET /health or /api/health
  if (pathname === '/health' || pathname === '/api/health') {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ status: 'ok', server: SERVER_ID }));
    return;
  }

  // A6: GET /test/stats
  if (pathname === '/test/stats' && method === 'GET') {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(
      JSON.stringify({
        server: SERVER_ID,
        total: totalRequests,
        byMethod: requestsByMethod,
        aborted: abortedRequests,
        recentBodies,
      })
    );
    return;
  }

  // A6: POST /test/reset
  if (pathname === '/test/reset' && method === 'POST') {
    resetCounters();
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(
      JSON.stringify({
        success: true,
        server: SERVER_ID,
        total: 0,
        byMethod: {},
        aborted: 0,
        recentBodies: [],
      })
    );
    return;
  }

  // Read body and track byte count + sha256 while streaming
  let bodyInfo = null;
  if (method !== 'GET' && method !== 'HEAD') {
    try {
      bodyInfo = await readBody(req);
      if (bodyInfo.bytes > 0) {
        recordRecentBody({
          method,
          path: pathname,
          bytes: bodyInfo.bytes,
          sha256: bodyInfo.sha256,
        });
      }
    } catch (err) {
      if (err.message === 'PAYLOAD_TOO_LARGE') {
        res.statusCode = 413;
        res.setHeader('Content-Type', 'application/json');
        res.end(
          JSON.stringify({
            error: 'Payload too large',
            maxBytes: MAX_BODY_BYTES,
            server: SERVER_ID,
          })
        );
        return;
      }
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Failed to read body', server: SERVER_ID }));
      return;
    }
  }

  // A3: Failure simulation endpoints (only when ENABLE_TEST_FAILURES=true)
  if (pathname.startsWith('/test/failure/')) {
    if (!ENABLE_TEST_FAILURES) {
      res.statusCode = 404;
      res.setHeader('Content-Type', 'application/json');
      res.end(
        JSON.stringify({
          error: 'Test failures disabled',
          server: SERVER_ID,
        })
      );
      return;
    }

    if (pathname === '/test/failure/connection-reset') {
      // Destroy socket without sending response
      if (req.socket && !req.socket.destroyed) {
        req.socket.destroy();
      }
      return;
    }

    if (pathname === '/test/failure/timeout') {
      const msParam = parseInt(url.searchParams.get('ms') || '10000', 10);
      const delayMs = Math.min(30000, Math.max(0, isNaN(msParam) ? 10000 : msParam));

      let timer = null;
      let cleanedUp = false;

      const cleanup = () => {
        if (!cleanedUp) {
          cleanedUp = true;
          if (timer) clearTimeout(timer);
        }
      };

      req.on('close', cleanup);

      timer = setTimeout(() => {
        cleanup();
        if (!res.writableEnded) {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.end(
            JSON.stringify({
              success: true,
              server: SERVER_ID,
              delayedMs: delayMs,
              requestId,
            })
          );
        }
      }, delayMs);
      return;
    }

    res.statusCode = 404;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Unknown failure simulation endpoint', server: SERVER_ID }));
    return;
  }

  // B9: GET /test/redirect?to=<url> — 302 redirect to arbitrary URL (for SSRF redirect testing)
  // Only enabled when ENABLE_TEST_FAILURES=true
  if (pathname === '/test/redirect') {
    if (!ENABLE_TEST_FAILURES) {
      res.statusCode = 404;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Test failures disabled', server: SERVER_ID }));
      return;
    }

    const toUrl = url.searchParams.get('to');
    if (!toUrl) {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Missing ?to= parameter', server: SERVER_ID }));
      return;
    }

    res.statusCode = 302;
    res.setHeader('Location', toUrl);
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ redirect: true, to: toUrl, server: SERVER_ID }));
    return;
  }

  // B4: GET /test/gzip — returns a small gzip-encoded JSON body (always enabled)
  if (pathname === '/test/gzip' && method === 'GET') {
    const payload = JSON.stringify({
      message: 'Hello from gzip backend',
      server: SERVER_ID,
      timestamp: new Date().toISOString(),
    });
    const gzipped = zlib.gzipSync(Buffer.from(payload, 'utf8'));
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Encoding', 'gzip');
    res.setHeader('Content-Length', String(gzipped.length));
    res.end(gzipped);
    return;
  }

  // B5: GET /test/headers — returning ALL received request headers, enabled only when ENABLE_TEST_FAILURES=true
  if (pathname === '/test/headers' && method === 'GET') {
    if (!ENABLE_TEST_FAILURES) {
      res.statusCode = 404;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Test failures disabled', server: SERVER_ID }));
      return;
    }

    const headersCopy = {};
    for (const [key, value] of Object.entries(req.headers)) {
      const lower = key.toLowerCase();
      if (lower === 'cookie' || lower === 'authorization') {
        headersCopy[lower] = '[redacted]';
      } else {
        headersCopy[lower] = value;
      }
    }

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(
      JSON.stringify({
        server: SERVER_ID,
        method,
        path: pathname,
        requestId,
        headers: headersCopy,
      })
    );
    return;
  }

  // A4: GET /test/info
  if (pathname === '/test/info' && method === 'GET') {
    const filteredHeaders = {};
    for (const [key, value] of Object.entries(req.headers)) {
      const lower = key.toLowerCase();
      if (ALLOWED_HEADERS.has(lower)) {
        filteredHeaders[lower] = value;
      }
    }

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(
      JSON.stringify({
        server: SERVER_ID,
        method,
        path: pathname,
        requestId,
        headers: filteredHeaders,
      })
    );
    return;
  }

  // A2: Status simulation /test/status/:code (for ANY method)
  if (pathname.startsWith('/test/status/')) {
    const codeSegment = pathname.slice('/test/status/'.length);
    const statusCode = parseInt(codeSegment, 10);

    if (isNaN(statusCode) || !ALLOWED_STATUS_CODES.has(statusCode)) {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      res.end(
        JSON.stringify({
          error: `Unsupported status code: ${codeSegment}`,
          server: SERVER_ID,
          allowedCodes: Array.from(ALLOWED_STATUS_CODES),
        })
      );
      return;
    }

    res.statusCode = statusCode;
    res.setHeader('Content-Type', 'application/json');
    if (method === 'HEAD') {
      res.end();
      return;
    }

    const payload = {
      server: SERVER_ID,
      status: statusCode,
      method,
      requestId,
    };
    if (bodyInfo) {
      payload.bodyBytes = bodyInfo.bytes;
      payload.bodySha256 = bodyInfo.sha256;
    }

    res.end(JSON.stringify(payload));
    return;
  }

  // A1: Generic /test endpoint (responds to GET, HEAD, OPTIONS, PUT, DELETE, POST, PATCH)
  if (pathname === '/test') {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');

    if (method === 'HEAD') {
      res.end();
      return;
    }

    const payload = {
      success: true,
      method,
      server: SERVER_ID,
      bodyBytes: bodyInfo ? bodyInfo.bytes : 0,
      requestId,
    };
    if (bodyInfo && bodyInfo.bytes > 0) {
      payload.bodySha256 = bodyInfo.sha256;
    }

    res.end(JSON.stringify(payload));
    return;
  }

  // Fallback 404 for unknown routes
  res.statusCode = 404;
  res.setHeader('Content-Type', 'application/json');
  res.end(
    JSON.stringify({
      error: 'Not found',
      server: SERVER_ID,
      path: pathname,
    })
  );
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`[TEST-BACKEND] Server "${SERVER_ID}" listening on 0.0.0.0:${PORT} (failures=${ENABLE_TEST_FAILURES})`);
});
