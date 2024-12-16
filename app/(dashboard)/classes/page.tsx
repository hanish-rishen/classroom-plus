'use client';

import { Users, ExternalLink, GraduationCap, DoorOpen, BookCopy, Search, AlertCircle, RefreshCw } from 'lucide-react';
import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { fetchWithRetry } from '@/lib/fetch-with-retry';
import { useQuery } from '@tanstack/react-query';

export default function ClassesPage() {
  interface ClassItem {
    id: string;
    name: string;
    teacher: string;
    students: number;
    section?: string;
    room?: string;
    link: string;
  }
  
  const { data: session, status } = useSession();
  const [searchQuery, setSearchQuery] = useState('');

  const { data: classes = [], isLoading, error: queryError } = useQuery({
    queryKey: ['classes', session?.accessToken],
    queryFn: async () => {
      const response = await fetchWithRetry('/api/classroom/classes', {
        headers: {
          Authorization: `Bearer ${session?.accessToken}`,
        },
      }, 5);

      if (response.status === 429) {
        throw new Error('Rate limit exceeded. Please try again in a few minutes.');
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || errorData.details || 'Network response was not ok');
      }

      return response.json();
    },
    enabled: status === 'authenticated' && !!session?.accessToken,
  });

  const error = queryError instanceof Error ? queryError.message : null;

  const filteredClasses = classes.filter((classItem: ClassItem) => 
    classItem.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    classItem.teacher.toLowerCase().includes(searchQuery.toLowerCase()) ||
    classItem.section?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    classItem.room?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 p-4">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-xl font-bold md:text-2xl">Classes</h1>
            {!isLoading && (
              <p className="text-sm text-muted-foreground">
                {filteredClasses.length} {filteredClasses.length === 1 ? 'class' : 'classes'} found
              </p>
            )}
          </div>

          {!error && (
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search classes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
          <Spinner className="h-12 w-12" />
          <p className="text-muted-foreground animate-pulse">Loading classes...</p>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center min-h-[400px]">
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
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 max-w-5xl mx-auto">
          {[...filteredClasses].sort((a, b) => {
            if (a.teacher === 'Unknown Teacher' && b.teacher !== 'Unknown Teacher') return 1;
            if (a.teacher !== 'Unknown Teacher' && b.teacher === 'Unknown Teacher') return -1;
            
            const aHasDetails = !!(a.section || a.room);
            const bHasDetails = !!(b.section || b.room);
            return bHasDetails ? 1 : aHasDetails ? -1 : 0;
          }).map((classItem) => (
            <div key={classItem.id} className="relative group">
              <a 
                href={classItem.link}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute inset-0 z-10"
                aria-label={`Open ${classItem.name} in Google Classroom`}
              >
                <span className="sr-only">Open in Google Classroom</span>
              </a>
              <Card className="hover:bg-muted/50 transition-all duration-200 hover:shadow-md relative">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 min-w-0 flex-1">
                      <CardTitle className="text-base line-clamp-2">{classItem.name}</CardTitle>
                      <p className="text-xs text-muted-foreground flex items-center gap-2">
                        <GraduationCap 
                          className={`h-4 w-4 flex-shrink-0 ${
                            classItem.teacher === 'Unknown Teacher' 
                              ? 'text-muted-foreground' 
                              : 'text-primary'
                          }`}
                        />
                        <span className="truncate">{classItem.teacher}</span>
                      </p>
                    </div>
                    <div className="flex-shrink-0 ml-4">
                      <button 
                        onClick={(e) => {
                          e.preventDefault();
                          window.open(classItem.link, '_blank');
                        }}
                        className="inline-flex items-center text-primary hover:text-primary/80 transition-colors relative z-20"
                        title="Open in Google Classroom"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex flex-wrap gap-2">
                    {classItem.section && (
                      <div className="inline-flex items-center text-xs rounded-full border border-dashed border-primary">
                        <div className="flex items-center gap-1.5 px-2.5 py-0.5 bg-primary/10 text-primary rounded-l-full border-r border-dashed border-primary">
                          <BookCopy className="h-3 w-3" />
                          Section
                        </div>
                        <span className="px-2.5 py-0.5 bg-primary/5">{classItem.section}</span>
                      </div>
                    )}
                    {classItem.room && (
                      <div className="inline-flex items-center text-xs rounded-full border border-dashed border-primary">
                        <div className="flex items-center gap-1.5 px-2.5 py-0.5 bg-primary/10 text-primary rounded-l-full border-r border-dashed border-primary">
                          <DoorOpen className="h-3 w-3" />
                          Room
                        </div>
                        <span className="px-2.5 py-0.5 bg-primary/5">{classItem.room}</span>
                      </div>
                    )}
                    <div className="inline-flex items-center text-xs rounded-full border border-dashed border-primary">
                      <div className="flex items-center gap-1.5 px-2.5 py-0.5 bg-primary/10 text-primary rounded-l-full border-r border-dashed border-primary">
                        <Users className="h-3 w-3" />
                        Students
                      </div>
                      <span className="px-2.5 py-0.5 bg-primary/5">{classItem.students}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      )}
      
      {!isLoading && filteredClasses.length === 0 && !error && (
        <div className="text-center text-sm text-muted-foreground p-6 border rounded-lg bg-muted/5">
          {searchQuery ? (
            <p>No classes found matching your search.</p>
          ) : (
            <p>No classes found. Join or create a class to get started.</p>
          )}
        </div>
      )}
    </div>
  );
}