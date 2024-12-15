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
  name: string;
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

    // Add delay between requests to respect rate limits
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    try {
      // Fetch all courses with pagination
      let allCourses: classroom_v1.Schema$Course[] = [];
      let pageToken: string | undefined | null = undefined;

      do {
        // Correct type annotation using GaxiosResponse
        const courseResponse: GaxiosResponse<classroom_v1.Schema$ListCoursesResponse> = await classroom.courses.list({
          pageSize: 50,  // Increased page size
          courseStates: ['ACTIVE'],
          fields: 'nextPageToken,courses(id,name,ownerId,section,room,enrollmentCode)',
          pageToken: pageToken || undefined,
        });

        const courses = courseResponse.data.courses || []; // Access data via .data
        allCourses = [...allCourses, ...courses];
        pageToken = courseResponse.data.nextPageToken; // Access data via .data

        // Add delay between pagination requests
        if (pageToken) {
          await delay(1000);
        }
      } while (pageToken);

      if (!allCourses.length) return NextResponse.json([]);

      // Process courses in smaller batches with longer delays
      const batchSize = 3; // Reduced batch size
      const classes: Class[] = [];

      for (let i = 0; i < allCourses.length; i += batchSize) {
        const batch = allCourses.slice(i, i + batchSize);
        
        // Process each batch
        const batchResults = await Promise.all(
          batch.map(async (course) => {
            try {
              await delay(500); // Add delay between each course request
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

              const result: BatchResult = {
                id: course.id || '',
                name: course.name || '',
                teacher: teacher.data.teachers?.[0]?.profile?.name?.fullName || 'Unknown Teacher', // Corrected property access
                students: students.data.students?.length || 0, // Corrected property access
                section: course.section || undefined,  // Changed this line
                room: course.room || undefined,       // Changed this line
                link: `https://classroom.google.com/c/${course.id}`,
              };

              return result;
            } catch (error) {
              console.error(`Error processing course ${course.id}:`, error);
              return null;
            }
          })
        );

        classes.push(...batchResults.filter((result): result is Class => result !== null));

        // Add longer delay between batches
        if (i + batchSize < allCourses.length) {
          await delay(2000); // 2 second delay between batches
        }
      }

      // Cache the results
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