'use client';

import posthog from 'posthog-js';

if (typeof window !== 'undefined') {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com',
    loaded: (ph) => {
      if (process.env.NODE_ENV === 'development') ph.debug();
    },
    capture_pageview: false, // Disable automatic pageview capture
    persistence: 'localStorage',
  });
}

export const PostHog = posthog;
