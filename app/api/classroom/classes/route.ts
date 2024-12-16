export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { google, classroom_v1 } from 'googleapis';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { cache } from '@/lib/cache';
import { GaxiosResponse } from 'googleapis-common'; // Add this import

interface Class {
  id: string;
  name: string;
  teacher: string;
  students: number;
  section?: string;
  room?: string;
  link: string;
}

interface Teacher {
  id: string;
}

interface BatchResult extends Class {} // Add this interface for type safety

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    const accessToken = authHeader?.split('Bearer ')[1];

    if (!accessToken) {
      console.error('No access token provided in request');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check cache first
    const cacheKey = `classes-${accessToken}`;
    const cachedData = cache.get<Class[]>(cacheKey);
    if (cachedData) {
      return NextResponse.json(cachedData);
    }

    // Initialize Google Classroom API client
    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: accessToken });
    const classroom = google.classroom({ version: 'v1', auth });

    try {
      // Fetch all courses with optimized pagination
      let allCourses: classroom_v1.Schema$Course[] = [];
      let pageToken: string | undefined | null = undefined;

      do {
        const courseResponse: GaxiosResponse<classroom_v1.Schema$ListCoursesResponse> = await classroom.courses.list({
          pageSize: 50,
          courseStates: ['ACTIVE'],
          // Add alternateLink to fields
          fields: 'nextPageToken,courses(id,name,ownerId,section,room,enrollmentCode,alternateLink)',
          pageToken: pageToken || undefined,
        });

        const courses = courseResponse.data.courses || [];
        allCourses = [...allCourses, ...courses];
        pageToken = courseResponse.data.nextPageToken;
      } while (pageToken);

      if (!allCourses.length) return NextResponse.json([]);

      const batchSize = 10;
      const classes: Class[] = [];

      for (let i = 0; i < allCourses.length; i += batchSize) {
        const batch = allCourses.slice(i, i + batchSize);
        const batchResults = await Promise.all(
          batch.map(async (course) => {
            try {
              const [students, teacher] = await Promise.all([
                classroom.courses.students.list({
                  courseId: course.id!,
                  fields: 'students(userId)',
                }),
                classroom.courses.teachers.list({
                  courseId: course.id!,
                  fields: 'teachers(userId,profile(name))',
                }),
              ]);

              const result: Class = {
                id: course.id || '',
                name: course.name || '',
                teacher: teacher.data.teachers?.[0]?.profile?.name?.fullName || 'Unknown Teacher',
                students: students.data.students?.length || 0,
                section: course.section || undefined,
                room: course.room || undefined,
                // Use alternateLink from Google Classroom API
                link: course.alternateLink || '',
              };

              return result;
            } catch (error) {
              console.error(`Error processing course ${course.id}:`, error);
              return null;
            }
          })
        );

        classes.push(...batchResults.filter((result): result is Class => result !== null));
      }

      // Cache the results for 5 minutes
      cache.set(cacheKey, classes);
      return NextResponse.json(classes);

    } catch (error: any) {
      if (error?.code === 429) {
        return NextResponse.json(
          { error: 'Rate limit exceeded', details: 'Please try again in a few minutes' },
          { status: 429 }
        );
      }
      throw error;
    }

  } catch (error: any) {
    console.error('Error in GET handler:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch classes',
        details: error.message || 'Unknown error' 
      }, 
      { status: 500 }
    );
  }
}