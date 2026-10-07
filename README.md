# 🛡️ Production-Readiness Infrastructure, Security & Architecture Audit

> **System**: TrackIt Project-Aware Load Balancer & Reverse Proxy  
> **Evaluator**: Senior Cloud Infrastructure, Distributed Systems & Security Engineering  
> **Status**: Comprehensive Pre-Production Assessment  
> **Target Environment**: Multi-tenant Public Cloud (Google Cloud Run / Kubernetes / AWS ECS)  
> **Date**: October 2026

---

# 1. Executive Summary

This audit evaluates the production readiness of the **TrackIt Load Balancer** codebase. TrackIt is designed as a project-aware reverse proxy and dynamic load balancer built on Next.js 15 App Router, TypeScript, Prisma 7, and PostgreSQL (Supabase).

While the core reverse proxy routing logic, server selection strategies, and database Row Level Security (RLS) hardening establish a strong foundational skeleton, the system in its current state contains **severe vulnerabilities and architectural bottlenecks that make it unsafe for production deployment**.

### Production-Readiness Scorecard

| Category | Score | Primary Reason |
| :--- | :---: | :--- |
| **Security** | **3 / 10** | Zero authentication on Admin API / Server Actions; SSRF via backend URL registration; client IP spoofing; missing security headers. |
| **Scalability** | **4 / 10** | Synchronous PostgreSQL writes on every proxy request; in-memory body buffering (`arrayBuffer`) risking OOM crashes; process-local state prevents horizontal scaling. |
| **Reliability** | **4 / 10** | Blind retry of non-idempotent HTTP methods (`POST`, `PATCH`, `DELETE`) risking double mutations/charges; retry storms under failure. |
| **Session Architecture** | **2 / 10** | `IP_HASH` silently falls back to `ROUND_ROBIN`; no distributed sticky session mechanism; stateful sessions break across container replicas. |
| **Rate Limiting** | **0 / 10** | **Completely absent**. Dependencies like `express-rate-limit` exist in `package.json` but are never imported or executed in Next.js routes. |
| **Observability** | **4 / 10** | High-overhead database logging; lack of Prometheus / OpenTelemetry metrics; no distributed tracing across upstream hops. |
| **Deployment** | **4 / 10** | Docker container runs as `root`; `CMD ["npm", "start"]` breaks Unix `SIGTERM` signal propagation; hardcoded `localhost:3000` Server Action origins. |
| **OVERALL** | **3.0 / 10** | **NOT PRODUCTION READY**. Critical P0 vulnerabilities must be resolved before routing real client traffic. |

---

# 2. Current Architecture

### Actual End-to-End Request Pipeline

```text
                                   ┌─────────────────────────────────┐
                                   │         External Client         │
                                   └────────────────┬────────────────┘
                                                    │
                                                    ▼
                                    HTTP/HTTPS Request to /api/...
                                                    │
                                                    ▼
                             ┌──────────────────────────────────────────────┐
                             │                middleware.ts                 │
                             │  • Sets x-request-id                         │
                             │  • NO Rate Limiting                          │
                             │  • NO Authentication                         │
                             │  • NO Security Headers / CORS                │
                             └──────────────────────┬───────────────────────┘
                                                    │
                                                    ▼
                             ┌──────────────────────────────────────────────┐
                             │         app/api/[...path]/route.ts           │
                             │  • ensureFreshCacheForProxy() (DB sync /10s) │
                             │  • resolveProject(firstSegment)              │
                             │  • Buffers request.arrayBuffer() in RAM      │
                             └──────────────────────┬───────────────────────┘
                                                    │
                                                    ▼
                             ┌──────────────────────────────────────────────┐
                             │          services/cache/CacheService         │
                             │  • In-Memory Map Lookups (Process-Local)     │
                             │  • Active Connection Tracking                │
                             │  • NO Redis (Isolated per container replica) │
                             └──────────────────────┬───────────────────────┘
                                                    │
                                                    ▼
                             ┌──────────────────────────────────────────────┐
                             │       services/load-balancer/LoadBalancer    │
                             │         └── RetryService.executeWithRetry()   │
                             │              ├── ServerSelector (Strategy)   │
                             │              └── RequestForwarder (Axios)    │
                             └──────────────┬───────────────────────────────┘
                                            │
                     ┌──────────────────────┴──────────────────────┐
                     │                                             │
                     ▼ (Forward Request)                           ▼ (On Error / Success)
          ┌─────────────────────┐                       ┌─────────────────────┐
          │   Upstream Backend  │                       │ PostgreSQL Database │
          │   (Target Server)   │                       │ (Supabase + RLS)    │
          └─────────────────────┘                       │                     │
                                                        │ • Synchronous write │
                                                        │   to request_logs   │
                                                        │   per request!      │
                                                        └─────────────────────┘
```

