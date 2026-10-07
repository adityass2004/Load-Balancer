import { NextRequest, NextResponse } from 'next/server';
import { projectService } from '@/services/project.service';
import { createProjectSchema, projectQuerySchema } from '@/lib/validations';
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

    const { searchParams } = new URL(request.url);
    const queryInput = {
      page: searchParams.get('page') ?? undefined,
      pageSize: searchParams.get('pageSize') ?? undefined,
      search: searchParams.get('search') ?? undefined,
      enabled: searchParams.has('enabled') ? searchParams.get('enabled') === 'true' : undefined,
      sortField: searchParams.get('sortField') ?? undefined,
      sortOrder: searchParams.get('sortOrder') ?? undefined,
    };

    const parsed = projectQuerySchema.safeParse(queryInput);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const result = await projectService.getAll(parsed.data);
    return NextResponse.json(result, { status: result.success ? 200 : 400 });
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
      { success: false, error: error?.message || 'Failed to fetch projects' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const clientIp = getClientIp(request);
  const limited = await rateLimit('admin:ip', clientIp, request);
  if (limited) return limited;

  try {
    await requireAdmin();

    const body = await request.json();
    const parsed = createProjectSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const result = await projectService.create(parsed.data);
    return NextResponse.json(result, { status: result.success ? 201 : 400 });
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
      { success: false, error: error?.message || 'Failed to create project' },
      { status: 500 }
    );
  }
}
