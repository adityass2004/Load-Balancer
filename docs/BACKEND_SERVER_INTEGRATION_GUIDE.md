# TrackIt Load Balancer — Backend Server Integration Guide

This guide details the exact architectural requirements, HTTP contract, endpoint expectations, and operational specifications for any backend service integrating with the TrackIt Load Balancer in a production environment.

---

## 1. Upstream Protocol & Path Mapping

When a client sends a request to TrackIt:
```http
METHOD /api/{projectSlug}/{downstreamPath}?query HTTP/1.1
Host: loadbalancer.example.com
```

### URL Forwarding Behavior
1. **Slug Stripping**: TrackIt inspects `path[0]` as the `projectSlug`.
2. **Backend Construction**: TrackIt forwards the remainder of the path directly to the configured backend server URL:
   - If server registered as: `http://backend-1.internal:8080`
   - Client path: `/api/store/products?sort=price`
   - Upstream receives: `http://backend-1.internal:8080/products?sort=price`
   - If server registered with a subpath: `http://backend-1.internal:8080/v1`
   - Upstream receives: `http://backend-1.internal:8080/v1/products?sort=price`

---

## 2. Required Endpoints & Response Contracts

Every backend server attached to TrackIt must provide the following:

### A. Health Check Endpoint (`/api/health` or `/health`)
TrackIt's automated `HealthMonitor` periodically audits every backend to assess pool availability.

- **Path**: `/api/health` (default) or `/health`
- **Method**: `GET`
- **Expected Status**: `200 OK` (Any status in the `200-499` range is marked as reachable/healthy; `5xx` or connection timeouts mark the server as `UNHEALTHY` after `maxFailures`).
- **Response Format**:
  ```json
  {
    "status": "ok",
    "server": "backend-instance-id",
    "uptime": 123456
  }
  ```
- **Performance Requirement**: The health endpoint MUST return in < 500ms and must not perform heavy database queries.

### B. Business / API Endpoints
- **Methods Supported**: `GET`, `HEAD`, `OPTIONS`, `PUT`, `DELETE`, `POST`, `PATCH`.
- **Response Headers**:
  - `Content-Type`: Set explicitly (e.g., `application/json`).
  - `x-request-id`: Echo the incoming `x-request-id` header to enable distributed tracing.

---

## 3. Failure Handling & Load Balancer Retry Semantics

TrackIt enforces strict RFC 7231 / RFC 9110 retry semantics:

| HTTP Status / Condition | Method: GET / HEAD / OPTIONS / PUT / DELETE | Method: POST / PATCH / Custom |
| :--- | :--- | :--- |
| **`2xx` / `3xx`** | Success. Returned to client. | Success. Returned to client. |
| **`4xx` (e.g. 400, 404, 429)** | Client error. Passed through directly without retry. | Client error. Passed through directly without retry. |
| **`500 Internal Server Error`** | App error. Passed through directly without retry. | App error. Passed through directly without retry. |
| **`502` / `503` / `504`** | **Retried** up to `maxRetries` on next available server. | **NEVER retried**. Returned immediately to client (prevents duplicate operations/charges). |
| **Connection Timeout / Reset** | **Retried** up to `maxRetries` on next available server. | **NEVER retried**. Returns gateway 502/504 error immediately. |

### Upstream Guidelines
- If your backend is shutting down or under heavy load, return **`503 Service Unavailable`**. Idempotent requests (`GET`, `PUT`, `DELETE`) will gracefully fail over to other backends.
- Never return `503` for bad user input; use `400 Bad Request` or `422 Unprocessable Entity`.

---

## 4. Header & Security Expectations

1. **Request ID (`x-request-id`)**:
   - TrackIt generates or propagates a unique UUID per request in the `x-request-id` header.
   - Backends should log this ID and echo it in responses for end-to-end observability.
2. **Client Identification (`x-forwarded-for`, `x-real-ip`)**:
   - TrackIt forwards headers indicating client IP.
3. **Payload Limits**:
   - The standalone test backend enforces a 50MB ceiling. For production, keep payloads within your reverse-proxy / body-parser limits (typically 10MB-50MB).

---

## 5. How to Register a Backend Server in TrackIt

### Method 1: Using the TrackIt Dashboard
1. Log in to the TrackIt admin interface (`http://localhost:3000/dashboard`).
2. Navigate to **Servers** or your **Project Settings**.
3. Click **Add Server**:
   - **Name**: Human-readable label (e.g. `Payment Service US-East-1`).
   - **URL**: Full base URL reachable by the load balancer (e.g. `http://10.0.1.25:8080`).
   - **Weight**: Relative load weight (e.g. `1` to `10`) for weighted round-robin.
   - **Priority**: Primary tier (`1`), failover backup tier (`2`).
   - **Enabled**: `true`.

### Method 2: Using the Admin REST API
```bash
curl -X POST http://localhost:3000/api/admin/projects/{projectId}/servers \
  -H "Content-Type: application/json" \
  -H "Cookie: authjs.session-token=<ADMIN_TOKEN>" \
  -d '{
    "name": "Backend Service Node A",
    "url": "http://10.0.1.20:4001",
    "weight": 1,
    "priority": 1,
    "enabled": true
  }'
```

---

## 6. Checklist for Production Deployment

- [ ] Backend runs on a dedicated internal subnet (not directly exposed to public internet).
- [ ] Backend exposes lightweight `/api/health` returning `200 OK`.
- [ ] Backend handles connection timeouts gracefully (< `requestTimeout` configured in TrackIt).
- [ ] Backend echoes `x-request-id` in response headers and application logs.
- [ ] Redis cluster configured for TrackIt distributed rate limiting (`REDIS_URL`).
- [ ] Edge WAF (Cloudflare / Cloud Armor) configured in front of TrackIt with matching `TRUSTED_PROXY_HOPS`.