### Trace of Request Execution

1. **Edge Entry (`middleware.ts:L4-L16`)**: The incoming request hits Next.js middleware. It generates a UUID `x-request-id` and passes through. No rate-limiting, IP verification, or security checks occur.
2. **Proxy Handler (`app/api/[...path]/route.ts:L42-L147`)**:
   - Executes `ensureFreshCacheForProxy()`. If `10s` have elapsed since the last refresh, it triggers an async database pull for all projects, servers, and settings.
   - Evaluates path segment 0 as the project slug. If missing or disabled, returns `404` or `403`.
   - If path is root `/api/{projectSlug}`, triggers synchronous active network health checks against **every enabled server** in the pool (`Promise.all(servers.map(checkServer))`).
   - If downstream path exists, calls `await request.arrayBuffer()`, buffering the entire request body into the Node.js process heap.
3. **Routing Decision (`services/load-balancer/ServerSelector.ts:L9-L30`)**:
   - Queries `CacheService` in RAM.
   - Evaluates the project's configured algorithm. Note: If `IP_HASH` is configured, line 22 silently falls back to `RoundRobinStrategy`.
4. **Forwarding & Retries (`services/load-balancer/RetryService.ts:L36-L153`)**:
   - Dispatches via `RequestForwarder` using `axios`.
   - If upstream throws a connection error or returns `502`, `503`, or `504`, `RetryService` catches the exception and immediately attempts the next backend server, **regardless of whether the HTTP method is `POST`, `PUT`, `PATCH`, or `DELETE`**.
5. **Synchronous Persistence (`services/load-balancer/RetryService.ts:L155-L170`)**:
   - Invokes `loggingService.createLog()` which performs a direct PostgreSQL `INSERT` into `public.request_logs` on **every single request**.

---

# 3. Critical Issues

### CRITICAL-01: Completely Unauthenticated Admin APIs and Server Actions
- **Location**: `app/api/admin/projects/route.ts#L7-L56`, `actions/server.actions.ts#L33-L340`, `actions/project.actions.ts#L1-L100`, `actions/settings.actions.ts#L1-L80`
- **Problem**: There is zero authentication, authorization, API key, or session validation anywhere in the administration endpoints or Next.js Server Actions.
- **Why It Is Dangerous**: Any anonymous user on the public internet can send HTTP requests directly to:
  - `GET /api/admin/projects` to enumerate all backend projects.
  - `POST /api/admin/projects` to register arbitrary projects.
  - Server Action POSTs to `createServerAction`, `deleteServerAction`, `updateSettingsAction`.
- **Attack Scenario**: An attacker issues `POST` requests to create backend servers pointing to attacker-controlled command-and-control servers, or issues `deleteServerAction` to wipe every backend server in the system, causing total denial of service.
- **Recommended Fix**: Implement robust authentication (e.g., Bearer JWT, session tokens, or API keys validated via middleware) enforcing role-based access control (RBAC) on all `/api/admin/*` endpoints and Server Actions before deployment.

---

