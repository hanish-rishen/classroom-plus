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
  ClipboardList
} from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';
import { ScrollArea } from "@/components/ui/scroll-area";

// Updated types to separate notifications
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
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]); // Added separate state for notifications
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingNotifications, setLoadingNotifications] = useState(true); // Added loading state for notifications
  const [errorStats, setErrorStats] = useState<string | null>(null);
  const [errorNotifications, setErrorNotifications] = useState<string | null>(null); // Added error state for notifications

  useEffect(() => {
    const fetchDashboardStats = async () => {
      if (!session?.accessToken) return;

      try {
        const response = await fetch('/api/classroom/dashboard/stats', {
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch dashboard data');
        }

        const data = await response.json();
        setStats(data);
      } catch (error: any) {
        console.error('Error fetching dashboard stats:', error);
        setErrorStats(error.message || 'Failed to load dashboard data');
      } finally {
        setLoadingStats(false);
      }
    };

    const fetchNotifications = async () => {
      if (!session?.accessToken) return;

      try {
        const response = await fetch('/api/classroom/notifications', {
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch notifications');
        }

        const data: Notification[] = await response.json();
        setNotifications(data);
      } catch (error: any) {
        console.error('Error fetching notifications:', error);
        setErrorNotifications(error.message || 'Failed to load notifications');
      } finally {
        setLoadingNotifications(false);
      }
    };

    if (status === 'authenticated') {
      fetchDashboardStats();
      fetchNotifications();
    } else if (status === 'unauthenticated') {
      setErrorStats('You must be logged in to view the dashboard.');
      setLoadingStats(false);
      setErrorNotifications('You must be logged in to view notifications.');
      setLoadingNotifications(false);
    }
    // Keep loading true while session is loading
    else if (status === 'loading') {
      setLoadingStats(true);
      setLoadingNotifications(true);
    }
  }, [session?.accessToken, status]);

  return (
    <div className="space-y-6 p-4 md:p-6">
      <h1 className="text-2xl font-bold md:text-3xl">Dashboard</h1>

      {/* Navigation Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Assignments Card */}
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

        {/* Resources Card */}
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

        {/* Calendar Card */}
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

      {/* Notifications Section */}
      <div className="space-y-4">
        <div className="flex items-center">
          <h2 className="text-xl font-semibold">Recent Activity</h2>
          {/* Removed the number of notifications */}
        </div>

        <Card>
          {loadingNotifications ? (
            // Loader inside the Card component with updated styling
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
              <Spinner className="h-12 w-12" />
              <p className="text-muted-foreground animate-pulse">Loading recent activity...</p>
            </div>
          ) : errorNotifications ? (
            // Show error message inside the Card component
            <div className="flex items-center justify-center h-40">
              <p className="text-destructive">{errorNotifications}</p>
            </div>
          ) : (
            <ScrollArea className="h-[400px] md:h-auto rounded-md"> {/* Updated height classes */}
              <div className="p-4 space-y-4">
                {notifications.map((notification) => (
                  <div 
                    key={notification.id}
                    className={cn(
                      "relative p-4 rounded-lg border transition-colors", // Added 'relative' class
                      notification.read ? "bg-muted/50" : "bg-card border-primary/50",
                      "hover:bg-accent/50"
                    )}
                  >
                    {notification.link && (
                      <a 
                        href={notification.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="absolute top-2 right-2 text-muted-foreground hover:text-primary transition-colors"
                        title="View details"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    )}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                      <Bell className={cn(
                        "h-5 w-5 flex-shrink-0 mt-0.5",
                        notification.read ? "text-muted-foreground" : "text-primary"
                      )} />
                      <div className="space-y-1 min-w-0 flex-1">
                        {/* Notification Title */}
                        <p className="font-medium text-sm sm:text-base">{notification.title}</p>

                        {/* Notification Type */}
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          {notification.type === 'CourseWork' ? 'Updated Coursework' : ''}
                        </p>

                        {/* Course Name */}
                        {notification.courseName && (
                          <p className="text-xs sm:text-sm text-muted-foreground">
                            {notification.courseName}
                          </p>
                        )}

                        {/* Timestamp */}
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
                ))}

                {(!notifications.length) && (
                  <div className="text-center text-muted-foreground py-8">
                    No notifications found
                  </div>
                )}
              </div>
            </ScrollArea>
          )}
        </Card>
      </div>
    </div>
  );
}