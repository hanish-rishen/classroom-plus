'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  FolderPlus,
  Search,
  FileText,
  Video,
  Image as ImageIcon,
  Link as LinkIcon,
} from 'lucide-react';

const resources = [
  {
    id: 1,
    name: 'Mathematics Notes',
    type: 'document',
    subject: 'Mathematics',
    date: '2024-02-15',
    icon: FileText,
  },
  {
    id: 2,
    name: 'History Video Lecture',
    type: 'video',
    subject: 'History',
    date: '2024-02-14',
    icon: Video,
  },
  {
    id: 3,
    name: 'Biology Diagrams',
    type: 'image',
    subject: 'Biology',
    date: '2024-02-13',
    icon: ImageIcon,
  },
  {
    id: 4,
    name: 'Physics Reference',
    type: 'link',
    subject: 'Physics',
    date: '2024-02-12',
    icon: LinkIcon,
  },
];

export default function ResourcesPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold md:text-3xl">Resources</h1>
        <Button>
          <FolderPlus className="mr-2 h-4 w-4" />
          Add Resource
        </Button>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search resources..."
            className="pl-8"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {resources.map((resource) => (
          <Card key={resource.id} className="cursor-pointer hover:bg-muted/50">
            <CardHeader className="flex flex-row items-center space-x-4 pb-2">
              <resource.icon className="h-8 w-8 text-primary" />
              <div className="space-y-1">
                <CardTitle className="text-base">{resource.name}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {resource.subject}
                </p>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Added on {new Date(resource.date).toLocaleDateString()}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}