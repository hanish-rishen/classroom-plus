'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle2, Clock, AlertCircle, CalendarDays, ArrowUpRight } from 'lucide-react';
import { format } from 'date-fns';
import Image from 'next/image';
import { Input } from "@/components/ui/input";
import { Spinner } from '@/components/ui/spinner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search } from 'lucide-react';

type Assignment = {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  courseId: string;
  courseName: string;
  state: 'TURNED_IN' | 'CREATED' | 'RETURNED';
  alternateLink: string; // URL to open assignment in Google Classroom
};

function StatusBadge({ state, dueDate }: { state: Assignment['state']; dueDate: string }) {
  const isMissing = () => {
    if (!dueDate || state !== 'CREATED') return false;
    const due = new Date(dueDate);
    const today = new Date();
    return due < today;
  };

  const styles = {
    TURNED_IN: 'bg-green-100 text-green-700 border-green-500',
    CREATED: isMissing() ? 'bg-red-100 text-red-700 border-red-500' : 'bg-blue-100 text-blue-700 border-blue-500',
    RETURNED: 'bg-yellow-100 text-yellow-700 border-yellow-500',
  };

  const getStatusText = () => {
    if (isMissing()) return 'Missing';
    return state === 'TURNED_IN' ? 'Submitted' : state === 'RETURNED' ? 'Graded' : 'Pending';
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border border-dashed ${styles[state]}`}>
      {getStatusText()}
    </span>
  );
}

export default function AssignmentsPage() {
  const { data: session, status } = useSession();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'dueDate' | 'title' | 'course'>('dueDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [filter, setFilter] = useState<'all' | 'pending' | 'submitted' | 'graded' | 'missing' | 'assigned'>('all');
  const [selectedCourse, setSelectedCourse] = useState<string>('all');

  useEffect(() => {
    let isMounted = true;
    let fetchTimeout: NodeJS.Timeout;

    async function fetchAssignments() {
      if (!session?.accessToken || !isMounted) return;

      try {
        const response = await fetch('/api/classroom/assignments', {
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
          },
        });

        if (!isMounted) return;

        if (response.status === 401) {
          setError('Session expired. Please sign in again.');
          return;
        }

        if (response.status === 429) {
          const retryAfter = parseInt(response.headers.get('Retry-After') || '60');
          setError(`Rate limit exceeded. Retrying in ${retryAfter} seconds...`);
          fetchTimeout = setTimeout(fetchAssignments, retryAfter * 1000);
          return;
        }

        const data = await response.json();
        if (data.error) {
          setError(data.error);
          setAssignments([]);
        } else {
          setAssignments(Array.isArray(data) ? data : []);
          setError(null);
        }
      } catch (error) {
        if (isMounted) {
          console.error('Failed to fetch assignments:', error);
          setError('Failed to fetch assignments. Please try refreshing the page.');
          setAssignments([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    if (status === 'authenticated') {
      fetchAssignments();
    }

    return () => {
      isMounted = false;
      if (fetchTimeout) {
        clearTimeout(fetchTimeout);
      }
    };
  }, [session?.accessToken, status]);

  const formatDueDate = (dueDate: string | null) => {
    if (!dueDate) return 'No due date';
    const date = new Date(dueDate);
    // Check if date is invalid or 1970
    if (isNaN(date.getTime()) || date.getFullYear() < 1971) {
      return 'No due date';
    }
    return format(date, 'PPp');
  };

  const dueToday = assignments.filter(a => {
    if (!a.dueDate) return false;
    const dueDate = new Date(a.dueDate);
    const today = new Date();
    return dueDate.toDateString() === today.toDateString();
  });

  const upcoming = assignments.filter(a => {
    if (!a.dueDate) return false;
    const dueDate = new Date(a.dueDate);
    const today = new Date();
    return dueDate > today && a.state !== 'TURNED_IN';
  });

  const completed = assignments.filter(a => a.state === 'TURNED_IN');

  const uniqueCourses = Array.from(new Set(assignments.map(a => a.courseName)))
    .map(name => {
      const course = assignments.find(a => a.courseName === name);
      return { id: course?.courseId || '', name };
    })
    .filter(course => course.id)
    .sort((a, b) => a.name.localeCompare(b.name));

  const filteredAssignments = assignments
    .filter(assignment => 
      (selectedCourse === 'all' || assignment.courseId === selectedCourse) &&
      (assignment.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      assignment.courseName.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    .sort((a, b) => {
      if (sortBy === 'dueDate') {
        return sortOrder === 'asc'
          ? new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
          : new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime();
      } else if (sortBy === 'title') {
        return a.title.localeCompare(b.title);
      } else if (sortBy === 'course') {
        return a.courseName.localeCompare(b.courseName);
      }
      return 0;
    });

  const assigned = assignments.filter(a => {
    // Only count assignments that are CREATED (not turned in or graded)
    if (a.state !== 'CREATED') return false;
    
    // If there's no due date or empty string, count it as assigned
    if (!a.dueDate || a.dueDate === '') return true;
    
    const dueDate = new Date(a.dueDate);
    
    // Check if date is invalid, null, or 1970 (these should be treated as no due date)
    if (!dueDate || isNaN(dueDate.getTime()) || dueDate.getFullYear() < 1971) return true;
    
    const today = new Date();
    
    // Set both dates to midnight for comparison
    dueDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    
    // Include assignments due today
    return dueDate >= today;
  });
  const missing = assignments.filter(a => {
    if (!a.dueDate) return false;
    const dueDate = new Date(a.dueDate);
    const today = new Date();
    return dueDate < today && a.state === 'CREATED';
  });

  const getFilteredAssignments = () => {
    let filtered = filteredAssignments;
    
    switch (filter) {
      case 'pending':
        filtered = filtered.filter(a => a.state === 'CREATED');
        break;
      case 'submitted':
        filtered = filtered.filter(a => a.state === 'TURNED_IN');
        break;
      case 'graded':
        filtered = filtered.filter(a => a.state === 'RETURNED');
        break;
      case 'missing':
        filtered = filtered.filter(a => {
          if (!a.dueDate) return false;
          const dueDate = new Date(a.dueDate);
          const today = new Date();
          return dueDate < today && a.state === 'CREATED';
        });
        break;
      case 'assigned':
        filtered = filtered.filter(a => {
          if (a.state !== 'CREATED') return false;
          if (!a.dueDate || a.dueDate === '') return true;
          const dueDate = new Date(a.dueDate);
          if (!dueDate || isNaN(dueDate.getTime()) || dueDate.getFullYear() < 1971) return true;
          const today = new Date();
          dueDate.setHours(0, 0, 0, 0);
          today.setHours(0, 0, 0, 0);
          return dueDate >= today;
        });
        break;
    }
    
    return filtered;
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-2xl font-bold md:text-3xl">Assignments</h1>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64 lg:w-72">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search assignments..."
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

      <div className="grid grid-cols-2 gap-2">
        <Card 
          className="col-span-1 cursor-pointer transition-all hover:bg-accent/50"
          onClick={() => setFilter('assigned')}
        >
          <CardHeader className="p-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-blue-500" />
              <p className="text-sm font-medium">Assigned</p>
            </div>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <p className="text-2xl font-bold">{assigned.length}</p>
          </CardContent>
        </Card>
        <Card 
          className="col-span-1 cursor-pointer transition-all hover:bg-accent/50"
          onClick={() => setFilter('missing')}
        >
          <CardHeader className="p-3">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-red-500" />
              <p className="text-sm font-medium">Missing</p>
            </div>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <p className="text-2xl font-bold">{missing.length}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs 
        value={filter} 
        onValueChange={(value) => setFilter(value as typeof filter)}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-4 p-1 h-auto">
          <TabsTrigger value="all" className="py-1.5 px-3 h-auto">All</TabsTrigger>
          <TabsTrigger value="pending" className="py-1.5 px-3 h-auto">Pending</TabsTrigger>
          <TabsTrigger value="submitted" className="py-1.5 px-3 h-auto">Submitted</TabsTrigger>
          <TabsTrigger value="graded" className="py-1.5 px-3 h-auto">Graded</TabsTrigger>
        </TabsList>
      </Tabs>

      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
          <Spinner className="h-12 w-12" />
          <p className="text-muted-foreground animate-pulse">Loading assignments...</p>
        </div>
      ) : (
        <div className="rounded-md border">
          <div className="hidden md:grid md:grid-cols-5 p-4 bg-muted/50">
            <div className="font-medium px-4">Assignment</div>
            <div className="font-medium px-4">Course</div>
            <div className="font-medium px-4">Due Date</div>
            <div className="font-medium px-4">Status</div>
            <div className="font-medium px-4 text-center">Link</div>
          </div>

          <div className="divide-y">
            {getFilteredAssignments().map((assignment) => (
              <div key={assignment.id} className="p-4">
                <div className="md:hidden space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold flex-grow">
                      {assignment.title}
                    </span>
                    <a
                      href={assignment.alternateLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 hover:opacity-80 border rounded p-1 hover:bg-muted/50"
                    >
                      <Image 
                        src="/images/google-classroom.svg" 
                        alt="Open in Google Classroom" 
                        width={24}
                        height={24}
                        className="h-6 w-6"
                      />
                      <ArrowUpRight className="h-3 w-3" />
                    </a>
                  </div>
                  <div className="text-sm text-muted-foreground">{assignment.courseName}</div>
                  <div className="flex items-center gap-2 text-sm">
                    <CalendarDays className="h-4 w-4" />
                    {formatDueDate(assignment.dueDate)}
                  </div>
                  <StatusBadge state={assignment.state} dueDate={assignment.dueDate} />
                </div>

                <div className="hidden md:grid md:grid-cols-5 md:items-center">
                  <div className="px-4">
                    <span>{assignment.title}</span>
                  </div>
                  <div className="text-muted-foreground px-4">{assignment.courseName}</div>
                  <div className="text-muted-foreground px-4">
                    {formatDueDate(assignment.dueDate)}
                  </div>
                  <div className="px-4">
                    <StatusBadge state={assignment.state} dueDate={assignment.dueDate} />
                  </div>
                  <div className="px-4 text-center">
                    <a
                      href={assignment.alternateLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 hover:opacity-80 border rounded p-1 hover:bg-muted/50"
                    >
                      <Image 
                        src="/images/google-classroom.svg" 
                        alt="Open in Google Classroom" 
                        width={24}
                        height={24}
                        className="h-6 w-6"
                      />
                      <ArrowUpRight className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}