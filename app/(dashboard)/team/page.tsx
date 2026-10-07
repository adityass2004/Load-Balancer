import { requireOwner } from '@/lib/auth/require-admin';
import { prisma } from '@/lib/db';
import { TeamManagementClient } from '@/components/team/TeamManagementClient';
import { ShieldAlert } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'Team Management - TrackIt Load Balancer',
  description: 'Manage allowlisted administrators and roles',
};

export default async function TeamPage() {
  let currentOwner;
  try {
    currentOwner = await requireOwner();
  } catch {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center p-6 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-100 text-red-600">
          <ShieldAlert className="h-8 w-8" />
        </div>
        <h1 className="mt-4 text-2xl font-bold text-gray-900">Access Denied</h1>
        <p className="mt-2 max-w-md text-sm text-gray-600">
          Only users with the <strong>OWNER</strong> role can access Team Management and manage administrator allowlists.
        </p>
        <Link
          href="/dashboard"
          className="mt-6 inline-flex items-center rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-800"
        >
          Return to Dashboard
        </Link>
      </div>
    );
  }

  const admins = await prisma.adminUser.findMany({
    orderBy: { createdAt: 'asc' },
  });

  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Team Management</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage allowlisted Google accounts authorized to configure the TrackIt Load Balancer.
        </p>
      </div>

      <TeamManagementClient admins={admins} currentAdminEmail={currentOwner.email} />
    </div>
  );
}