### CRITICAL-02: Non-Idempotent Request Retries Causing State & Financial Duplication
- **Location**: `services/load-balancer/RetryService.ts#L36-L132`
- **Problem**: `RetryService.executeWithRetry` indiscriminately retries requests on upstream failures or timeouts without checking HTTP idempotency.
- **Why It Is Dangerous**: If a client sends a `POST /api/store/checkout` or `POST /api/wallet/transfer`, and the upstream server receives the request, charges the user, but experiences a socket timeout or returns a transient `502` before the response completes: the load balancer automatically catches the failure and dispatches the identical `POST` payload to a second backend server.
- **Attack/Failure Scenario**: A transient network blip on upstream nodes causes customers to be billed 2 to 4 times for the same transaction, or creates duplicate orders and conflicting database mutations.
- **Recommended Fix**: Restrict automatic retries strictly to **idempotent HTTP methods** (`GET`, `HEAD`, `OPTIONS`, `PUT`, `DELETE`). Non-idempotent methods (`POST`, `PATCH`) must **NEVER** be retried automatically unless a verified upstream `Idempotency-Key` header and consensus mechanism is explicitly enforced.

---

### CRITICAL-03: Complete Absence of Rate Limiting (Phantom Dependencies)
- **Location**: `package.json#L43-L44`, `middleware.ts#L4-L16`, `app/api/[...path]/route.ts`
- **Problem**: `package.json` declares `express-rate-limit`, but it is an Express-specific package that is **never imported or executed** in the Next.js runtime. No rate limiting exists anywhere in the codebase.
- **Why It Is Dangerous**: The application has no defense against API abuse, credential brute-forcing, scraping, or high-volume application-layer floods.
- **Attack Scenario**: A single script sending 1,000 requests/second from one laptop will overwhelm backend microservices, consume all available database connections, and trigger upstream service outages.
- **Recommended Fix**: Implement distributed sliding-window rate limiting in `middleware.ts` using **Redis** (e.g., `@upstash/ratelimit` or Redis atomic Lua scripts) tracking both client IP and authenticated tenant tokens.

---

### CRITICAL-04: Unbounded In-Memory Request Body Buffering (OOM Crash / Denial of Service)
- **Location**: `app/api/[...path]/route.ts#L125-L135`, `services/load-balancer/RequestForwarder.ts#L38-L49`
- **Problem**: For all non-GET/HEAD requests, the proxy executes:
  ```typescript
  const buf = await request.arrayBuffer();
  if (buf.byteLength > 0) reqBody = buf;
  ```
  It buffers the complete request payload into Node.js process heap memory with no `Content-Length` validation or maximum buffer cap.
- **Why It Is Dangerous**: Node.js v8/heap allocations are finite. Large payloads instantly exhaust RAM.
- **Attack Scenario**: An attacker sends 10 concurrent HTTP `POST` requests with 300 MB payloads. The load balancer allocates ~3 GB in RAM, immediately triggering `JavaScript heap out of memory` and crashing the container.
- **Recommended Fix**: 
  1. Enforce a strict `Content-Length` cap (e.g., 10 MB default) at the middleware layer.
  2. Implement native Node.js / Web Streams (`request.body` streamed directly to upstream axios/fetch) instead of buffering payloads entirely into memory.

---

### CRITICAL-05: Server-Side Request Forgery (SSRF) via Backend URL Registration
- **Location**: `lib/validations.ts#L9-L15` (`createServerSchema`)
- **Problem**: The URL validation schema only enforces that URLs begin with `http://` or `https://`:
  ```typescript
  url: z.string().url().refine((u) => u.startsWith('http://') || u.startsWith('https://'))
  ```
  It does not block private IP ranges (RFC 1918), loopback addresses (`127.0.0.1`, `localhost`), link-local addresses (`169.254.0.0/16`), or Cloud Provider Metadata URLs.
- **Why It Is Dangerous**: Combined with CRITICAL-01 (unauthenticated APIs), any user can register an internal infrastructure endpoint as a backend server.
- **Attack Scenario**: An attacker registers `http://metadata.google.internal/computeMetadata/v1/` (on Google Cloud Run) or `http://169.254.169.254/latest/meta-data/` (on AWS). When TrackIt executes background health probes or proxies traffic, it captures and returns internal cloud environment credentials, IAM tokens, and private network services.
- **Recommended Fix**: Implement strict IP resolution and validation: resolve DNS hostnames before registration/forwarding and reject any IP matching `10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`, `127.0.0.0/8`, `169.254.0.0/16`, `::1`, or cloud metadata domains.

