'use client';

import { ThemeProvider } from '@/components/theme-provider';
import { ColorThemeProvider } from '@/components/theme-colors';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <ColorThemeProvider>
        {children}
      </ColorThemeProvider>
    </ThemeProvider>
  );
}
