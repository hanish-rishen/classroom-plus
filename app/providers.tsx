'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode, useEffect, useState } from 'react';
import { PostHog } from '@/lib/posthog';
import { usePathname, useSearchParams } from 'next/navigation';

function PostHogPageview(): JSX.Element {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (pathname) {
      let url = window.origin + pathname;
      if (searchParams?.toString()) {
        url = url + `?${searchParams.toString()}`;
      }
      PostHog.capture('$pageview', {
        $current_url: url,
      });
    }
  }, [pathname, searchParams]);

  return <></>;
}

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
    <QueryClientProvider client={queryClient}>
      <PostHogPageview />
      {children}
    </QueryClientProvider>
  );
}
