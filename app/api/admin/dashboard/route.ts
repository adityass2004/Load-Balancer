import { NextResponse } from 'next/server';
import { analyticsService } from '@/services/analytics/AnalyticsService';

export async function GET() {
  try {
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
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}
