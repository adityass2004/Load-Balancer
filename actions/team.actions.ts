'use server';

import { z } from 'zod';
import { prisma } from '@/lib/db';
import { requireOwner, requireAdmin } from '@/lib/auth/require-admin';
import { AdminRole, type AdminUser } from '@/src/generated/prisma';
import { fail, ok } from '@/lib/response';
import type { ActionResult } from '@/types/api';

const emailSchema = z.string().email('Invalid email address');
const idSchema = z.string().min(1, 'Admin user ID is required');

export async function getAdminsAction(): Promise<ActionResult<AdminUser[]>> {
  try {
    await requireOwner();
    const admins = await prisma.adminUser.findMany({
      orderBy: { createdAt: 'asc' },
    });
    return ok(admins);
  } catch (e) {
    return fail(e);
  }
}

export async function getCurrentAdminAction(): Promise<ActionResult<AdminUser>> {
  try {
    const admin = await requireAdmin();
    return ok(admin);
  } catch (e) {
    return fail(e);
  }
}

export async function addAdminAction(
  rawEmail: string
): Promise<ActionResult<AdminUser>> {
  try {
    const currentOwner = await requireOwner();

    const parsed = emailSchema.safeParse(rawEmail);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message };
    }

    const email = parsed.data.toLowerCase().trim();

    const existing = await prisma.adminUser.findUnique({
      where: { email },
    });

    if (existing) {
      return { success: false, error: 'User is already an allowlisted admin' };
    }

    const newAdmin = await prisma.adminUser.create({
      data: {
        email,
        role: AdminRole.ADMIN,
        addedBy: currentOwner.email,
      },
    });

    return ok(newAdmin, 'Admin added successfully');
  } catch (e) {
    return fail(e);
  }
}

export async function removeAdminAction(
  rawId: string
): Promise<ActionResult<void>> {
  try {
    const currentOwner = await requireOwner();

    const parsed = idSchema.safeParse(rawId);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message };
    }

    const id = parsed.data;

    const targetUser = await prisma.adminUser.findUnique({
      where: { id },
    });

    if (!targetUser) {
      return { success: false, error: 'Target admin user not found' };
    }

    // Prevent OWNER from removing themselves
    if (targetUser.id === currentOwner.id || targetUser.email === currentOwner.email) {
      return { success: false, error: 'You cannot remove your own account' };
    }

    // Prevent removing the last OWNER
    if (targetUser.role === AdminRole.OWNER) {
      const ownerCount = await prisma.adminUser.count({
        where: { role: AdminRole.OWNER },
      });
      if (ownerCount <= 1) {
        return { success: false, error: 'Cannot remove the last OWNER account' };
      }
    }

    await prisma.adminUser.delete({
      where: { id },
    });

    return ok(undefined, 'Admin removed successfully');
  } catch (e) {
    return fail(e);
  }
}
