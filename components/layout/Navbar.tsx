'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Plus } from 'lucide-react';
import { useRefresh, REFRESH_INTERVALS } from '@/context/RefreshContext';
import { ProjectSelector } from '@/components/layout/ProjectSelector';
import { CreateProjectModal } from '@/components/projects/CreateProjectModal';

const NAV_LINKS = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/servers', label: 'Servers' },
  { href: '/logs', label: 'Logs' },
];

export function Navbar() {
  const pathname = usePathname();
  const { enabled, intervalMs, setEnabled, setIntervalMs, toggle } = useRefresh();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <nav className="sticky top-0 z-30 border-b border-gray-200 bg-white/90 backdrop-blur-sm px-6 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2 font-bold text-lg tracking-tight text-gray-900">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-gray-900 text-white text-xs font-bold">
              LB
            </span>
            Load-Balancer
          </Link>
          
          <div className="flex items-center gap-2">
            <ProjectSelector />
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-gray-700 shadow-sm transition-all hover:bg-gray-50 hover:border-gray-300"
              title="Create new project"
            >
              <Plus className="h-3.5 w-3.5 text-gray-900" />
              <span>Project</span>
            </button>
          </div>

          <div className="flex items-center gap-1 border-l border-gray-200 pl-4">
            {NAV_LINKS.map(({ href, label }) => {
              const active = pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                    active
                      ? 'bg-gray-100 text-gray-900'
                      : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'
                  }`}
                >
                  {label}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Global Refresh Controls */}
        <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 shadow-inner">
          <div className="flex items-center gap-2">
            <button
              onClick={toggle}
              className={`flex items-center gap-1.5 rounded px-2 py-1 text-xs font-semibold uppercase tracking-wider transition-all duration-200 ${
                enabled
                  ? 'bg-green-600 text-white shadow-sm'
                  : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
              }`}
            >
              <span className={`h-2 w-2 rounded-full ${enabled ? 'bg-white animate-pulse' : 'bg-gray-500'}`} />
              {enabled ? 'Auto' : 'Paused'}
            </button>
          </div>

          {enabled && (
            <div className="flex items-center gap-1 border-l border-gray-200 pl-3">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Interval:</span>
              <select
                value={intervalMs}
                onChange={(e) => setIntervalMs(Number(e.target.value))}
                className="bg-transparent text-xs font-semibold text-gray-700 focus:outline-none cursor-pointer"
              >
                {REFRESH_INTERVALS.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </nav>

      {/* Create Project Modal */}
      <CreateProjectModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}

