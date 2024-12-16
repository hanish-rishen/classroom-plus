import './globals.css';
import type { Metadata } from 'next';
import localFont from 'next/font/local';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';

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
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}