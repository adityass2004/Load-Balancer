import { NextRequest, NextResponse } from 'next/server';
import { projectService } from '@/services/project.service';
import { updateProjectSchema } from '@/lib/validations';
import { requireAdmin } from '@/lib/auth/require-admin';
import { UnauthorizedError, ForbiddenError } from '@/lib/errors';
import { getClientIp } from '@/lib/client-ip';
import { rateLimit } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const clientIp = getClientIp(request);
  const limited = await rateLimit('admin:ip', clientIp, request);
  if (limited) return limited;

  try {
    await requireAdmin();
    const { id } = await context.params;
    const result = await projectService.getById(id);
    return NextResponse.json(result, { status: result.success ? 200 : 404 });
  } catch (error: any) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ success: false, error: error.message }, { status: 401 });
    }
    if (error instanceof ForbiddenError) {
      return NextResponse.json({ success: false, error: error.message }, { status: 403 });
    }
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to fetch project' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const clientIp = getClientIp(request);
  const limited = await rateLimit('admin:ip', clientIp, request);
  if (limited) return limited;

  try {
    await requireAdmin();
    const { id } = await context.params;
    const body = await request.json();

    const parsed = updateProjectSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const result = await projectService.update(id, parsed.data);
    return NextResponse.json(result, { status: result.success ? 200 : 400 });
  } catch (error: any) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ success: false, error: error.message }, { status: 401 });
    }
    if (error instanceof ForbiddenError) {
      return NextResponse.json({ success: false, error: error.message }, { status: 403 });
    }
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to update project' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const clientIp = getClientIp(request);
  const limited = await rateLimit('admin:ip', clientIp, request);
  if (limited) return limited;

  try {
    await requireAdmin();
    const { id } = await context.params;
    const result = await projectService.delete(id);
    return NextResponse.json(result, { status: result.success ? 200 : 400 });
  } catch (error: any) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ success: false, error: error.message }, { status: 401 });
    }
    if (error instanceof ForbiddenError) {
      return NextResponse.json({ success: false, error: error.message }, { status: 403 });
    }
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to delete project' },
      { status: 500 }
    );
  }
}
