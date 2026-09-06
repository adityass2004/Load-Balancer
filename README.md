# TrackIt Load Balancer

TrackIt is a project-aware reverse proxy and load balancer with health monitoring, retries, metrics, request logs, and a dashboard for managing projects and backend servers.

## Features

- Project-aware reverse proxy routing.
- Round Robin, Weighted Round Robin, Least Connections, Priority, Random, and IP Hash strategies.
- Healthy-server filtering and retry-on-failure.
- Background health monitoring with failure tracking and recovery.
- Project-scoped server cache, metrics, logs, active-connection tracking, and retries.
- Support for GET, POST, PUT, PATCH, DELETE, OPTIONS, and HEAD requests.
- Request-body, header, query-string, and request-ID forwarding.
- Dashboard for projects, servers, settings, analytics, and request logs.

## Technology

- Next.js 15 App Router
- TypeScript
- PostgreSQL and Prisma 7
- React 19 and TanStack React Query
- Tailwind CSS, Radix UI, and Recharts
- Axios and Zod

## Project-aware routing

The public proxy contract is:

```text
/api/{projectSlug}/{backendPath}
```

The first segment after `/api/` is always the project slug. Everything after that segment is the backend path and is forwarded unchanged.

For example, with this server registered in the `trial` project:

```text
Server URL: https://trackitsrm.vercel.app
Request:    GET /api/trial/api/trackit/health
Upstream:   GET https://trackitsrm.vercel.app/api/trackit/health
```

The `/api/trial` prefix is used only by the Load Balancer to resolve the project. It is never sent to the backend.

### Dynamic backend paths

Backend endpoints are not whitelisted or hardcoded. These requests are forwarded dynamically:

```text
/api/trial/api/health              -> https://trackitsrm.vercel.app/api/health
/api/trial/api/users               -> https://trackitsrm.vercel.app/api/users
/api/trial/api/users/123           -> https://trackitsrm.vercel.app/api/users/123
/api/trial/api/orders/123/items    -> https://trackitsrm.vercel.app/api/orders/123/items
/api/trial/api/users?page=2        -> https://trackitsrm.vercel.app/api/users?page=2
```

Query parameters are preserved. Request bodies and appropriate headers are preserved for POST, PUT, and PATCH requests.

### Project root health

```text
GET /api/trial
```

When no backend path is present, the request is treated as a project-level health/status request. The project is resolved by slug, checked for existence and enabled status, and its own backend pool is checked using the existing health-check mechanism. This is not a proxy request to the backend root (`/`) and does not introduce a separate backend health-path configuration.

### System routes

These routes belong to the Load Balancer application and are not project proxy routes:

```text
GET /api/health       # Load Balancer application health
/api/admin/*          # Administrative API
/api/cron/*           # Scheduled maintenance and health operations
```

### Isolation and retries

Every project request resolves one database project before server selection. Only enabled and healthy servers with that project's `projectId` are eligible. This project scope is retained by:

- `ServerSelector` and the configured load-balancing strategy.
- `RetryService` when another backend is needed.
- The in-memory server cache.
- Health status and active connection tracking.
- Request logs and metrics.

A backend URL may be registered in multiple projects. The same URL may appear only once within an individual project.

## Server registration rules

The `Server.url` value must be the backend base URL only:

```text
Correct:   https://trackitsrm.vercel.app
Incorrect: https://trackitsrm.vercel.app/api/health
```

Select the owning project when adding a server in the dashboard. The database enforces the project-scoped uniqueness rule with `(project_id, url)`.

## Project structure

```text
app/
  (dashboard)/                 Dashboard pages
  api/[...path]/               Project-aware reverse proxy route
  api/admin/projects/          Project administration API
  api/health/                  Load Balancer health endpoint
  api/cron/health/             Health scheduler endpoint
actions/                       Server Actions
components/projects/           Project management UI
context/                       Project selection and refresh state
hooks/                         React Query and UI hooks
lib/                           Database, validation, response, and cache utilities
prisma/schema.prisma           PostgreSQL data model
repositories/                  Database access layer
services/cache/                Project-aware server cache
services/health/               Health checks and scheduler
services/load-balancer/        Selection, forwarding, retries, and metrics
services/logging/              Request logging
strategies/                    Load-balancing strategy implementations
```

## Database models

The primary models are:

- `Project`: name, slug, enabled state, and project relationships.
- `Server`: backend base URL, project membership, enabled/healthy state, weight, priority, and runtime statistics.
- `Settings`: load-balancing algorithm, health-check settings, timeouts, and retry limits. Settings may be project-scoped.
- `RequestLog`: request ID, project, route, backend, status, response time, retry count, and error details.

## Getting started

### Prerequisites

- Node.js 22 or newer
- npm 10 or newer
- PostgreSQL 14 or newer, local or hosted

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Copy the example file and set a valid database connection:

```bash
cp .env.example .env
```

Required variables:

| Variable | Description |
| --- | --- |
| `DATABASE_URL` | PostgreSQL connection string |
| `NEXT_PUBLIC_APP_URL` | Public application URL, normally `http://localhost:3000` |
| `CRON_SECRET` | Secret for protected cron requests, when enabled |

### 3. Generate and apply the Prisma schema

```bash
npm run db:generate
npm run db:push
```

The current repository does not contain Prisma migration files and uses `db:push` for schema synchronization. When applying the change that allows one backend URL in multiple projects, Prisma may require:

```bash
npm run db:push -- --accept-data-loss
```

Review Prisma's warning and back up production databases before applying schema changes. The intended resulting constraint is unique `(project_id, url)`, not globally unique `url`.

### 4. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) for the dashboard.

## NPM scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the Next.js development server |
| `npm run build` | Generate Prisma Client and build the production application |
| `npm run start` | Start the production application |
| `npm run lint` | Run ESLint |
| `npm run db:generate` | Generate Prisma Client in `src/generated/prisma` |
| `npm run db:push` | Push the Prisma schema to the configured database |
| `npm run db:migrate` | Run Prisma migration development commands |
| `npm run db:studio` | Open Prisma Studio |

## Local verification

Start the application with `npm run dev`, then use:

```bash
# Load Balancer application health
curl http://localhost:3000/api/health

# Trial project health/status
curl http://localhost:3000/api/trial

# Dynamic backend endpoint through Trial
curl http://localhost:3000/api/trial/api/trackit/health
curl http://localhost:3000/api/trial/api/users
curl "http://localhost:3000/api/trial/api/users?page=2&limit=10"

# Unknown project; expected HTTP 404
curl http://localhost:3000/api/not-real/api/health
```

If the selected Trial server is `https://trackitsrm.vercel.app`, the health proxy request must reach `https://trackitsrm.vercel.app/api/trackit/health`, without the `/api/trial` prefix.

## Validation

Run the standard checks before committing:

```bash
npm run db:generate
npm run lint
npm run build
```

There is currently no test script configured in `package.json`.

## Docker

```bash
docker build -t trackit-load-balancer .

docker run -d \
  -p 8000:8000 \
  -e DATABASE_URL="postgresql://user:password@host.docker.internal:5432/trackit_lb" \
  -e NEXT_PUBLIC_APP_URL="http://localhost:8000" \
  --name trackit-load-balancer \
  trackit-load-balancer
```

## License

This project is private and proprietary.
