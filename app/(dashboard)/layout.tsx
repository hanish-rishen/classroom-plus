'use client';

import { LayoutProvider } from '@/components/layout-context';
import Sidebar from '@/components/sidebar';
import { ThemeProvider } from '@/components/theme-provider';
import { ColorThemeProvider } from '@/components/theme-colors';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SessionProvider } from 'next-auth/react';
import { CartProvider } from '@/contexts/CartContext';
import { useState } from 'react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
      },
    },
  }));

  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <ColorThemeProvider>
            <CartProvider>
              <LayoutProvider>
                <div className="min-h-screen bg-muted/30 p-2">
                  <div className="flex h-[calc(100vh-1rem)] gap-2">
                    <Sidebar />
                    <div className="flex-1 overflow-hidden rounded-xl border bg-background/80 backdrop-blur-lg shadow-lg">
                      <div className="h-full overflow-y-auto p-4">
                        <main className="h-full">{children}</main>
                      </div>
                    </div>
                  </div>
                </div>
              </LayoutProvider>
            </CartProvider>
          </ColorThemeProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </SessionProvider>
  );
}