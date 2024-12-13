import { LayoutProvider } from '@/components/layout-context';
import Sidebar from '@/components/sidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <LayoutProvider>
      <div className="min-h-screen bg-muted/30 p-2">
        <div className="flex h-[calc(100vh-1rem)] gap-2">
          <Sidebar />
          <div className="flex-1 overflow-hidden rounded-xl border bg-background/80 backdrop-blur-lg shadow-lg">
            <div className="h-full overflow-y-auto">
              <main className="p-4">{children}</main>
            </div>
          </div>
        </div>
      </div>
    </LayoutProvider>
  );
}