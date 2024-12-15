export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { google, classroom_v1 } from 'googleapis';

const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS = 30; // 30 requests per minute

const rateLimit = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(token: string): boolean {
  const now = Date.now();
  const userRateLimit = rateLimit.get(token);

  if (!userRateLimit || now > userRateLimit.resetTime) {
    rateLimit.set(token, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (userRateLimit.count >= MAX_REQUESTS) {
    return false;
  }

  userRateLimit.count++;
  return true;
}

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      console.log('No authorization token provided');
      return NextResponse.json({ error: 'No authorization token' }, { status: 401 });
    }

    const accessToken = authHeader.split(' ')[1];
    if (!checkRateLimit(accessToken)) {
      return NextResponse.json({ 
        error: 'Too many requests',
        retryAfter: RATE_LIMIT_WINDOW / 1000
      }, { 
        status: 429,
        headers: {
          'Retry-After': (RATE_LIMIT_WINDOW / 1000).toString()
        }
      });
    }

    const auth = new google.auth.OAuth2();
    auth.setCredentials({ 
      access_token: accessToken,
      scope: [
        'https://www.googleapis.com/auth/classroom.courses.readonly',
        'https://www.googleapis.com/auth/classroom.coursework.me',
        'https://www.googleapis.com/auth/classroom.courseworkmaterials',
        'https://www.googleapis.com/auth/classroom.courseworkmaterials.readonly'
      ].join(' ')
    });
    const classroom = google.classroom({ version: 'v1', auth });

    // Get list of courses
    const coursesResponse = await classroom.courses.list({
      courseStates: ['ACTIVE'],
    });
    const courses = coursesResponse.data.courses || [];

    // Get materials for each course
    const materials = await Promise.all(
      courses.map(async (course) => {
        if (!course.id) return [];
        
        try {
          // Get course work (assignments and materials)
          const courseWorkResponse = await classroom.courses.courseWork.list({
            courseId: course.id,
          });
          const courseWork = courseWorkResponse.data.courseWork || [];

          // Get course materials
          const materialsResponse = await classroom.courses.courseWorkMaterials.list({
            courseId: course.id,
          });
          const courseWorkMaterials = materialsResponse.data.courseWorkMaterial || []; // Fixed property name

          // Combine and format materials
          const allMaterials = [
            ...courseWork.filter((work: classroom_v1.Schema$CourseWork) => work.materials?.length),
            ...courseWorkMaterials
          ].map((item: classroom_v1.Schema$CourseWork | classroom_v1.Schema$CourseWorkMaterial) => ({
            id: item.id || '',
            title: item.title || '',
            courseId: course.id || '',
            courseName: course.name || '',
            materials: item.materials || []
          }));

          return allMaterials;
        } catch (error) {
          console.error(`Failed to fetch materials for course ${course.id}:`, error);
          return [];
        }
      })
    );

    const flattenedMaterials = materials.flat().filter(Boolean);
    
    return NextResponse.json({
      materials: flattenedMaterials,
      courses: courses.map(course => ({
        id: course.id || '',
        name: course.name || ''
      }))
    });

  } catch (error) {
    console.error('Failed to fetch resources:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch resources',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}