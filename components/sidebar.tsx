'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useLayout } from '@/components/layout-context';
import { useColorTheme, type ColorTheme } from '@/components/theme-colors';
import { useSession, signOut } from 'next-auth/react';
import {
  LayoutDashboard,
  ClipboardList,
  FolderOpen,
  Calendar,
  Users,
  ChevronLeft,
  PlusCircle,
  Menu,
  Palette,
  Bell,
  LogOut,
  Check,
  Circle,
} from 'lucide-react';
import { Button } from './ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { colorOptions } from '@/lib/constants';
import { Logo } from '@/components/ui/logo';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Assignments', href: '/assignments', icon: ClipboardList },
  { name: 'Announcements', href: '/announcements', icon: Bell },
  { name: 'Resources', href: '/resources', icon: FolderOpen },
  { name: 'Calendar', href: '/calendar', icon: Calendar },
  { name: 'Classes', href: '/classes', icon: Users },
];

export default function Sidebar() {
  const { sidebarOpen, toggleSidebar } = useLayout();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();
  const { colorTheme, setColorTheme } = useColorTheme();
  const { data: session } = useSession();

  // Mobile menu toggle that floats
  const MobileMenuToggle = () => (
    <Button
      variant="ghost"
      size="icon"
      className="fixed bottom-4 right-4 z-50 h-12 w-12 rounded-full shadow-lg md:hidden bg-primary text-primary-foreground hover:bg-primary/90"
      onClick={toggleSidebar}
    >
      <div className="w-5 h-5 flex flex-col justify-center gap-1.5">
        <div className="h-0.5 w-4 bg-current" />
        <div className="h-0.5 w-3 bg-current ml-1" />
      </div>
    </Button>
  );

  return (
    <>
      <MobileMenuToggle />
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden"
          onClick={toggleSidebar}
        />
      )}

      <div className={cn(
        'fixed z-50 transform transition-all duration-200 ease-in-out',
        'backdrop-blur-lg bg-background/80 rounded-xl border shadow-lg',
        'md:static md:inset-y-2 md:left-2',
        isCollapsed ? 'w-16 md:w-16' : 'w-64',
        'inset-y-2 inset-x-2',
        'md:translate-x-0',
        !sidebarOpen && '-translate-x-[calc(100%+1rem)]'
      )}>
        <div className="flex flex-col h-full">
          {/* Logo section with theme controls */}
          <div className="p-2 border-b flex items-center justify-between">
            <Logo className={cn(isCollapsed && "scale-0 w-0 p-0 opacity-0 transition-all duration-200")} />
            {isCollapsed ? (
              <Circle className="h-6 w-6 text-primary" />
            ) : (
              <div className="flex items-center gap-2">
                <ThemeToggle />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <Palette className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {colorOptions.map((color) => (
                      <DropdownMenuItem 
                        key={color.value}
                        onClick={() => setColorTheme(color.value as ColorTheme)}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <div className={cn("h-4 w-4 rounded-full", color.class)} />
                          {color.name}
                        </div>
                        {colorTheme === color.value && (
                          <Check className="h-4 w-4" />
                        )}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 p-2">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => {
                  if (window.innerWidth < 768) {  // Only close on mobile
                    toggleSidebar();
                  }
                }}
                className={cn(
                  'flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  pathname === item.href
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-muted'
                )}>
                <item.icon className={cn("h-5 w-5", !isCollapsed && "mr-3")} />
                <span className={cn("transition-opacity", 
                  isCollapsed && "md:hidden"
                )}>
                  {item.name}
                </span>
              </Link>
            ))}
          </nav>

          {/* Built by tag - Moved here, before the border */}
          <div className={cn(
            "mb-4 px-4 text-xs text-center text-muted-foreground",
            "opacity-70 hover:opacity-100 transition-opacity",
            isCollapsed && "md:hidden"
          )}>
            <p className="font-medium">
              Built with ♥️ by
            </p>
            <a 
              href="https://www.linkedin.com/in/hanish-rishen-331072248/" 
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-primary hover:underline"
            >
              Hanish Rishen
            </a>
          </div>

          {/* Bottom section */}
          <div className="border-t p-4">
            <div className="rounded-lg border bg-card p-4 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={session?.user?.image || ''} />
                  <AvatarFallback>{session?.user?.name?.[0] || 'U'}</AvatarFallback>
                </Avatar>
                {!isCollapsed && (
                  <div className="flex-1 overflow-hidden">
                    <p className="text-sm font-medium truncate">{session?.user?.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{session?.user?.email}</p>
                  </div>
                )}
              </div>
              
              <Button
                variant="outline"
                size="sm"
                className={cn(
                  "w-full justify-start gap-2 rounded-full",
                  "border-primary/20 bg-primary/10",
                  "text-primary hover:bg-primary/20 hover:text-primary"
                )}
                onClick={() => signOut({ callbackUrl: '/login' })}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4"
                >
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                {!isCollapsed && "Sign out"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}