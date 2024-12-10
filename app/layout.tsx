import './globals.css';
import type { Metadata } from 'next';
import localFont from 'next/font/local';
import { ThemeProvider } from '@/components/theme-provider';
import { LayoutProvider } from '@/components/layout-context';
import Sidebar from '@/components/sidebar';
import Header from '@/components/header';
import { ColorThemeProvider } from '@/components/theme-colors';

const hostGrotesk = localFont({
  src: [
    {
      path: '../public/fonts/HostGrotesk-VariableFont_wght.ttf',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../public/fonts/HostGrotesk-VariableFont_wght.ttf',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../public/fonts/HostGrotesk-VariableFont_wght.ttf',
      weight: '700',
      style: 'normal',
    }
  ],
  variable: '--font-host-grotesk'
});

export const metadata: Metadata = {
  title: 'Classroom Plus',
  description: 'Enhanced Google Classroom Experience',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const theme = localStorage.getItem('color-theme') || 'pink';
                document.documentElement.style.setProperty('--primary', \`var(--\${theme})\`);
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body className={`${hostGrotesk.variable} font-sans`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <ColorThemeProvider>
            <LayoutProvider>
              <div className="min-h-screen">
                <div className="flex h-screen overflow-hidden">
                  <Sidebar />
                  <div className="flex-1 flex flex-col overflow-hidden">
                    <Header />
                    <div className="flex-1 overflow-y-auto">
                      <main className="p-4 md:p-6">{children}</main>
                    </div>
                  </div>
                </div>
              </div>
            </LayoutProvider>
          </ColorThemeProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}