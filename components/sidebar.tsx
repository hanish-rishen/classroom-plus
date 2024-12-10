'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useLayout } from '@/components/layout-context';
import {
  LayoutDashboard,
  ClipboardList, // Replace BookOpen with ClipboardList for assignments
  FolderOpen,
  Calendar,
  Users, // Replace GraduationCap with Users for classes
  X,
  ChevronLeft,
  PlusCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Assignments', href: '/assignments', icon: ClipboardList }, // Changed icon
  { name: 'Resources', href: '/resources', icon: FolderOpen },
  { name: 'Calendar', href: '/calendar', icon: Calendar },
  { name: 'Classes', href: '/classes', icon: Users }, // Changed icon
];

export default function Sidebar() {
  const { sidebarOpen, toggleSidebar } = useLayout();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();

  // Close sidebar on route change on mobile
  useEffect(() => {
    if (window.innerWidth < 768) {
      toggleSidebar();
    }
  }, [pathname]);

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-50 transform border-r transition-all duration-200 ease-in-out md:static',
          'mt-0',
          'backdrop-blur-lg bg-background/80', // Added blur effect
          isCollapsed ? 'w-16 md:w-16' : 'w-64',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        )}
      >
        <div className="flex h-16 items-center justify-between px-4">
          <div className={cn(
            "flex items-center gap-2 transition-all duration-200",
            !isCollapsed && "border-2 border-primary/20 rounded-full px-3 py-1",
            isCollapsed && "w-full justify-center" // Center when collapsed
          )}>
            <span className={cn(
              "text-lg font-bold tracking-tight transition-all duration-200",
              isCollapsed && "md:hidden"
            )}>
              Classroom
            </span>
            <div className={cn(
              "relative flex items-center justify-center transition-all duration-200",
              !isCollapsed && "-mr-1",
              isCollapsed && "scale-125" // Make icon bigger when collapsed
            )}>
              <div className={cn(
                "absolute inset-0 rounded-full border-2 border-primary",
                isCollapsed ? "opacity-100" : "opacity-40",
                isCollapsed && "border-[3px]" // Thicker border when collapsed
              )} />
              <div className={cn(
                "rounded-full border-2 border-primary",
                isCollapsed && "border-[3px] p-1", // Thicker border and more padding when collapsed
                !isCollapsed && "p-[2px]"
              )}>
                <PlusCircle className={cn(
                  "text-primary",
                  isCollapsed ? "h-5 w-5" : "h-4 w-4"
                )} />
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "md:hidden relative",
              "border-2 border-primary/20 rounded-full", // Added circle outline
              "hover:bg-background/50" // Softer hover effect
            )}
            onClick={toggleSidebar}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <nav className="space-y-1 p-2">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                pathname === item.href
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-muted'
              )}
            >
              <item.icon className={cn("h-5 w-5", !isCollapsed && "mr-3")} />
              <span className={cn("transition-opacity", 
                isCollapsed && "md:hidden"
              )}>
                {item.name}
              </span>
            </Link>
          ))}
        </nav>
        {/* Bottom section with collapse button */}
        <div className="absolute bottom-4 left-0 right-0 flex pr-4 justify-end">
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "hidden md:flex",
              "bg-background border rounded-full shadow-md",
              "hover:bg-background hover:scale-105 transition-transform"
            )}
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            <ChevronLeft className={cn("h-4 w-4 transition-transform", 
              isCollapsed && "rotate-180"
            )} />
          </Button>
        </div>
      </div>
    </>
  );
}