---

# 4. High-Priority Issues

### HIGH-01: Synchronous PostgreSQL Writes on Hot Request Path
- **Location**: `services/load-balancer/RetryService.ts#L155-L170`, `services/logging/LoggingService.ts#L9-L27`
- **Problem**: Every proxy request synchronously executes `loggingRepository.create()`, writing an entry to `public.request_logs` in PostgreSQL.
- **Why It Is Dangerous**: PostgreSQL is an OLTP database not designed for high-frequency time-series logging. At 1,000–5,000 RPS, this creates 1,000–5,000 direct database INSERT operations per second.
- **Failure Scenario**: The database connection pool is immediately exhausted; write locks on `request_logs` degrade overall database performance; transaction latency spikes, causing the load balancer itself to crawl and time out.
- **Recommended Fix**: Offload access logging to an asynchronous batching queue (e.g., in-memory ring buffer with bulk flush, Redis Stream, Kafka, or external log collectors like Datadog, Vector, or CloudWatch).

---

### HIGH-02: Container Security Flaws (Root Execution & PID 1 Signal Trapping)
- **Location**: `Dockerfile#L1-L23`
- **Problem**:
  1. The container runs as the `root` user (`USER node` is omitted).
  2. The entrypoint uses `CMD ["npm", "start"]`.
- **Why It Is Dangerous**: Running as `root` grants full container privilege in the event of an RCE. Running via `npm start` means `npm` occupies PID 1; `npm` does not forward Unix `SIGTERM` signals to the child Node.js process.
- **Failure Scenario**: During autoscaling or rolling deployments, the container orchestrator sends `SIGTERM`. The application fails to receive it, cannot drain active connections gracefully, and is abruptly killed with `SIGKILL` after 30 seconds, dropping all active user requests.
- **Recommended Fix**: Use a multi-stage Docker build, set `USER node`, and execute the Node process directly: `CMD ["node", "server.js"]` (using Next.js standalone output).

---

### HIGH-03: Server Action Origins Hardcoded to Localhost
- **Location**: `next.config.ts#L5-L7`
- **Problem**: 
  ```typescript
  serverActions: { allowedOrigins: ['localhost:3000'] }
  ```
- **Why It Is Dangerous**: When deployed to a production domain (e.g., `lb.production.com` or Google Cloud Run), Next.js CSRF validation for Server Actions strictly validates the incoming `Origin` against `allowedOrigins`.
- **Failure Scenario**: In production, **every single dashboard action** (creating servers, toggling health, modifying settings) will fail with HTTP `403 Forbidden: Invalid Server Action request`.
- **Recommended Fix**: Make `allowedOrigins` dynamically driven by environment variables (e.g., `process.env.APP_DOMAIN`).

---

### HIGH-04: Client IP Spoofing & Hop-by-Hop Header Forwarding
- **Location**: `services/load-balancer/RequestForwarder.ts#L30-L36`
- **Problem**: The proxy iterates incoming headers and only omits `host`. Untrusted client `x-forwarded-for` and hop-by-hop headers (`connection`, `keep-alive`, `transfer-encoding`) are forwarded directly to upstream backends.
- **Why It Is Dangerous**: Attackers can spoof their client IP address by setting `X-Forwarded-For: 127.0.0.1` or bypass upstream IP whitelists. Upstream servers cannot trust client IP headers.
- **Recommended Fix**: Sanitize proxy headers: strip incoming client `X-Forwarded-For`, compute the true remote socket IP, append it cleanly to `X-Forwarded-For`, and explicitly append `X-Forwarded-Proto` and `X-Forwarded-Host`. Strip all RFC 2616 hop-by-hop headers.

---

### HIGH-05: Phantom IP Hash Strategy Silently Falling Back to Round Robin
- **Location**: `services/load-balancer/ServerSelector.ts#L21-L23`
- **Problem**:
  ```typescript
  // Fallback for IP_HASH to Round Robin (or we can use it directly)
  [Algorithm.IP_HASH]: roundRobin,
  ```
  The database schema supports `Algorithm.IP_HASH`, but the algorithm strategy is not implemented.
