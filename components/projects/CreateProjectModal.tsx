'use client';

import React, { useState } from 'react';
import { X, Plus, Loader2, FolderPlus, CheckCircle, AlertCircle } from 'lucide-react';
import { useCreateProject } from '@/hooks/useProjects';
import { useProject } from '@/context/ProjectContext';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateProjectModal({ isOpen, onClose }: CreateProjectModalProps) {
  const { setSelectedProjectId } = useProject();
  const createProject = useCreateProject();

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [enabled, setEnabled] = useState(true);
  const [isAutoSlug, setIsAutoSlug] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleNameChange = (val: string) => {
    setName(val);
    if (isAutoSlug) {
      const generated = val
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-');
      setSlug(generated);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!name.trim()) {
      setErrorMsg('Project name is required');
      return;
    }
    if (!slug.trim()) {
      setErrorMsg('Project slug is required');
      return;
    }

    try {
      const res = await createProject.mutateAsync({
        name: name.trim(),
        slug: slug.trim().toLowerCase(),
        description: description.trim() || undefined,
        enabled,
      });

      if (!res.success) {
        setErrorMsg(res.error || 'Failed to create project');
        return;
      }

      // Automatically select the newly created project!
      if (res.data?.id) {
        setSelectedProjectId(res.data.id);
      }

      // Reset form and close modal
      setName('');
      setSlug('');
      setDescription('');
      setEnabled(true);
      setIsAutoSlug(true);
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.message || 'An unexpected error occurred');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in-50">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl transition-all animate-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 pb-4">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-900 text-white shadow-sm">
              <FolderPlus className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-base font-bold text-gray-900">Create New Project</h2>
              <p className="text-xs text-gray-500">Add a project to route & monitor backend servers</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-red-50 p-3 text-xs font-medium text-red-700 border border-red-100">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Name Field */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Project Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="e.g. TrackIt or SkillTrade"
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-xs text-gray-900 font-medium placeholder-gray-400 focus:border-gray-900 focus:bg-white focus:outline-none transition-all shadow-sm"
              required
            />
          </div>

          {/* Slug Field */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-gray-700">
                Project Slug <span className="text-red-500">*</span>
              </label>
              <span className="text-[10px] text-gray-400">Unique URL identifier</span>
            </div>
            <input
              type="text"
              value={slug}
              onChange={(e) => {
                setIsAutoSlug(false);
                setSlug(e.target.value);
              }}
              placeholder="e.g. trackit"
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-xs text-gray-900 font-mono font-medium placeholder-gray-400 focus:border-gray-900 focus:bg-white focus:outline-none transition-all shadow-sm"
              required
            />
          </div>

          {/* Description Field */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Description <span className="text-gray-400 font-normal">(Optional)</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of the application load balancing workload..."
              rows={3}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-xs text-gray-900 font-medium placeholder-gray-400 focus:border-gray-900 focus:bg-white focus:outline-none transition-all shadow-sm resize-none"
            />
          </div>

          {/* Enabled Toggle */}
          <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 p-3">
            <div>
              <div className="text-xs font-bold text-gray-900">Enable Project</div>
              <div className="text-[11px] text-gray-500">Allow traffic routing & health monitoring</div>
            </div>
            <button
              type="button"
              onClick={() => setEnabled(!enabled)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                enabled ? 'bg-green-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  enabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-2.5 border-t border-gray-100 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createProject.isPending}
              className="inline-flex items-center gap-1.5 rounded-xl bg-gray-900 px-4 py-2 text-xs font-semibold text-white shadow-md hover:bg-gray-800 focus:outline-none transition-all disabled:opacity-50"
            >
              {createProject.isPending ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="h-3.5 w-3.5" />
                  Create Project
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
