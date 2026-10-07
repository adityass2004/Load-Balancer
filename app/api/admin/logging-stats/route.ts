import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/require-admin';
import { UnauthorizedError, ForbiddenError } from '@/lib/errors';
import { getClientIp } from '@/lib/client-ip';
import { rateLimit } from '@/lib/rate-limit';
import { getLogQueue } from '@/services/logging/LogQueue';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const clientIp = getClientIp(request);
  const limited = await rateLimit('admin:ip', clientIp, request);
  if (limited) return limited;

  try {
    await requireAdmin();

    const stats = getLogQueue().stats();

    return NextResponse.json({
      success: true,
      data: stats,
    });
  } catch (error: unknown) {
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
    const msg = error instanceof Error ? error.message : 'Failed to fetch logging stats';
    return NextResponse.json(
      { success: false, error: msg },
      { status: 500 }
    );
  }
}
