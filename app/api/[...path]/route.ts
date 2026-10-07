import crypto from 'crypto';
import { NextRequest, NextResponse } from "next/server";
import { cacheInitializer } from "@/services/cache/CacheInitializer";
import { cacheService } from "@/services/cache/CacheService";
import { healthScheduler } from "@/services/health/HealthScheduler";

export const dynamic = 'force-dynamic';

import { LoadBalancer } from "@/services/load-balancer/LoadBalancer";
import { RetryService } from "@/services/load-balancer/RetryService";
import { ServerSelector } from "@/services/load-balancer/ServerSelector";
import { RequestForwarder } from "@/services/load-balancer/RequestForwarder";
import { MetricsCollector } from "@/services/load-balancer/MetricsCollector";
import { getClientIp } from "@/lib/client-ip";
import { rateLimit } from "@/lib/rate-limit";
import { bodyConfig } from "@/services/load-balancer/body-config";
import {
  parseContentLength,
  decideBodyMode,
  globalBufferBudget,
  BodyTooLargeError,
  type RequestPayload,
} from "@/services/load-balancer/body-policy";

const metrics = new MetricsCollector();
const selector = new ServerSelector();
const forwarder = new RequestForwarder();
const retryService = new RetryService(
  selector,
  forwarder,
  metrics
);

const loadBalancer = new LoadBalancer(retryService);

const PROXY_CACHE_REFRESH_MS = 10_000;
let lastProxyCacheRefresh: number = 0;

const SYSTEM_ROUTES = new Set(["health", "admin", "cron"]);

// Throttle logging for 413 rejections: at most 1 line per IP per 10 seconds
const rejection413LogCache = new Map<string, number>();

function maskIpForLog(ip: string): string {
  if (ip === 'unknown') return 'unknown';
  if (ip.includes('.')) {
    const parts = ip.split('.');
    if (parts.length === 4) return `${parts[0]}.${parts[1]}.${parts[2]}.xxx`;
  }
  return crypto.createHash('sha256').update(ip).digest('hex').slice(0, 8);
}

function logPayloadTooLargeThrottled(ip: string, length: number, maxBytes: number): void {
  const now = Date.now();
  const lastLog = rejection413LogCache.get(ip) || 0;
  if (now - lastLog >= 10_000) {
    rejection413LogCache.set(ip, now);
    const masked = maskIpForLog(ip);
    console.warn(`[PAYLOAD_413] ip=${masked} length=${length} maxBytes=${maxBytes}`);
  }
}

let lastLoopWarnTime = 0;
function logLoopDetectedThrottled(requestId: string, hopCount: number): void {
  const now = Date.now();
  if (now - lastLoopWarnTime >= 10_000) {
    lastLoopWarnTime = now;
    console.warn(`[LOOP_GUARD] Proxy loop detected: requestId=${requestId} hopCount=${hopCount}`);
  }
}

function getProxyMaxHops(): number {
  const envVal = parseInt(process.env.PROXY_MAX_HOPS || '3', 10);
  return isNaN(envVal) || envVal < 1 ? 3 : envVal;
}

async function ensureFreshCacheForProxy(): Promise<void> {
  await healthScheduler.startMonitoring();

  const now = Date.now();
  const staleByTime = now - lastProxyCacheRefresh >= PROXY_CACHE_REFRESH_MS;

  if (staleByTime) {
    await cacheService.refreshAll();
    lastProxyCacheRefresh = now;
  }
}

