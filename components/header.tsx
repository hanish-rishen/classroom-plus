'use client';

import { Bell, Menu, Palette } from 'lucide-react';
import { cn } from '@/lib/utils';  // Add this import
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import { useLayout } from '@/components/layout-context';
import { useColorTheme } from '@/components/theme-colors';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const colorOptions = [
  { name: 'Red', value: 'pink', class: 'bg-[hsl(346.8,77.2%,49.8%)]' },  // Changed 'Pink' to 'Red'
  { name: 'Blue', value: 'blue', class: 'bg-[hsl(217.2,91.2%,59.8%)]' },
  { name: 'Green', value: 'green', class: 'bg-[hsl(142.1,76.2%,36.3%)]' },
  { name: 'Orange', value: 'orange', class: 'bg-[hsl(24.6,95%,53.1%)]' },
  { name: 'Purple', value: 'purple', class: 'bg-[hsl(262.1,83.3%,57.8%)]' },
];

export default function Header() {
  const { toggleSidebar } = useLayout();
  const { setColorTheme } = useColorTheme();

  return (
    <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center px-4 md:px-6">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={toggleSidebar}
        >
          <Menu className="h-5 w-5" />
        </Button>
        <div className="ml-auto flex items-center space-x-4">
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
                  className="flex items-center gap-2"
                >
                  <div className={cn(
                    "h-4 w-4 rounded-full",
                    color.class
                  )} />
                  {color.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="ghost" size="icon">
            <Bell className="h-5 w-5" />
          </Button>
          <ThemeToggle />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/placeholder-avatar.jpg" alt="User" />
                  <AvatarFallback>U</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="animate-fade-in">
              <DropdownMenuItem>Profile</DropdownMenuItem>
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuItem>Sign out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}