import { NextResponse } from 'next/server';
import { google, classroom_v1 } from 'googleapis';
import { memoryCache } from '@/lib/cache';

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

type Course = classroom_v1.Schema$Course;
type CourseWork = classroom_v1.Schema$CourseWork;

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      console.log('No authorization token provided');
      return NextResponse.json({ error: 'No authorization token' }, { status: 401 });
    }

    const accessToken = authHeader.split(' ')[1];
    console.log('Access token received:', accessToken ? 'Valid' : 'Invalid');

    if (!checkRateLimit(accessToken)) {
      console.log('Rate limit exceeded for token');
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
    auth.setCredentials({ access_token: accessToken });

    const classroom = google.classroom({ version: 'v1', auth });

    try {
      console.log('Fetching courses...');
      const { data: { courses = [] } } = await classroom.courses.list({
        courseStates: ['ACTIVE'],
      });
      console.log(`Found ${courses.length} courses`);

      if (!courses.length) {
        console.log('No courses found, returning empty array');
        return NextResponse.json([]);
      }

      console.log('Fetching coursework for each course...');
      const courseWorkPromises = courses.map(async course => {
        if (!course.id) return null;
        try {
          const courseWork = await classroom.courses.courseWork.list({
            courseId: course.id,
            fields: 'courseWork(id,title,description,dueDate,dueTime,alternateLink)',
          });

          const workWithSubmissions = await Promise.all(
            (courseWork.data.courseWork || []).map(async work => {
              if (!work.id) return work;
              const submissions = await classroom.courses.courseWork.studentSubmissions.list({
                courseId: course.id!,
                courseWorkId: work.id,
              });
              return {
                ...work,
                state: submissions.data.studentSubmissions?.[0]?.state || 'CREATED'
              };
            })
          );

          return { data: { courseWork: workWithSubmissions } };
        } catch (error) {
          console.error(`Error fetching coursework for course ${course.id}:`, error);
          return null;
        }
      });

      const courseWorkResults = await Promise.all(courseWorkPromises);
      console.log('Coursework fetched, processing results...');

      const assignments = courses.flatMap((course, index) => {
        const courseWork = courseWorkResults[index]?.data?.courseWork || [];
        return courseWork.map(work => ({
          id: work.id,
          title: work.title || 'Untitled Assignment',
          description: work.description || '',
          dueDate: work.dueDate ? new Date(
            work.dueDate.year || new Date().getFullYear(),
            (work.dueDate.month || 1) - 1,
            work.dueDate.day || 1,
            work.dueTime?.hours || 23,
            work.dueTime?.minutes || 59
          ).toISOString() : null,
          courseId: course.id,
          courseName: course.name || 'Unnamed Course',
          state: work.state || 'CREATED',
          alternateLink: work.alternateLink || '',
        }));
      });

      console.log(`Processed ${assignments.length} total assignments`);
      return NextResponse.json(assignments);

    } catch (error) {
      console.error('Detailed API error:', error);
      throw error; // Re-throw to be caught by outer try-catch
    }
  } catch (error) {
    console.error('Error in GET handler:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch assignments',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}