async function handler(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  const { path } = await context.params;
  const url = new URL(request.url);
  const requestId = request.headers.get('x-request-id') || crypto.randomUUID();

  if (!path || path.length === 0) {
    return NextResponse.json(
      { message: "Invalid request path." },
      { status: 400, headers: { 'x-request-id': requestId } }
    );
  }

  const firstSegment = path[0];

  // Preserve system endpoints (/api/health, /api/admin/*, /api/cron/*)
  if (SYSTEM_ROUTES.has(firstSegment.toLowerCase())) {
    if (firstSegment.toLowerCase() === "health" && path.length === 1) {
      return NextResponse.json(
        { status: "ok", timestamp: new Date().toISOString() },
        { headers: { 'x-request-id': requestId } }
      );
    }
    return NextResponse.json(
      { message: "System endpoint not found." },
      { status: 404, headers: { 'x-request-id': requestId } }
    );
  }

  // 1. Per-IP Rate Limit (MUST run BEFORE ensureFreshCacheForProxy, body reading, server selection)
  const clientIp = getClientIp(request);
  const ipLimit = await rateLimit("proxy:ip", clientIp, request);
  if (ipLimit) {
    return ipLimit;
  }

  // Proxy loop guard (D1: after rate limiting, before server selection)
  const rawHop = request.headers.get('x-trackit-hop');
  let hopCount = 0;
  if (rawHop) {
    const parsedHop = parseInt(rawHop.trim(), 10);
    if (!isNaN(parsedHop)) {
      hopCount = Math.min(100, Math.max(0, parsedHop));
    }
  }

  const maxHops = getProxyMaxHops();
  if (hopCount >= maxHops) {
    logLoopDetectedThrottled(requestId, hopCount);
    return NextResponse.json(
      { error: "Proxy loop detected" },
      { status: 508, headers: { 'x-request-id': requestId } }
    );
  }
  const nextHop = hopCount + 1;

  // 2. Early Content-Length validation (B2: before ensureFreshCacheForProxy and before any body access)
  const isBodyAllowedMethod = request.method !== "GET" && request.method !== "HEAD";
  const rawContentLength = request.headers.get("content-length");
  const clResult = parseContentLength(rawContentLength);

  if (!clResult.valid) {
    return NextResponse.json(
      { error: "Invalid Content-Length header" },
      { status: 400, headers: { 'x-request-id': requestId } }
    );
  }

  if (isBodyAllowedMethod && clResult.contentLength !== null && clResult.contentLength > bodyConfig.maxBytes) {
    logPayloadTooLargeThrottled(clientIp, clResult.contentLength, bodyConfig.maxBytes);
    return NextResponse.json(
      { error: "Payload too large", maxBytes: bodyConfig.maxBytes },
      {
        status: 413,
        headers: {
          Connection: "close",
          'x-request-id': requestId,
        },
      }
    );
  }

  await cacheInitializer.init();
  await ensureFreshCacheForProxy();

  // 3. Resolve the project exclusively from the public path segment.
  const project = await cacheService.resolveProject(firstSegment);

  if (!project || project.slug !== firstSegment) {
    return NextResponse.json(
      { message: "Project not found." },
      { status: 404, headers: { 'x-request-id': requestId } }
    );
  }

  if (!project.enabled) {
    return NextResponse.json(
      { message: "Project is disabled." },
      { status: 403, headers: { 'x-request-id': requestId } }
    );
  }

  // 4. Per-Project Rate Limit (applied only after slug resolved to a real project)
  const projectLimit = await rateLimit("proxy:project", project.slug, request);
  if (projectLimit) {
    return projectLimit;
  }

  // 5. Project health shortcut: /api/{projectSlug} has no backend path.
  if (path.length === 1) {
    const servers = await cacheService.getServersForProject(project.id);
    const enabledServers = servers.filter((s) => s.enabled && !s.deletedAt);

    if (enabledServers.length === 0) {
      return NextResponse.json(
        {
          project: project.slug,
          projectName: project.name,
          healthy: false,
          message: "No enabled backends found for project.",
          servers: [],
        },
        { status: 503, headers: { 'x-request-id': requestId } }
      );
    }

    const healthResults = await Promise.all(
      enabledServers.map((server) => healthScheduler.checkServer(server))
    );

    const overallHealthy = healthResults.length > 0 && healthResults.some((r) => r.success);

    return NextResponse.json(
      {
        project: project.slug,
        projectName: project.name,
        healthy: overallHealthy,
        servers: healthResults,
      },
      { status: overallHealthy ? 200 : 503, headers: { 'x-request-id': requestId } }
    );
  }

  // 6. Compute backend path (strip projectSlug segment if path-based resolution)
  const remainingSegments = path.slice(1);
  const backendPath = `/${remainingSegments.join("/")}${url.search}`;

  // 7. Decide body mode (buffered or streamed or none)
  let payload: RequestPayload | null = null;
  try {
    payload = await decideBodyMode(
      request.method,
      clResult.contentLength,
      request.body,
      bodyConfig,
      globalBufferBudget,
      request.signal
    );

    const response = await loadBalancer.handleRequest(
      request,
      project,
      backendPath,
      payload,
      clientIp,
      nextHop
    );

    return response;
  } catch (err: any) {
    if (err instanceof BodyTooLargeError || err?.name === 'BodyTooLargeError') {
      logPayloadTooLargeThrottled(clientIp, err.bytesRead, err.maxBytes);
      return NextResponse.json(
        { error: "Payload too large", maxBytes: err.maxBytes },
        {
          status: 413,
          headers: {
            Connection: "close",
            'x-request-id': requestId,
          },
        }
      );
    }
    throw err;
  } finally {
    // Release budget exactly once
    if (payload && payload.kind === 'buffer') {
      payload.releaseBudget();
    }
  }
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
export const OPTIONS = handler;
export const HEAD = handler;
