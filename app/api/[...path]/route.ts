import { NextRequest } from "next/server";
import { cacheInitializer } from "@/services/cache/CacheInitializer";
import { cacheService } from "@/services/cache/CacheService";
import { healthScheduler } from "@/services/health/HealthScheduler";

import { LoadBalancer } from "@/services/load-balancer/LoadBalancer";
import { RetryService } from "@/services/load-balancer/RetryService";
import { ServerSelector } from "@/services/load-balancer/ServerSelector";
import { RequestForwarder } from "@/services/load-balancer/RequestForwarder";
import { MetricsCollector } from "@/services/load-balancer/MetricsCollector";

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

async function ensureFreshCacheForProxy(): Promise<void> {
    // Start the background interval monitor once (idempotent — no-op if already running)
    await healthScheduler.startMonitoring();

    const now = Date.now();
    const staleByTime = now - lastProxyCacheRefresh >= PROXY_CACHE_REFRESH_MS;

    // Only refresh the cache snapshot periodically, not on every request.
    // Never fire an on-demand health cycle here — that is the scheduler's job.
    if (staleByTime) {
        await cacheService.refreshServers();
        lastProxyCacheRefresh = now;
    }
}

async function handler(
    request: NextRequest,
    context: { params: Promise<{ path: string[] }> }
) {
    await cacheInitializer.init();
    await ensureFreshCacheForProxy();

    const { path } = await context.params;
    const url = new URL(request.url);

    // [...path] captures segments AFTER /api/, e.g. for /api/trackit/health
    // path = ['trackit', 'health']. Re-prepend /api/ so backends receive the
    // full original path: /api/trackit/health
    const downstreamPath = `/api/${path.join("/")}${url.search}`;

    const proxyRequest = new Request(
        new URL(downstreamPath, "http://proxy.internal").toString(),
        {
            method: request.method,
            headers: request.headers,
            body:
                request.method === "GET" || request.method === "HEAD"
                    ? undefined
                    : await request.arrayBuffer(),
            duplex: "half",
        } as RequestInit
    );

    return loadBalancer.handleRequest(proxyRequest);
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
export const OPTIONS = handler;
export const HEAD = handler;
