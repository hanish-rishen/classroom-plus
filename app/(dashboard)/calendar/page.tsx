'use client';

// ...existing imports...
import { useQuery } from '@tanstack/react-query';
import { fetchWithRetry } from '@/lib/fetch-with-retry';

import { Calendar as CalendarIcon, AlertCircle, RefreshCw } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useState, useEffect, useRef } from 'react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay, parseISO } from 'date-fns';
import { useSession } from 'next-auth/react';
import { Spinner } from '@/components/ui/spinner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

type Assignment = {
  id: string;
  title: string;
  description: string;
  dueDate: string | null;
  courseId: string;
  courseName: string;
  state: 'TURNED_IN' | 'CREATED' | 'RETURNED';
  alternateLink: string;
};

export default function CalendarPage() {
  const { data: session, status } = useSession();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedCourse, setSelectedCourse] = useState<string>('all');
  const todayRef = useRef<HTMLDivElement>(null);

  const { data: assignments = [], isLoading, error: queryError } = useQuery({
    queryKey: ['assignments', session?.accessToken],
    queryFn: async () => {
      const response = await fetchWithRetry('/api/classroom/assignments', {
        headers: {
          Authorization: `Bearer ${session?.accessToken}`,
        },
      }, 5);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || errorData.details || 'Network response was not ok');
      }

      return response.json();
    },
    enabled: status === 'authenticated' && !!session?.accessToken,
  });

  const error = queryError instanceof Error ? queryError.message : null;

  useEffect(() => {
    if (!isLoading && todayRef.current) {
      todayRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [isLoading]);

  const renderHeader = () => {
    const dateFormat = 'MMMM yyyy';

    return (
      <div className="flex items-center justify-center mb-4 md:justify-start sticky top-0 z-10">
        {/* Month selector inside a pill-shaped container */}
        <div className="flex items-center bg-muted/50 rounded-full px-2 py-1 md:px-3 md:py-2">
          {/* Previous month button */}
          <button
            onClick={prevMonth}
            className="h-8 w-8 flex items-center justify-center rounded-full text-primary bg-primary/10"
          >
            &lt;
          </button>
          <span className="text-lg font-bold mx-2">
            {format(currentMonth, dateFormat)}
          </span>
          {/* Next month button */}
          <button
            onClick={nextMonth}
            className="h-8 w-8 flex items-center justify-center rounded-full text-primary bg-primary/10"
          >
            &gt;
          </button>
        </div>
      </div>
    );
  };

  const renderDays = () => {
    const dateFormat = 'EEE';
    const days = [];
    let startDate = startOfWeek(currentMonth);

    for (let i = 0; i < 7; i++) {
      days.push(
        <div className="hidden md:block text-center font-medium text-muted-foreground" key={i}>
          {format(addDays(startDate, i), dateFormat)}
        </div>
      );
    }

    return <div className="hidden md:grid grid-cols-7">{days}</div>;
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const rows = [];
    let days = [];
    let day = startDate;

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const cloneDay = day;
        const dayAssignments = assignments.filter((assignment: Assignment) => {
          if (!assignment.dueDate) return false;
          if (selectedCourse !== 'all' && assignment.courseId !== selectedCourse) return false;
          const assignmentDate = parseISO(assignment.dueDate);
          return isSameDay(assignmentDate, cloneDay);
        });

        const isToday = isSameDay(day, new Date());

        days.push(
          <div
            className={cn(
              "border rounded-lg transition-colors",
              !isSameMonth(day, monthStart) ? "bg-muted/50" : "bg-card",
              isToday ? "bg-accent border-2 border-primary" : "",
              "md:p-2 p-4",
              "min-h-[8rem]" // Set a minimum height instead of fixed height
            )}
            key={day.toString()}
            ref={isToday ? todayRef : null} // Attach ref to today's cell
          >
            <div className="flex items-center justify-start md:justify-end gap-2">
              <div className="md:hidden flex items-center gap-1">
                <span className="text-sm font-semibold">{format(day, 'd')}</span>
                <span className="text-sm text-muted-foreground">{format(day, 'EEE')}</span>
                {/* Removed the dot */}
              </div>
              <span className="text-sm font-semibold hidden md:block">{format(day, 'd')}</span>
            </div>
            <div className="mt-2 space-y-1">
              {dayAssignments.map((assignment: Assignment, index: number) => (
                <a
                  key={index}
                  href={assignment.alternateLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-xs p-1 rounded bg-primary/10 text-primary hover:bg-primary/20 transition-colors border border-dashed border-primary"
                >
                  {assignment.title}
                </a>
              ))}
            </div>
          </div>
        );
        day = addDays(day, 1);
      }

      rows.push(
        <div className="grid grid-cols-1 md:grid-cols-7 gap-2" key={day.toString()}>
          {days}
        </div>
      );
      days = [];
    }

    return <div className="space-y-2">{rows}</div>;
  };

  const nextMonth = () => {
    setCurrentMonth(addDays(currentMonth, 30));
  };

  const prevMonth = () => {
    setCurrentMonth(addDays(currentMonth, -30));
  };

  const uniqueCourses = Array.from(new Set(assignments.map((a: Assignment) => a.courseName)))
    .map(name => {
      const course = assignments.find((a: Assignment) => a.courseName === name);
      return course ? { id: course.courseId, name: course.courseName } : { id: '', name };
    })
    .filter(course => course.id); // Ensure no empty ids

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="md:flex md:items-center md:justify-between gap-6 space-y-4 md:space-y-0">
        <h1 className="text-2xl font-bold md:text-3xl text-left">Calendar</h1>
        <Select onValueChange={setSelectedCourse} defaultValue="all">
          <SelectTrigger className="w-full md:w-64 focus:ring-primary mt-0">
            <SelectValue placeholder="Sort by Class" />
          </SelectTrigger>
          <SelectContent className="max-w-xs w-full sm:max-w-md overflow-x-hidden">
            <SelectItem className="whitespace-normal break-words" value="all">All Classes</SelectItem>
            {uniqueCourses.map(course => (
              <SelectItem className="whitespace-normal break-words" key={course.id} value={course.id}>
                {course.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {renderHeader()}
      <Card>
        <CardContent className="p-4">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
              <Spinner className="h-12 w-12" />
              <p className="text-muted-foreground animate-pulse">Loading Calendar...</p>
            </div>
          ) : (
            <>
              {renderDays()}
              {renderCells()}
            </>
          )}
        </CardContent>
      </Card>
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