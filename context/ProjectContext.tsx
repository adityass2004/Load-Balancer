'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getProjectsAction } from '@/actions/project.actions';
import type { Project } from '@/types/domain';

type ProjectContextValue = {
  projects: Project[];
  selectedProjectId: string | null;
  selectedProject: Project | null;
  isLoading: boolean;
  setSelectedProjectId: (id: string | null) => void;
};

const ProjectContext = createContext<ProjectContextValue | null>(null);

const STORAGE_KEY = 'trackit-selected-project-id';

export function ProjectProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [selectedProjectId, setSelectedProjectIdState] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const { data: projectsRes, isLoading } = useQuery({
    queryKey: ['projects', 'list'],
    queryFn: () => getProjectsAction({ pageSize: 100 }),
    staleTime: 30_000,
  });

  const projects = projectsRes?.success ? projectsRes.data : [];

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved !== null) {
      setSelectedProjectIdState(saved === 'ALL' ? null : saved);
    }
    setIsInitialized(true);
  }, []);

  // Validate saved project ID against fetched projects
  useEffect(() => {
    if (isInitialized && selectedProjectId && projects.length > 0) {
      const exists = projects.some((p) => p.id === selectedProjectId);
      if (!exists) {
        setSelectedProjectIdState(null);
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, [projects, selectedProjectId, isInitialized]);

  const setSelectedProjectId = useCallback(
    (id: string | null) => {
      setSelectedProjectIdState(id);
      if (id === null) {
        localStorage.setItem(STORAGE_KEY, 'ALL');
      } else {
        localStorage.setItem(STORAGE_KEY, id);
      }

      // Invalidate dependent query caches so metrics, servers, logs, analytics refetch!
      queryClient.invalidateQueries({ queryKey: ['servers'] });
      queryClient.invalidateQueries({ queryKey: ['logs'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
      queryClient.invalidateQueries({ queryKey: ['settings'] });
    },
    [queryClient]
  );

  const selectedProject = selectedProjectId
    ? projects.find((p) => p.id === selectedProjectId) ?? null
    : null;

  return (
    <ProjectContext.Provider
      value={{
        projects,
        selectedProjectId,
        selectedProject,
        isLoading,
        setSelectedProjectId,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
}

export function useProject() {
  const ctx = useContext(ProjectContext);
  if (!ctx) throw new Error('useProject must be used inside ProjectProvider');
  return ctx;
}
