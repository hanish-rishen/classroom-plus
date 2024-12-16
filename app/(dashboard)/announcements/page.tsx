'use client';

import { useEffect, useState } from 'react';
import { Bell, Search, ExternalLink, CalendarClock, AlertCircle, RefreshCw } from 'lucide-react';
import { useSession } from 'next-auth/react';  // Add this import
import { useToast } from '@/hooks/use-toast';
import { Spinner } from '@/components/ui/spinner';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuery } from '@tanstack/react-query';
import { fetchWithRetry } from '@/lib/fetch-with-retry';
import { Button } from '@/components/ui/button';

interface Announcement {
  id: string;
  text: string;
  creationTime: string;
  updateTime: string;
  courseName: string;
  courseId: string;
  materials?: any[];
  creatorUserId: string;
  alternateLink: string;
}

export default function AnnouncementsPage() {
  const { data: session } = useSession();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCourse, setSelectedCourse] = useState<string>('all');
  const { toast } = useToast();

  const { data: announcements = [], isLoading, error: queryError } = useQuery({
    queryKey: ['announcements', session?.accessToken],
    queryFn: async () => {
      const response = await fetchWithRetry('/api/classroom/announcements', {
        headers: {
          Authorization: `Bearer ${session?.accessToken}`,
        },
      }, 5);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch announcements');
      }

      return response.json() as Promise<Announcement[]>;
    },
    enabled: !!session?.accessToken,
  });

  // React Query will handle errors through the error property
  if (queryError) {
    const message = queryError instanceof Error ? queryError.message : 'An error occurred';
    toast({
      title: 'Error',
      description: message,
      variant: 'destructive',
    });
  }

  const error = queryError instanceof Error ? queryError.message : null;

  // Function to make URLs in text clickable
  const renderTextWithLinks = (text: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = text.split(urlRegex);
    
    return parts.map((part, index) => {
      if (part.match(urlRegex)) {
        return (
          <a
            key={index}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            {part}
          </a>
        );
      }
      return part;
    });
  };

  const filteredAnnouncements = announcements.filter((announcement: Announcement) =>
    (selectedCourse === 'all' || announcement.courseId === selectedCourse) &&
    (announcement.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
    announcement.courseName.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const uniqueCourses = Array.from(new Set(announcements.map((a: Announcement) => a.courseName)))
    .map((name: string) => {
      const course = announcements.find((a: Announcement) => a.courseName === name);
      return { id: course?.courseId || '', name };
    })
    .filter(course => course.id)
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-2xl font-bold md:text-3xl">Announcements</h1>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64 lg:w-72">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search announcements..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedCourse} onValueChange={setSelectedCourse}>
              <SelectTrigger className="w-full sm:w-48 border-input ring-offset-background focus:ring-2 focus:ring-primary focus:ring-offset-2">
                <SelectValue 
                  placeholder="Filter by class" 
                  className="text-left truncate pr-2"
                />
              </SelectTrigger>
              <SelectContent 
                className="max-w-[calc(100vw-2rem)] sm:max-w-none w-[var(--radix-select-trigger-width)]" 
                position="popper"
                align="end"
                alignOffset={0}
                sideOffset={8}
              >
                <SelectItem value="all" className="whitespace-normal py-2.5 break-words">
                  All Classes
                </SelectItem>
                {uniqueCourses.map((course) => (
                  <SelectItem 
                    key={course.id} 
                    value={course.id}
                    className="whitespace-normal py-2.5 break-words"
                  >
                    {course.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
          <Spinner className="h-12 w-12" />
          <p className="text-muted-foreground animate-pulse">Loading announcements...</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAnnouncements.map((announcement: Announcement) => (
            <div
              key={announcement.id}
              onClick={() => window.open(announcement.alternateLink, '_blank')}
              className="group relative bg-card hover:bg-accent/50 border rounded-lg p-5 transition-all duration-200 cursor-pointer"
            >
              <div className="flex flex-col gap-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
                    <div className="flex items-center gap-2 min-w-0">
                      <Bell className="h-4 w-4 flex-shrink-0" />
                      <span className="font-medium text-primary">{announcement.courseName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="hidden md:inline text-muted-foreground">•</span>
                      <CalendarClock className="h-4 w-4 flex-shrink-0" />
                      <span>{format(new Date(announcement.creationTime), 'MMM d, yyyy')}</span>
                    </div>
                  </div>
                  <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
                </div>
                <div className="text-sm whitespace-pre-wrap break-words">
                  {renderTextWithLinks(announcement.text)}
                </div>
              </div>
            </div>
          ))}

          {filteredAnnouncements.length === 0 && !isLoading && (
            <div className="text-center text-muted-foreground py-8">
              No announcements found
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="flex items-center justify-center p-4">
          <div className="flex items-center gap-2 p-4 text-destructive bg-destructive/10 rounded-lg border border-destructive">
            <AlertCircle className="h-5 w-5" />
            <p>{error}</p>
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
    </div>
  );
}
