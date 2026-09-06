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
    await cacheInitializer.init();
    await ensureFreshCacheForProxy();

    const { path } = await context.params;
    const url = new URL(request.url);

    if (!path || path.length === 0) {
        return NextResponse.json({ message: "Invalid request path." }, { status: 400 });
    }

    const firstSegment = path[0];

    // Preserve system endpoints (/api/health, /api/admin/*, /api/cron/*)
    if (SYSTEM_ROUTES.has(firstSegment.toLowerCase())) {
        if (firstSegment.toLowerCase() === "health" && path.length === 1) {
            return NextResponse.json({ status: "ok", timestamp: new Date().toISOString() });
        }
        return NextResponse.json({ message: "System endpoint not found." }, { status: 404 });
    }

    // 1. Resolve the project exclusively from the public path segment.
    // Headers and query parameters must not be able to change the project
    // selected by /api/{projectSlug}/..., otherwise an unknown path could be
    // redirected into another project's backend pool.
    const project = await cacheService.resolveProject(firstSegment);

    if (!project || project.slug !== firstSegment) {
        return NextResponse.json(
            { message: "Project not found." },
            { status: 404 }
        );
    }

    if (!project.enabled) {
        return NextResponse.json(
            { message: "Project is disabled." },
            { status: 403 }
        );
    }

    // 2. Project health shortcut: /api/{projectSlug} has no backend path.
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
                { status: 503 }
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
            { status: overallHealthy ? 200 : 503 }
        );
    }

    // 3. Compute backend path (strip projectSlug segment if path-based resolution)
    const remainingSegments = path.slice(1);
    const backendPath = `/${remainingSegments.join("/")}${url.search}`;

    let reqBody: ArrayBuffer | undefined = undefined;
    if (request.method !== "GET" && request.method !== "HEAD") {
        try {
            const buf = await request.arrayBuffer();
            if (buf.byteLength > 0) {
                reqBody = buf;
            }
        } catch {
            // body is empty or unreadable
        }
    }

    const proxyRequest = new Request(
        new URL(backendPath, "http://proxy.internal").toString(),
        {
            method: request.method,
            headers: request.headers,
            body: reqBody,
        }
    );

    return loadBalancer.handleRequest(proxyRequest, project, backendPath);
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
export const OPTIONS = handler;
export const HEAD = handler;
