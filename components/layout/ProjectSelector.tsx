'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useProject } from '@/context/ProjectContext';
import { Layers, ChevronDown, Check, Folder, Loader2, Plus } from 'lucide-react';
import { CreateProjectModal } from '@/components/projects/CreateProjectModal';

export function ProjectSelector() {
  const { projects, selectedProjectId, selectedProject, isLoading, setSelectedProjectId } =
    useProject();
  const [isOpen, setIsOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (id: string | null) => {
    setSelectedProjectId(id);
    setIsOpen(false);
  };

  const handleOpenModal = () => {
    setIsOpen(false);
    setIsModalOpen(true);
  };

  return (
    <>
      <div className="relative inline-block text-left" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          disabled={isLoading}
          className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-semibold text-gray-800 shadow-sm transition-all hover:bg-gray-100 hover:border-gray-300 focus:outline-none"
        >
          <span className="flex h-5 w-5 items-center justify-center rounded bg-gray-900 text-white">
            <Layers className="h-3 w-3" />
          </span>
          {isLoading ? (
            <span className="inline-flex items-center gap-1.5 text-gray-500">
              <Loader2 className="h-3 w-3 animate-spin" />
              Loading projects...
            </span>
          ) : (
            <span className="truncate max-w-[140px]">
              {selectedProject ? selectedProject.name : 'All Projects'}
            </span>
          )}
          <ChevronDown className={`h-3.5 w-3.5 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div className="absolute left-0 mt-2 w-60 origin-top-left rounded-xl border border-gray-200 bg-white p-1.5 shadow-lg ring-1 ring-black/5 focus:outline-none z-50 animate-in fade-in-50 zoom-in-95">
            <div className="px-2 py-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-400">
              Select Active Project
            </div>

            {/* Option: All Projects */}
            <button
              onClick={() => handleSelect(null)}
              className={`flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-xs font-medium transition-colors ${
                selectedProjectId === null
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <span className="flex items-center gap-2">
                <Folder className="h-3.5 w-3.5" />
                All Projects
              </span>
              {selectedProjectId === null && <Check className="h-3.5 w-3.5 text-white" />}
            </button>

            <div className="my-1 border-t border-gray-100" />

            {/* Project List */}
            {projects.length === 0 ? (
              <div className="px-2.5 py-2 text-xs text-gray-400 italic">No projects found</div>
            ) : (
              <div className="max-h-48 overflow-y-auto space-y-0.5">
                {projects.map((project) => {
                  const isSelected = selectedProjectId === project.id;
                  return (
                    <button
                      key={project.id}
                      onClick={() => handleSelect(project.id)}
                      className={`flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-xs font-medium transition-colors ${
                        isSelected
                          ? 'bg-gray-900 text-white'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <span className="flex items-center gap-2 truncate">
                        <span
                          className={`h-2 w-2 rounded-full ${
                            project.enabled ? 'bg-green-500' : 'bg-gray-300'
                          }`}
                        />
                        <span className="truncate">{project.name}</span>
                        {!project.enabled && (
                          <span className="rounded bg-gray-100 px-1 py-0.2 text-[9px] text-gray-500 border border-gray-200">
                            Disabled
                          </span>
                        )}
                      </span>
                      {isSelected && <Check className="h-3.5 w-3.5 text-white" />}
                    </button>
                  );
                })}
              </div>
            )}

            <div className="my-1 border-t border-gray-100" />

            {/* Action: Add Project */}
            <button
              onClick={handleOpenModal}
              className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-semibold text-gray-900 hover:bg-gray-100 transition-colors"
            >
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-gray-900 text-white">
                <Plus className="h-3 w-3" />
              </span>
              Create New Project...
            </button>
          </div>
        )}
      </div>

      {/* Modal */}
      <CreateProjectModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}

