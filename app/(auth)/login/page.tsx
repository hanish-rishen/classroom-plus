'use client';

import { signIn } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/ui/logo';
import { BookOpen, Calendar, Users, FolderOpen, Palette, Check } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';
import { useColorTheme } from '@/components/theme-colors';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { colorOptions } from '@/lib/constants';
import { cn } from '@/lib/utils';

const features = [
  {
    icon: BookOpen,
    title: 'Assignment Management',
    description: 'Track and manage your assignments with ease'
  },
  {
    icon: Calendar,
    title: 'Smart Calendar',
    description: 'Never miss a deadline with integrated scheduling'
  },
  {
    icon: Users,
    title: 'Class Organization',
    description: 'Keep all your classes organized in one place'
  },
  {
    icon: FolderOpen,
    title: 'Resource Hub',
    description: 'Access all your learning materials instantly'
  }
];

export default function LoginPage() {
  const { colorTheme, setColorTheme } = useColorTheme();

  const handleSignIn = async () => {
    try {
      await signIn('google', { 
        callbackUrl: '/',
        redirect: true 
      });
    } catch (error) {
      console.error('Sign in error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-muted/30 p-2">
      <div className="h-[calc(100vh-1rem)] rounded-xl border bg-background/80 backdrop-blur-lg shadow-lg p-8">
        <div className="relative flex flex-col h-full">
          <div className="flex items-center gap-4 mb-8">
            <Logo />
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
                      onClick={() => setColorTheme(color.value)}
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
          </div>
          
          <div className="flex-1 flex items-center justify-center">
            <div className="grid w-full max-w-6xl gap-8 md:grid-cols-2">
              {/* Features Section - Now visible on mobile */}
              <div className="flex flex-col justify-center space-y-6 md:order-1 order-2">
                <h2 className="text-2xl md:text-3xl font-bold text-center md:text-left">
                  Enhanced Google Classroom Experience
                </h2>
                <div className="grid gap-4 md:grid-cols-1 grid-cols-2">
                  {features.map((feature) => (
                    <div 
                      key={feature.title}
                      className="flex flex-col md:flex-row items-center md:items-start gap-4 p-4 rounded-xl border bg-background/60 backdrop-blur-sm text-center md:text-left"
                    >
                      <feature.icon className="h-8 w-8 md:h-6 md:w-6 text-primary shrink-0" />
                      <div>
                        <h3 className="font-semibold">{feature.title}</h3>
                        <p className="text-sm text-muted-foreground">{feature.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Login Card */}
              <div className="flex items-center justify-center md:order-2 order-1">
                <Card className="w-full max-w-md">
                  <CardHeader className="space-y-2">
                    <CardTitle className="text-2xl text-center">Get Started</CardTitle>
                    <CardDescription className="text-center">
                      Sign in with your Google Classroom account to enhance your learning experience
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="grid gap-4">
                    <Button 
                      onClick={handleSignIn}
                      className="w-full bg-primary hover:bg-primary/90"
                    >
                      <svg
                        className="mr-2 h-4 w-4"
                        aria-hidden="true"
                        focusable="false"
                        data-prefix="fab"
                        data-icon="google"
                        role="img"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 488 512"
                      >
                        <path
                          fill="currentColor"
                          d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"
                        ></path>
                      </svg>
                      Sign in with Google
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}