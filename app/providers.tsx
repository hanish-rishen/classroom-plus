'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode, useState } from 'react';
import { PostHogProvider } from './providers/posthog';

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
      },
    },
  }));

  return (
    <PostHogProvider>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </PostHogProvider>
  );
}
