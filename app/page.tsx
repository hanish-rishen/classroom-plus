import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BookOpen,
  Calendar,
  GraduationCap,
  FolderOpen,
  ArrowUpRight,
} from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  const summaryCards = [
    {
      title: 'Active Assignments',
      value: '12',
      icon: BookOpen,
      href: '/assignments',
      color: 'text-blue-500',
    },
    {
      title: 'Upcoming Events',
      value: '5',
      icon: Calendar,
      href: '/calendar',
      color: 'text-green-500',
    },
    {
      title: 'Active Classes',
      value: '6',
      icon: GraduationCap,
      href: '/classes',
      color: 'text-purple-500',
    },
    {
      title: 'Resources',
      value: '24',
      icon: FolderOpen,
      href: '/resources',
      color: 'text-orange-500',
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold md:text-3xl">Welcome back, User!</h1>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 stagger-animation">
        {summaryCards.map((card) => (
          <Link key={card.title} href={card.href}>
            <Card className="transition-all duration-200 hover:scale-105 hover:shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  {card.title}
                </CardTitle>
                <card.icon className={`h-4 w-4 ${card.color}`} />
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold">{card.value}</div>
                  <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 animate-fade-in" style={{ animationDelay: '0.4s' }}>
        <Card>
          <CardHeader>
            <CardTitle>Recent Assignments</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              No recent assignments to show.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming Events</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              No upcoming events to show.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}