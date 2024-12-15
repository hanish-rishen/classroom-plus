'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, Users } from 'lucide-react';

const classes = [
  {
    id: 1,
    name: 'Advanced Mathematics',
    teacher: 'Dr. Smith',
    students: 28,
    progress: 65,
    nextClass: '2024-02-16 09:00 AM',
  },
  {
    id: 2,
    name: 'World History',
    teacher: 'Prof. Johnson',
    students: 32,
    progress: 45,
    nextClass: '2024-02-16 11:00 AM',
  },
  {
    id: 3,
    name: 'Physics',
    teacher: 'Dr. Brown',
    students: 25,
    progress: 80,
    nextClass: '2024-02-17 10:00 AM',
  },
  {
    id: 4,
    name: 'Literature',
    teacher: 'Ms. Davis',
    students: 30,
    progress: 55,
    nextClass: '2024-02-17 02:00 PM',
  },
];

export default function ClassesPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold md:text-3xl">Classes</h1>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Join Class
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {classes.map((classItem) => (
          <Card key={classItem.id} className="cursor-pointer hover:bg-muted/50">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{classItem.name}</span>
                <Users className="h-5 w-5 text-muted-foreground" />
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {classItem.teacher}
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <p className="text-sm font-medium">Next Class</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(classItem.nextClass).toLocaleString()}
                </p>
              </div>
              <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                <Users className="h-4 w-4" />
                <span>{classItem.students} students</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}