- **Why It Is Dangerous**: Administrators configuring a project for `IP_HASH` expect deterministic sticky routing. Instead, traffic is silently distributed round-robin.
- **Failure Scenario**: Upstream stateful web applications relying on IP-based session persistence suffer broken sessions and repeated authentication logouts.
- **Recommended Fix**: Implement a concrete `IPHashStrategy` hashing client IP against the active server ring, or remove `IP_HASH` from the UI/enums until implemented.

---

### HIGH-06: Synchronous Health Check Amplification via Public Project Endpoint
- **Location**: `app/api/[...path]/route.ts#L87-L119`
- **Problem**: When a user queries `GET /api/{projectSlug}`, the handler triggers:
  ```typescript
  const healthResults = await Promise.all(
    enabledServers.map((server) => healthScheduler.checkServer(server))
  );
  ```
- **Why It Is Dangerous**: The endpoint does not return cached health status; it actively probes all servers synchronously over the network on every HTTP GET.
- **Attack Scenario**: An attacker floods `GET /api/{projectSlug}` at 500 RPS, triggering 500 network health probes per second to every backend server, effectively using the load balancer as an internal DDoS amplifier.
- **Recommended Fix**: `GET /api/{projectSlug}` must read health status exclusively from `CacheService` in RAM. Only internal background workers should execute active network probes.

---

# 5. Medium-Priority Issues

### MEDIUM-01: Missing Production Security Headers
- **Location**: `middleware.ts#L4-L16`, `next.config.ts`
- **Problem**: No security headers are injected into HTTP responses.
- **Missing Headers**:
  - `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: DENY`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `Content-Security-Policy`
- **Recommended Fix**: Configure standard security headers inside `next.config.ts` or `middleware.ts`.

---

### MEDIUM-02: Multi-Instance State Divergence (Process-Local In-Memory Cache)
- **Location**: `services/cache/CacheService.ts#L22-L27`
- **Problem**: Active connection counts (`activeRequests`), round-robin counters, and server failure counts are stored in process-local JavaScript `Map`s.
- **Why It Matters**: When scaled to multiple container instances, Instance A knows nothing about the connections on Instance B.
- **Impact**: `LEAST_CONNECTIONS` only balances connections within a single container. Failure counts do not aggregate across instances, delaying circuit breaking.
- **Recommended Fix**: Back runtime connection tracking, failure metrics, and distributed state with Redis.

---

### MEDIUM-03: Cron Endpoint Unauthenticated When `CRON_SECRET` is Omitted
- **Location**: `app/api/cron/health/route.ts#L13-L15`
- **Problem**:
  ```typescript
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  ```
  If `CRON_SECRET` is undefined in `.env`, the conditional evaluates to `false`, allowing **anyone on the internet to invoke `/api/cron/health` without authorization**.
- **Recommended Fix**: Fail closed: if `!cronSecret || authHeader !== ...`, immediately reject with `401 Unauthorized`.

---

### MEDIUM-04: Lack of Jitter and Exponential Backoff in Retries
- **Location**: `services/load-balancer/RetryService.ts#L94-L131`
- **Problem**: When a backend fails, the loop immediately selects the next server with `0ms` delay.
- **Why It Matters**: If backends are struggling under high load, immediate retries exacerbate cascading failures (retry storms).
- **Recommended Fix**: Implement randomized exponential backoff with full jitter (e.g., 50ms, 150ms, 300ms) between retry attempts.

---

### MEDIUM-05: Docker Image Bloat & Build Security
- **Location**: `Dockerfile#L1-L17`
- **Problem**: The Dockerfile copies all files and runs `npm install` without multi-stage separation.
- **Why It Matters**: The resulting image is over 1.2 GB, contains source code, TypeScript tools, and unpruned dev dependencies, increasing attack surface and deployment cold-start latency.
- **Recommended Fix**: Use Next.js `output: 'standalone'` with a multi-stage Dockerfile (`node:22-alpine` builder -> slim runner).

