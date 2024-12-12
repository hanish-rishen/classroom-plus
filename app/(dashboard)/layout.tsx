import { LayoutProvider } from '@/components/layout-context';
import Sidebar from '@/components/sidebar';
import Header from '@/components/header';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
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
  );
}