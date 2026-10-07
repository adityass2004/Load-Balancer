import { NextRequest } from 'next/server';
import { handleHealthCron } from '@/lib/cron/health-cron';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  return handleHealthCron(request);
}
