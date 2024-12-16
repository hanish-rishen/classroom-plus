'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import {
  Search,
  FileText,
  Video,
  Image as ImageIcon,
  Link as LinkIcon,
  FileSpreadsheet,
  Presentation,
  Plus,
  Download,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { CartButton } from './components/CartButton';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { fetchWithRetry } from '@/lib/fetch-with-retry';

type Resource = {
  id: string;
  title: string;
  courseId: string;
  courseName: string;
  materials: {
    driveFile?: {
      driveFile: {
        id: string;
        title: string;
        alternateLink: string;
        mimeType?: string;
      };
    };
    link?: {
      url: string;
      title: string;
    };
    youtubeVideo?: {
      id: string;
      title: string;
      alternateLink: string;
    };
  }[];
};

export default function ResourcesPage() {
  const { data: session } = useSession();
  const [selectedCourse, setSelectedCourse] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const { addToCart, isInCart } = useCart();

  const { data, isLoading, error: queryError } = useQuery({
    queryKey: ['resources', session?.accessToken],
    queryFn: async () => {
      const response = await fetchWithRetry('/api/classroom/resources', {
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
    enabled: !!session?.accessToken,
  });

  const resources = data?.materials || [];
  const courses = data?.courses || [];
  const error = queryError instanceof Error ? queryError.message : null;

  const getFileIcon = (material: Resource['materials'][0]) => {
    if (material.driveFile?.driveFile?.title) {
      const fileName = material.driveFile.driveFile.title.toLowerCase();
      if (fileName.endsWith('.pdf')) return <FileText className="h-5 w-5 text-red-500" />;
      if (fileName.endsWith('.doc') || fileName.endsWith('.docx')) return <FileText className="h-5 w-5 text-blue-500" />;
      if (fileName.endsWith('.xls') || fileName.endsWith('.xlsx')) return <FileSpreadsheet className="h-5 w-5 text-green-500" />;
      if (fileName.endsWith('.ppt') || fileName.endsWith('.pptx')) return <Presentation className="h-5 w-5 text-orange-500" />;
    }
    
    if (material.link) return <LinkIcon className="h-5 w-5 text-blue-400" />;
    if (material.youtubeVideo) return <Video className="h-5 w-5 text-red-500" />;
    
    return <FileText className="h-5 w-5 text-muted-foreground" />;
  };

  const filteredResources = resources.filter((resource: Resource) => {
    const courseMatch = selectedCourse === 'all' || resource.courseId === selectedCourse;
    const searchLower = searchQuery.toLowerCase();
    const titleMatch = resource.title.toLowerCase().includes(searchLower);
    const fileMatch = resource.materials?.some((item: Resource['materials'][0]) => {
      const fileName = item.driveFile?.driveFile?.title || 
                      item.link?.title || 
                      item.youtubeVideo?.title || '';
      return fileName.toLowerCase().includes(searchLower);
    });
    return courseMatch && (titleMatch || fileMatch);
  });

  const handleDownloadFile = async (fileId: string, fileName: string) => {
    if (!session?.accessToken) return;
    
    try {
      const response = await fetch('/api/classroom/download', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.accessToken}`,
        },
        body: JSON.stringify({ 
          files: [{
            driveFileId: fileId,
            title: fileName
          }] 
        }),
      });

      if (!response.ok) throw new Error('Download failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Failed to download:', error);
    }
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-2xl font-bold md:text-3xl">Resources</h1>
          <CartButton />
        </div>
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          <Select value={selectedCourse} onValueChange={setSelectedCourse}>
            <SelectTrigger className="w-full md:w-[180px] focus:ring-primary">
              <SelectValue placeholder="All Classes" />
            </SelectTrigger>
            <SelectContent className="max-w-xs w-full sm:max-w-md overflow-x-hidden z-50">
              <SelectItem className="whitespace-normal break-words" value="all">All Classes</SelectItem>
              {courses.map((course: { id: string, name: string }) => (
                <SelectItem className="whitespace-normal break-words" key={course.id} value={course.id}>
                  {course.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search resources..."
              className="pl-8 focus:ring-primary focus:ring-2 focus:outline-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
          <Spinner className="h-12 w-12" />
          <p className="text-muted-foreground animate-pulse">Loading resources...</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
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
        <div className="grid gap-4">
          {filteredResources.map((resource: Resource) => (
            <div
              key={resource.id}
              className="bg-card rounded-lg border p-4 hover:bg-muted/50 transition-colors overflow-hidden"
            >
              <h3 className="font-medium">{resource.title}</h3>
              <p className="text-sm text-muted-foreground mt-1">{resource.courseName}</p>
              <div className="mt-4 grid gap-3 grid-cols-1">
                {resource.materials?.map((item: Resource['materials'][0], index: number) => {
                  const link = item.driveFile?.driveFile?.alternateLink || 
                             item.link?.url || 
                             item.youtubeVideo?.alternateLink;
                  const title = item.driveFile?.driveFile?.title || 
                              item.link?.title || 
                              item.youtubeVideo?.title || 
                              'View Resource';
                  const fileId = item.driveFile?.driveFile?.id;
                  
                  return link ? (
                    <div key={index} className="flex items-center gap-2 min-w-0">
                      <a
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 flex items-center gap-3 p-3 rounded-lg border bg-background hover:bg-muted transition-colors group min-w-0"
                      >
                        <div className="flex-shrink-0">
                          {getFileIcon(item)}
                        </div>
                        <span className="text-sm truncate group-hover:underline flex-1 min-w-0">
                          {title}
                        </span>
                      </a>
                      {fileId && (
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => addToCart({
                            id: fileId,
                            title,
                            courseId: resource.courseId,
                            courseName: resource.courseName,
                            driveFileId: fileId,
                            link
                          })}
                          disabled={isInCart(fileId)}
                          className="flex-shrink-0"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ) : null;
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}