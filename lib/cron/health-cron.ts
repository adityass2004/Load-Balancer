import crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { healthScheduler } from '@/services/health/HealthScheduler';
import { getClientIp } from '@/lib/client-ip';
import { rateLimit } from '@/lib/rate-limit';

let lastCronExecution = 0;
let lastDisabledLog = 0;

export function _resetCronThrottleForTesting(): void {
  lastCronExecution = 0;
  lastDisabledLog = 0;
}

export async function handleHealthCron(request: NextRequest): Promise<NextResponse> {
  // 1. Per-IP Rate Limit (BEFORE auth check)
  const clientIp = getClientIp(request);
  const limited = await rateLimit('cron:ip', clientIp, request);
  if (limited) {
    return limited;
  }

  // 2. Auth Check (fail-closed if CRON_SECRET is missing/empty or shorter than 16 chars)
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret || cronSecret.length < 16) {
    const now = Date.now();
    if (now - lastDisabledLog >= 60_000) {
      lastDisabledLog = now;
      console.error('[CRON] CRON_SECRET is not configured; cron endpoint disabled');
    }
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Require Authorization: Bearer <secret>
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const token = authHeader.slice(7);
  // Constant-time comparison using SHA-256 digests to prevent length-leak and throws
  const expectedHash = crypto.createHash('sha256').update(cronSecret).digest();
  const providedHash = crypto.createHash('sha256').update(token).digest();

  if (!crypto.timingSafeEqual(expectedHash, providedHash)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 3. Execution Cooldown & Health Probe
  try {
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
