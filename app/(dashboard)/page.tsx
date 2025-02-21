'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import {
  BookOpen,
  Users,
  Bell,
  Calendar,
  AlertCircle,
  Clock,
  FolderOpen,
  ArrowUpRight,
  School,
  ExternalLink,
  ClipboardList,
  RefreshCw // Added import
} from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQuery } from '@tanstack/react-query';
import { fetchWithRetry } from '@/lib/fetch-with-retry';
import { Button } from '@/components/ui/button'; // Added import
import { WelcomeDialog } from '@/components/welcome-dialog';

type Notification = {
  id: string;
  type: string;
  title: string;
  message: string;
  timestamp: string;
  link?: string;
  courseId?: string;
  courseworkId?: string;
  read?: boolean;
  courseName?: string; // Added courseName
};

type DashboardStats = {
  classes: number;
  assignments: {
    total: number;
    pending: number;
    missing: number;
    completed: number;
  };
  resources: number;
  announcements: number;
  // Removed notifications from DashboardStats
  // notifications: Notification[];
};

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.email) {
      // Make the welcome key specific to the user's email
      const welcomeKey = `hasSeenWelcome_${session.user.email}`;
      const hasSeenWelcome = localStorage.getItem(welcomeKey);
      
      if (!hasSeenWelcome) {
        localStorage.setItem(welcomeKey, 'true');
        setTimeout(() => {
          setShowWelcome(true);
        }, 100);
      }
    }
  }, [status, session]);

  const handleCloseWelcome = () => {
    setShowWelcome(false);
  };

  const { data: stats, isLoading: loadingStats, error: statsError } = useQuery({
    queryKey: ['dashboardStats', session?.accessToken],
    queryFn: async () => {
      const response = await fetchWithRetry('/api/classroom/dashboard/stats', {
        headers: {
          Authorization: `Bearer ${session?.accessToken}`,
        },
      }, 5);

      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data');
      }

      return response.json();
    },
    enabled: status === 'authenticated' && !!session?.accessToken,
  });

  const { data: notifications, isLoading: loadingNotifications, error: notificationsError } = useQuery({
    queryKey: ['notifications', session?.accessToken],
    queryFn: async () => {
      const response = await fetchWithRetry('/api/classroom/notifications', {
        headers: {
          Authorization: `Bearer ${session?.accessToken}`,
        },
      }, 5);

      if (!response.ok) {
        throw new Error('Failed to fetch notifications');
      }

      return response.json();
    },
    enabled: status === 'authenticated' && !!session?.accessToken,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    refetchOnWindowFocus: false,
  });

  const errorStats = statsError instanceof Error ? statsError.message : null;
  const errorNotifications = notificationsError instanceof Error ? notificationsError.message : null;

  return (
    <>
      <div className="space-y-6 p-4 md:p-6">
        <h1 className="text-2xl font-bold md:text-3xl">Dashboard</h1>

        {(errorStats || errorNotifications) && (
          <div className="flex items-center justify-center p-4">
            <div className="flex items-center gap-2 p-4 text-destructive bg-destructive/10 rounded-lg border border-destructive">
              <AlertCircle className="h-5 w-5" />
              <p>{errorStats || errorNotifications}</p>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => window.location.reload()}
                className="ml-2"
              >
                <RefreshCw className="h-4 w-4 mr-1" />
                Retry
              </Button>
            </div>
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Link href="/assignments">
            <Card className="hover:bg-muted/50 transition-all group border-dashed border-2 border-primary">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Assignments</CardTitle>
                <div className="flex items-center gap-2">
                  <ClipboardList className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">
                  View and manage your assignments
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/resources">
            <Card className="hover:bg-muted/50 transition-all group border-dashed border-2 border-primary">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Resources</CardTitle>
                <div className="flex items-center gap-2">
                  <FolderOpen className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">
                  Access study materials and resources
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/calendar">
            <Card className="hover:bg-muted/50 transition-all group border-dashed border-2 border-primary">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Calendar</CardTitle>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">
                  View your upcoming deadlines
                </p>
              </CardContent>
            </Card>
          </Link>
        </div>

        <div className="space-y-4">
          <div className="flex items-center">
            <h2 className="text-xl font-semibold">Recent Activity</h2>
          </div>

          <Card>
            <ScrollArea className="h-[400px] md:h-auto rounded-md">
              <div className="p-4 space-y-4">
                {loadingNotifications || !session ? (
                  <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                    <Spinner className="h-12 w-12" />
                    <p className="text-muted-foreground animate-pulse">Loading recent activity...</p>
                  </div>
                ) : errorNotifications ? (
                  <div className="flex items-center justify-center h-40">
                    <p className="text-destructive">{errorNotifications}</p>
                  </div>
                ) : !notifications || notifications.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    No notifications found
                  </div>
                ) : (
                  notifications.map((notification: Notification) => (
                    <div
                      key={notification.id}
                      onClick={() => {
                        if (notification.link) {
                          window.open(notification.link, '_blank');
                        }
                      }}
                      className={cn(
                        "relative p-4 rounded-lg border transition-colors cursor-pointer",
                        notification.read ? "bg-muted/50" : "bg-card border-primary/50",
                        "hover:bg-accent/50"
                      )}
                    >
                      {notification.link && (
                        <span 
                          className="absolute top-2 right-2 text-muted-foreground hover:text-primary transition-colors"
                          title="Open in Google Classroom"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </span>
                      )}
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                        <Bell className={cn(
                          "h-5 w-5 flex-shrink-0 mt-0.5",
                          notification.read ? "text-muted-foreground" : "text-primary"
                        )} />
                        <div className="space-y-1 min-w-0 flex-1">
                          <p className="font-medium text-sm sm:text-base">{notification.title}</p>
                          <p className="text-xs sm:text-sm text-muted-foreground">
                            {notification.type === 'CourseWork' ? 'Updated Coursework' : ''}
                          </p>
                          {notification.courseName && (
                            <p className="text-xs sm:text-sm text-muted-foreground">
                              {notification.courseName}
                            </p>
                          )}
                          <div className="mt-2 flex flex-wrap gap-2">
                            <div className="inline-flex items-center text-xs sm:text-sm rounded-full border border-dashed border-primary">
                              <div className="flex items-center gap-1.5 px-2.5 py-0.5 bg-primary/10 text-primary rounded-l-full">
                                <Clock className="h-3 w-3" />
                                <span>Posted</span>
                              </div>
                              <span className="px-2.5 py-0.5 bg-primary/5">
                                {new Date(notification.timestamp).toLocaleString(undefined, {
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </Card>
        </div>
      </div>
      <WelcomeDialog 
        isOpen={showWelcome}
        onClose={handleCloseWelcome}
        userName={session?.user?.name}
      />
    </>
  );
}