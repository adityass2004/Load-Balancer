# Generic Backend Test Service

Standalone, zero-dependency Node.js HTTP service designed for load balancing, failure simulation, idempotency verification, and rate limiting validation with TrackIt.

---

## 1. Running 3 Instances

To run 3 backend instances concurrently on ports 4001, 4002, and 4003:

```bash
# Terminal 1
PORT=4001 SERVER_ID=server-1 ENABLE_TEST_FAILURES=true npm start

# Terminal 2
PORT=4002 SERVER_ID=server-2 ENABLE_TEST_FAILURES=true npm start

# Terminal 3
PORT=4003 SERVER_ID=server-3 ENABLE_TEST_FAILURES=true npm start
```

Or using PowerShell on Windows:
```powershell
# Instance 1
$env:PORT="4001"; $env:SERVER_ID="server-1"; $env:ENABLE_TEST_FAILURES="true"; npm start

# Instance 2
$env:PORT="4002"; $env:SERVER_ID="server-2"; $env:ENABLE_TEST_FAILURES="true"; npm start

# Instance 3
$env:PORT="4003"; $env:SERVER_ID="server-3"; $env:ENABLE_TEST_FAILURES="true"; npm start
```

---

## 2. Curl Examples

### Standard HTTP Methods
```bash
# GET
curl -i http://localhost:4001/test

# POST with JSON payload
curl -i -X POST http://localhost:4001/test \
  -H "Content-Type: application/json" \
  -d '{"item":"book","qty":2}'

# PUT
curl -i -X PUT http://localhost:4001/test \
  -H "Content-Type: application/json" \
  -d '{"item":"book","qty":5}'

# PATCH
curl -i -X PATCH http://localhost:4001/test \
  -H "Content-Type: application/json" \
  -d '{"qty":6}'

# DELETE
curl -i -X DELETE http://localhost:4001/test
```

### Status Code Simulation
```bash
# Simulate 503 Service Unavailable (GET, POST, etc.)
curl -i http://localhost:4001/test/status/503
curl -i -X POST http://localhost:4001/test/status/503

# Simulate 504 Gateway Timeout
curl -i http://localhost:4001/test/status/504
```

### Failure Simulation (Requires `ENABLE_TEST_FAILURES=true`)
```bash
# Connection reset (server abruptly closes socket without response)
curl -i http://localhost:4001/test/failure/connection-reset

# Response timeout with custom delay in milliseconds
curl -i "http://localhost:4001/test/failure/timeout?ms=5000"
```

### Request Counters & Reset
```bash
# Retrieve request statistics (total, byMethod, aborted count, and recentBodies)
curl -i http://localhost:4001/test/stats

# Reset counters to zero (also clears aborted count and recentBodies)
curl -i -X POST http://localhost:4001/test/reset
```

### Body Streaming, Hashing & Size Limits
- `TEST_BACKEND_MAX_BODY_BYTES`: Configures max payload size accepted by the test backend (default: 52428800 bytes / 50 MB).
- Requests with bodies sent to `/test` or `/test/status/:code` compute `bodyBytes` and `bodySha256` on the fly via streaming (never buffering the whole body).
- `/test/stats` reports `aborted` (requests whose connections closed before the body finished upload) and `recentBodies` (last 10 entries `{ method, path, bytes, sha256 }`).

### Health & Info
```bash
# Health check
curl -i http://localhost:4001/health

# Safe Header Allowlist Info
curl -i http://localhost:4001/test/info
```

---

## 3. Registering Backend Servers in TrackIt

You can register these test servers under any TrackIt project via the Admin API or the dashboard:

```bash
# Add server 1 to project
curl -X POST http://localhost:3000/api/admin/projects \
  -H "Content-Type: application/json" \
  -d '{
    "name": "E2E Test Project",
    "slug": "test-project",
    "algorithm": "ROUND_ROBIN"
  }'

# Server URLs to register:
# http://localhost:4001
# http://localhost:4002
# http://localhost:4003
```

### Exact Upstream Path Forwarding Behavior

When a client sends a request to TrackIt:
```
http://localhost:3000/api/{projectSlug}/test
```

1. **Path Decomposition**: In [`app/api/[...path]/route.ts`](file:///d:/My_Projects/Load-Balancer/app/api/[...path]/route.ts), `path[0]` is extracted as the `projectSlug`. The remaining segments are extracted as `backendPath = "/test"`.
2. **Upstream URL Construction**: In [`services/load-balancer/RequestForwarder.ts`](file:///d:/My_Projects/Load-Balancer/services/load-balancer/RequestForwarder.ts), [`buildUpstreamUrl(server.url, backendPath)`](file:///d:/My_Projects/Load-Balancer/services/load-balancer/RequestForwarder.ts#L4) joins the server base URL with `backendPath`.
   - If server URL is `http://localhost:4001`, the forwarded URL is:
     `http://localhost:4001/test`
   - If server URL has a subpath like `http://localhost:4001/api/v1`, the forwarded URL is:
     `http://localhost:4001/api/v1/test`
3. **Real Behavior Confirmed**: TrackIt **strips the project slug** and forwards `/test` (along with any incoming query string). The backend test service therefore directly matches and handles `/test`.

> [!NOTE]
> **SSRF Protection (CRITICAL-05)**:
> In production environments, requests to loopback addresses (`localhost`, `127.0.0.1`, `::1`) and
> private IP ranges are blocked by the SSRF guard. To use these test backends locally:
>
> 1. Set `BACKEND_ALLOW_LOOPBACK=true` in your `.env` or shell (dev only).
> 2. Run `scripts/seed-test-project.ts` with the same env var set.
> 3. **Never set `BACKEND_ALLOW_LOOPBACK=true` in production** — the app will refuse to start.

### Redirect Testing Endpoint (B9)

```bash
# Redirect to an arbitrary URL (requires ENABLE_TEST_FAILURES=true)
# Used to test SSRF-via-redirect protection
curl -i "http://localhost:4001/test/redirect?to=http://169.254.169.254/"
```

The redirect endpoint returns `302 Location: <to>` only when `ENABLE_TEST_FAILURES=true`;
otherwise it returns `404`. The TrackIt proxy will follow the redirect through the guarded
agent, which will block the hop to any disallowed address before a connection is made.

