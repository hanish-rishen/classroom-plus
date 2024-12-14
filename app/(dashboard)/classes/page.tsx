'use client';

import { useEffect, useState } from 'react';
import { ArrowRight, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Spinner } from '@/components/ui/spinner';
import { Input } from '@/components/ui/input';

interface ClassItem {
  id: string;
  name: string;
  teacher: string;
  section?: string;
  enrollmentCode?: string;
  updatedAt: string;
  descriptionHeading?: string;
  room?: string;
  alternateLink?: string;
}

export default function ClassesPage() {
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        setError(null);
        const response = await fetch('/api/classroom/classes');
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch classes');
        }
        const data = await response.json();
        setClasses(data);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'An error occurred';
        setError(message);
        toast({
          title: 'Error',
          description: message,
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchClasses();
  }, [toast]);

  const handleClassClick = (alternateLink?: string) => {
    if (alternateLink) {
      window.open(alternateLink, '_blank');
    }
  };

  const sortedAndFilteredClasses = classes
    .filter(classItem => 
      classItem.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      classItem.descriptionHeading?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      classItem.section?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      classItem.room?.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      const aHasLabels = !!(a.section || a.room);
      const bHasLabels = !!(b.section || b.room);
      
      if (aHasLabels && !bHasLabels) return -1;
      if (!aHasLabels && bHasLabels) return 1;
      return 0;
    });

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold md:text-3xl">Classes</h1>
          <p className="text-muted-foreground mt-1">
            Manage and access your classroom activities
          </p>
        </div>
        <div className="relative w-full sm:w-64 lg:w-72">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search classes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
          <Spinner className="h-12 w-12" />
          <p className="text-muted-foreground animate-pulse">Loading your classes...</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedAndFilteredClasses.map((classItem) => {
            const showDescription = classItem.descriptionHeading && 
              !classItem.name.toLowerCase().includes(classItem.descriptionHeading.toLowerCase()) &&
              !classItem.descriptionHeading.toLowerCase().includes(classItem.name.toLowerCase());

            return (
              <div
                key={classItem.id}
                onClick={() => handleClassClick(classItem.alternateLink)}
                className="group relative bg-card hover:bg-accent/50 border rounded-lg p-5 cursor-pointer transition-all duration-200"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-3">
                    <div>
                      <h3 className="text-lg font-semibold">{classItem.name}</h3>
                      {showDescription && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {classItem.descriptionHeading}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-2">
                      {classItem.section && (
                        <div className="inline-flex items-center text-[11px] font-medium">
                          <span className="bg-primary/10 text-primary px-2 py-1 rounded-l-md border-y border-l border-primary/20">
                            SECTION
                          </span>
                          <span className="bg-primary/5 text-primary px-2 py-1 rounded-r-md border border-primary/20">
                            {classItem.section}
                          </span>
                        </div>
                      )}
                      {classItem.room && (
                        <div className="inline-flex items-center text-[11px] font-medium">
                          <span className="bg-primary/10 text-primary px-2 py-1 rounded-l-md border-y border-l border-primary/20">
                            ROOM
                          </span>
                          <span className="bg-primary/5 text-primary px-2 py-1 rounded-r-md border border-primary/20">
                            {classItem.room}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {classItem.enrollmentCode && (
                      <div className="inline-flex items-center text-[11px] font-medium">
                        <span className="bg-muted text-foreground px-2 py-1 rounded-l-md border-y border-l border-muted/20">
                          CODE
                        </span>
                        <span className="bg-muted/50 text-muted-foreground px-2 py-1 rounded-r-md border border-muted/20">
                          {classItem.enrollmentCode}
                        </span>
                      </div>
                    )}
                    <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </div>
              </div>
            );
          })}

          {sortedAndFilteredClasses.length === 0 && !loading && (
            <div className="text-center text-muted-foreground py-8">
              No classes found matching your search
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="flex items-center justify-center p-4">
          <p className="text-destructive bg-destructive/10 px-4 py-2 rounded-md">
            {error}
          </p>
        </div>
      )}
    </div>
  );
}