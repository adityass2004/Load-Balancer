import { NextResponse } from 'next/server';
import { healthScheduler } from '@/services/health/HealthScheduler';

export const dynamic = 'force-dynamic';

let lastCronExecution = 0;

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const now = Date.now();
    if (now - lastCronExecution < 10_000) {
      return NextResponse.json({
        success: true,
        message: 'Health check cycle already executed recently within 10s',
        skipped: true,
      });
    }

    lastCronExecution = now;

    const results = await healthScheduler.checkAllServers();

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      resultsCount: results.length,
      results,
    });
  } catch (error) {
    console.error('[CRON] Health check failed:', error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