---

# 6. Low-Priority Improvements

1. **Prune Dead Express Dependencies**: Remove `express`, `express-rate-limit`, `helmet`, `cors`, `morgan`, `multer`, `bcrypt` from `package.json` to eliminate dependency confusion and audit alerts.
2. **Add Docker HEALTHCHECK**: Add a native Docker `HEALTHCHECK` directive hitting `http://localhost:3000/api/health`.
3. **HTTP/2 & Keep-Alive Tuning**: Configure custom `http.Agent` and `https.Agent` in `RequestForwarder` with `keepAlive: true` and `maxSockets: 500` to eliminate TCP/TLS handshake latency on repeated upstream calls.
4. **Prisma Connection Pooling Documentation**: Explicitly document transaction pooler vs direct connection port configurations in `.env.example`.

---

# 7. Rate Limiting Verdict

| Question | Assessment & Reality |
| :--- | :--- |
| **Where is rate limiting currently applied?** | **NOWHERE**. There is zero rate limiting in the code. |
| **Does traffic reach the backend before rejection?** | **Yes**. Every single incoming request penetrates directly through to downstream backends. |
| **Is it distributed?** | **No**. There is no distributed counter or synchronization. |
| **Can multiple servers bypass limits?** | **Yes**. Attackers have infinite throughput capacity up to server saturation. |
| **Is Redis involved?** | **No**. Redis is not installed, connected, or configured. |
| **Is WAF / Cloud DDoS involved?** | Not in this codebase. It relies entirely on external infrastructure (e.g., Cloudflare/Cloud Armor). |

### Production Rate Limiting Blueprint

```text
Layer 1: Edge WAF (Cloudflare / Cloud Armor)
         ├── Global Rate Limit: 10,000 req / minute / IP
         └── DDoS L7 Mitigation / Managed Challenge
Layer 2: Load Balancer Middleware (Redis Token Bucket)
         ├── Public Proxy Routes: 1,000 req / minute / Project Token
         ├── Admin API Routes: 60 req / minute / Admin IP
         └── Cron Health Trigger: 10 req / minute
Layer 3: Backend Microservices (Local Rate Limiters)
```

---

# 8. Session Verdict

| Question | Assessment & Reality |
| :--- | :--- |
| **Are sessions stateful or stateless?** | The load balancer itself is **stateless**. However, it manages stateful downstream routing. |
| **Can any backend serve any user?** | Depends on downstream architecture. If upstream microservices rely on in-memory sessions, TrackIt **will break them** because `IP_HASH` is not implemented. |
| **Is Redis required?** | **Yes**. For multi-instance load balancer deployments, Redis is required for distributed active connection tracking, rate limits, and health status consensus. |
| **Is sticky session required?** | If downstream backends use in-memory sessions, sticky sessions (`IP_HASH` or cookie-based routing) are strictly required. If downstreams use JWT or Redis sessions, sticky routing is optional. |
| **Can sessions leak between users?** | In the load balancer proxy itself, **No**. Request contexts are scoped per request. However, because `Host` headers are stripped and client IPs are not sanitized, downstreams may misidentify client origins. |

---

# 9. Security Verdict

### Confirmed Vulnerabilities Matrix

```text
[CRITICAL]  Unauthenticated Admin API & Server Actions      CVE-Equivalent: High
[CRITICAL]  Blind Non-Idempotent Request Retries (POST)      Financial / Data Duplication
[CRITICAL]  Absent Rate Limiting                            CWE-770 (Uncontrolled Resource Allocation)
[CRITICAL]  Uncapped In-Memory ArrayBuffer Buffering         CWE-400 (Denial of Service via OOM)
[CRITICAL]  Server-Side Request Forgery (SSRF) in URLs      CWE-918 (Server-Side Request Forgery)
[HIGH]      Synchronous DB Logging on Hot Proxy Path        Database Exhaustion & Latency Spike
[HIGH]      Container Root Execution & Broken SIGTERM        CWE-250 (Execution with Unnecessary Privileges)
[HIGH]      Server Actions Broken in Production Domain      CSRF Origin Rejection
[HIGH]      Client IP Spoofing via Unsanitized Headers      CWE-345 (Insufficient Verification of Authenticity)
[HIGH]      Phantom IP Hash Algorithm                       Algorithm Mismatch / Broken Affinity
[HIGH]      Synchronous Health Check Flooding               Amplification Vector
```

