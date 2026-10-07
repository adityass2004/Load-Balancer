'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { UserPlus, Trash2, Shield, ShieldCheck, AlertCircle, CheckCircle2 } from 'lucide-react';
import { addAdminAction, removeAdminAction } from '@/actions/team.actions';
import type { AdminUser } from '@/src/generated/prisma';

export function TeamManagementClient({
  admins: initialAdmins,
  currentAdminEmail,
}: {
  admins: AdminUser[];
  currentAdminEmail: string;
}) {
  const router = useRouter();
  const [admins, setAdmins] = useState<AdminUser[]>(initialAdmins);
  const [emailInput, setEmailInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim()) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await addAdminAction(emailInput.trim());
      if (res.success) {
        setSuccess(`Added ${res.data.email} as ADMIN`);
        setEmailInput('');
        setAdmins((prev) => [...prev, res.data]);
        router.refresh();
      } else {
        setError(res.error);
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to add admin');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveAdmin = async (id: string, email: string) => {
    if (!confirm(`Are you sure you want to remove ${email} from the admin team?`)) {
      return;
    }

    setRemovingId(id);
    setError(null);
    setSuccess(null);

    try {
      const res = await removeAdminAction(id);
      if (res.success) {
        setSuccess(`Removed ${email} from admin team`);
        setAdmins((prev) => prev.filter((a) => a.id !== id));
        router.refresh();
      } else {
        setError(res.error);
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to remove admin');
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Alert Banners */}
      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-600" />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800">
          <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-green-600" />
          <span>{success}</span>
        </div>
      )}

      {/* Add Admin Form */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-base font-semibold text-gray-900">Add New Administrator</h2>
        <p className="mt-1 text-sm text-gray-500">
          Allowlist a Google account to grant access to the Load Balancer dashboard.
        </p>

        <form onSubmit={handleAddAdmin} className="mt-4 flex gap-3">
          <input
            type="email"
            value={emailInput}
            onChange={(e) => setEmailInput(e.target.value)}
            placeholder="colleague@gmail.com"
            required
            className="flex-1 rounded-lg border border-gray-300 px-3.5 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
          />
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 disabled:opacity-50"
          >
            <UserPlus className="h-4 w-4" />
            <span>{loading ? 'Adding...' : 'Add Admin'}</span>
          </button>
        </form>
      </div>

      {/* Admins Table */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-gray-200 px-6 py-4">
          <h3 className="text-base font-semibold text-gray-900">Allowlisted Administrators ({admins.length})</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-left text-sm">
            <thead className="bg-gray-50 text-xs font-semibold uppercase tracking-wider text-gray-500">
              <tr>
                <th className="px-6 py-3">Email</th>
                <th className="px-6 py-3">Role</th>
                <th className="px-6 py-3">Added By</th>
                <th className="px-6 py-3">Added At</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {admins.map((admin) => {
                const isCurrent = admin.email.toLowerCase() === currentAdminEmail.toLowerCase();
                const isOwner = admin.role === 'OWNER';

                return (
                  <tr key={admin.id} className="hover:bg-gray-50/50">
                    <td className="px-6 py-4 font-medium text-gray-900">
                      <div className="flex items-center gap-2">
                        {admin.email}
                        {isCurrent && (
                          <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-semibold text-blue-700">
                            You
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          isOwner
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {isOwner ? (
                          <ShieldCheck className="h-3.5 w-3.5" />
                        ) : (
                          <Shield className="h-3.5 w-3.5" />
                        )}
                        {admin.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {admin.addedBy || 'System Bootstrap'}
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {new Date(admin.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {isCurrent ? (
                        <span className="text-xs text-gray-400 italic">Cannot remove self</span>
                      ) : (
                        <button
                          onClick={() => handleRemoveAdmin(admin.id, admin.email)}
                          disabled={removingId === admin.id}
                          className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-white px-2.5 py-1 text-xs font-semibold text-red-600 shadow-sm hover:bg-red-50 hover:border-red-300 disabled:opacity-50"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span>{removingId === admin.id ? 'Removing...' : 'Remove'}</span>
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
