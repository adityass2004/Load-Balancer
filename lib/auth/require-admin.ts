import 'server-only';
import { auth } from '@/auth';
import { prisma } from '@/lib/db';
import { AdminRole, type AdminUser } from '@/src/generated/prisma';
import { UnauthorizedError, ForbiddenError } from '@/lib/errors';

/**
 * Ensures the caller has an active session and is an authorized AdminUser (ADMIN or OWNER).
 * Always re-verifies against the database to prevent stale permissions.
 * Throws UnauthorizedError (401) if not authenticated.
 * Throws ForbiddenError (403) if not allowlisted.
 */
export async function requireAdmin(): Promise<AdminUser> {
  const session = await auth();

  if (!session?.user?.email) {
    throw new UnauthorizedError('Authentication required');
  }

  const email = session.user.email.toLowerCase().trim();

  const adminUser = await prisma.adminUser.findUnique({
    where: { email },
  });

  if (!adminUser) {
    throw new ForbiddenError('Access denied: account is not allowlisted');
  }

  return adminUser;
}

/**
 * Ensures the caller is an active AdminUser with the OWNER role.
 * Throws UnauthorizedError (401) if not authenticated.
 * Throws ForbiddenError (403) if not allowlisted or role is not OWNER.
 */
export async function requireOwner(): Promise<AdminUser> {
  const adminUser = await requireAdmin();

  if (adminUser.role !== AdminRole.OWNER) {
    throw new ForbiddenError('Access denied: OWNER role required');
  }

  return adminUser;
}