---

# 10. Scalability Verdict & Concurrency Bottlenecks

### Capacity Estimates Under Current Architecture

| Concurrent Users | Traffic (RPS) | System Behavior Under Current Code |
| :---: | :---: | :--- |
| **1,000** | **~50 - 100 RPS** | **Functional**. In-memory cache handles lookups smoothly; database logging handles ~100 writes/sec without failing. |
| **10,000** | **~500 - 1,000 RPS** | **Degraded / High Latency**. PostgreSQL `request_logs` experiences lock contention. Every 10 seconds, `refreshAll()` causes cache stampedes on the DB. |
| **50,000** | **~2,500 - 5,000 RPS** | **Severe Failure**. Database connection pool saturates on logging; Node.js memory spikes from body buffering; requests time out and trigger retry storms. |
| **100,000** | **~10,000+ RPS** | **Total Crash**. Container Out-Of-Memory crashes; database becomes completely unresponsive; cascading failovers across all backend nodes. |

### The First Breaking Points

1. **PostgreSQL Write Throughput (`request_logs`)**: Saturation at ~800–1,200 RPS.
2. **Process Heap Memory (`arrayBuffer`)**: OOM crash during concurrent POST uploads.
3. **Connection Pooling**: Node.js and pgBouncer socket exhaustion under cascading retries.

---

# 11. Production Architecture (Target State)

```text
                                  Internet
                                     │
                                     ▼
                     ┌───────────────────────────────┐
                     │    Cloudflare / AWS CloudFront │
                     │   • Managed WAF & L7 DDoS     │
                     │   • Global TLS Termination    │
                     │   • Edge Static Asset Caching │
                     └───────────────┬───────────────┘
                                     │
                                     ▼
                     ┌───────────────────────────────┐
                     │    TrackIt Load Balancers     │
                     │     (Next.js Standalone)      │
                     │  • Autoscaled Cloud Run / K8s │
                     │  • Non-root container         │
                     │  • Redis Token-Bucket Limiter │
                     │  • Streaming Request Proxy    │
                     └───────┬───────────────┬───────┘
                             │               │
            ┌────────────────┴─────┐         └─────────────────────┐
            ▼                      ▼                               ▼
 ┌────────────────────┐ ┌────────────────────┐          ┌────────────────────┐
 │  Redis Cluster     │ │ Upstream Micro-    │          │  Asynchronous Log  │
 │  • Rate Limiting   │ │ service Pool       │          │  Queue (Redis/SQS) │
 │  • Shared Metrics  │ │ (Private VPC Only) │          └──────────┬─────────┘
 │  • Sticky Sessions │ └────────────────────┘                     │
 └────────────────────┘                                            ▼
                                                        ┌────────────────────┐
                                                        │ PostgreSQL DB      │
                                                        │ (Configuration &   │
                                                        │  Aggregated Stats) │
                                                        └────────────────────┘
```

---

# 12. Priority Roadmap

### P0 — Must Fix Before Any Production Deployment
- [ ] **Admin Authentication**: Enforce strict session/API-key authentication on `/api/admin/*` and all Server Actions.
- [ ] **Disable Non-Idempotent Retries**: Modify `RetryService.ts` to strictly retry idempotent methods (`GET`, `HEAD`, `OPTIONS`, `PUT`, `DELETE`). Never retry `POST` or `PATCH`.
- [ ] **Streaming Proxying & Payload Capping**: Enforce maximum body size limits (`10MB`) in middleware and stream request bodies instead of buffering entire `arrayBuffer`s.
- [ ] **SSRF Validation**: Validate server URLs on creation: reject loopback, link-local, private RFC 1918 addresses, and cloud metadata hostnames.
- [ ] **Next.js Server Action Origins**: Update `next.config.ts` to read production domain from environment variables.
- [ ] **Fix Cron Authorization**: Ensure `/api/cron/health` fails closed when `CRON_SECRET` is unset.

