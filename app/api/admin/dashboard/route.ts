import { NextRequest, NextResponse } from 'next/server';
import { analyticsService } from '@/services/analytics/AnalyticsService';
import { requireAdmin } from '@/lib/auth/require-admin';
import { UnauthorizedError, ForbiddenError } from '@/lib/errors';
import { getClientIp } from '@/lib/client-ip';
import { rateLimit } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const clientIp = getClientIp(request);
  const limited = await rateLimit('admin:ip', clientIp, request);
  if (limited) return limited;

  try {
    await requireAdmin();

    const [
      stats,
      serverMetrics,
      requestsOverTime,
      responseTimeOverTime,
      requestsPerServer,
      healthDistribution,
      activeConnections,
    ] = await Promise.all([
      analyticsService.getDashboardStats(),
      analyticsService.getServerMetrics(),
      analyticsService.getRequestsOverTime(24),
      analyticsService.getResponseTimeOverTime(24),
      analyticsService.getRequestsPerServer(),
      analyticsService.getHealthDistribution(),
      analyticsService.getActiveConnectionsOverTime(),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        stats: stats.success ? stats.data : null,
        serverMetrics: serverMetrics.success ? serverMetrics.data : [],
        requestsOverTime: requestsOverTime.success ? requestsOverTime.data : [],
        responseTimeOverTime: responseTimeOverTime.success ? responseTimeOverTime.data : [],
        requestsPerServer: requestsPerServer.success ? requestsPerServer.data : [],
        healthDistribution: healthDistribution.success ? healthDistribution.data : [],
        activeConnections: activeConnections.success ? activeConnections.data : [],
      },
    });
  } catch (error: any) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 401 }
      );
    }
    if (error instanceof ForbiddenError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 403 }
      );
    }
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}
