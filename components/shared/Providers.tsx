'use client';

import React, { useState } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { getQueryClient } from '@/lib/query-client';
import { RefreshProvider } from '@/context/RefreshContext';
import { ProjectProvider } from '@/context/ProjectContext';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => getQueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <ProjectProvider>
        <RefreshProvider>
          {children}
        </RefreshProvider>
      </ProjectProvider>
      {process.env.NODE_ENV === 'development' && typeof ReactQueryDevtools === 'function' && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  );
}