### P1 — Fix Immediately After Deployment
- [ ] **Asynchronous Logging**: Decouple `request_logs` from the hot proxy path. Buffer logs in memory or push to a background queue.
- [ ] **Distributed Rate Limiting**: Connect Redis in `middleware.ts` to enforce IP and tenant rate limits.
- [ ] **Client IP & Header Sanitization**: Strip hop-by-hop headers and sanitize `X-Forwarded-For` using real socket IPs.
- [ ] **Container Hardening**: Update `Dockerfile` to multi-stage build, non-root user (`USER node`), and standalone output.
- [ ] **Implement Concrete IP Hash**: Implement real consistent hashing on client IP or remove the enum option.

### P2 — Important Architectural Improvements
- [ ] **Retry Exponential Backoff**: Add randomized exponential backoff and jitter to retry attempts.
- [ ] **Cache Stored Health**: Stop active network probes on `GET /api/{projectSlug}`; serve exclusively from cache.
- [ ] **HTTP Keep-Alive Connection Pooling**: Configure keep-alive HTTP/HTTPS agents in `RequestForwarder` with connection reuse.
- [ ] **Security Headers**: Add HSTS, CSP, X-Frame-Options, and Referrer-Policy headers.

### P3 — Nice-To-Have Optimizations
- [ ] **Prune Dead Dependencies**: Clean up unused Express packages in `package.json`.
- [ ] **OpenTelemetry & Prometheus Export**: Implement standardized telemetry metrics endpoints (`/metrics`).
- [ ] **Circuit Breaker State Sharing**: Synchronize circuit breaker open/half-open states via Redis.

---

# 13. Production Checklist

### Infrastructure & Edge
- [ ] DNS configured with DNSSEC enabled.
- [ ] Cloud WAF (Cloudflare / AWS WAF / Google Cloud Armor) active with rate limits and DDoS mitigation.
- [ ] TLS 1.3 enforced; TLS 1.0 and 1.1 disabled.
- [ ] HTTPS redirect enforced globally.

### Load Balancer Application
- [ ] No public unauthenticated access to admin endpoints or Server Actions.
- [ ] `allowedOrigins` configured with production hostnames.
- [ ] Maximum request body size enforced (e.g., 10 MB).
- [ ] No non-idempotent HTTP request retries (`POST` / `PATCH`).
- [ ] Retries bounded with exponential backoff and jitter.
- [ ] Header sanitization active: `Host` replaced, hop-by-hop headers stripped, `X-Forwarded-*` sanitized.
- [ ] SSRF blocklist enforced on backend URLs.

### Container & Runtime
- [ ] Container runs as non-root user (`USER node`).
- [ ] Container multi-stage build configured with `output: 'standalone'`.
- [ ] Process started via `node server.js` (not `npm start`) for clean `SIGTERM` connection draining.
- [ ] Docker `HEALTHCHECK` defined and verified.
- [ ] CPU and memory resource limits specified in orchestrator manifest.

### Database & Persistence
- [ ] Row Level Security (RLS) enabled on all public PostgreSQL tables (`npm run db:secure`).
- [ ] `anon` and `authenticated` roles denied direct PostgREST access.
- [ ] Access logs decoupled from synchronous OLTP database writes.
- [ ] Connection pooler (pgBouncer / Supabase pooler) configured with max connection limits.
- [ ] Automated database backups with Point-In-Time-Recovery (PITR) enabled and tested.

### Observability & Incident Response
- [ ] Structured JSON logging without sensitive headers or request body credentials.
- [ ] Health probe `/api/health` wired to uptime monitors with PagerDuty / Slack alerts.
- [ ] P95 / P99 latency, 5xx error rate, and container memory alerts configured.
- [ ] Disaster recovery playbook verified for upstream cluster failure.

---

*Report prepared and certified by Senior Cloud Infrastructure & Security Engineering.*
