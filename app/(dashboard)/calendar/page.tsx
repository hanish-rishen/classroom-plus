'use client';

import { Calendar as CalendarIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { useState } from 'react';

export default function CalendarPage() {
  const [date, setDate] = useState<Date | undefined>(new Date());

  const events = [
    {
      title: 'Math Quiz',
      date: '2024-02-15',
      type: 'Assessment',
    },
    {
      title: 'History Presentation',
      date: '2024-02-18',
      type: 'Presentation',
    },
    {
      title: 'Science Lab',
      date: '2024-02-20',
      type: 'Lab',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold md:text-3xl">Calendar</h1>
        <div className="flex items-center space-x-2">
          <CalendarIcon className="h-5 w-5 text-gray-500" />
          <span className="text-lg">
            {date?.toLocaleDateString('en-US', {
              month: 'long',
              year: 'numeric',
            })}
          </span>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-[1fr_300px]">
        <Card>
          <CardContent className="p-4">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-md border"
            />
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Events</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {events.map((event, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0"
                  >
                    <div>
                      <p className="font-medium">{event.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {event.type}
                      </p>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {new Date(event.date).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}