import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { google, classroom_v1 } from 'googleapis';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

interface DashboardStats {
  classes: number;
  assignments: {
    total: number;
    pending: number;
    missing: number;
    completed: number;
  };
  resources: number;
  announcements: number;
  // Removed notifications from DashboardStats
  // notifications: Array<{
  //   id: string;
  //   type: string;
  //   title: string;
  //   message: string;
  //   timestamp: string;
  //   link?: string;
  //   read?: boolean;
  //   courseId?: string;
  //   courseworkId?: string;
  // }>;
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: session.accessToken });
    const classroom = google.classroom({ version: 'v1', auth });

    const coursesResponse = await classroom.courses.list({
      courseStates: ['ACTIVE'],
    }).catch(() => ({ data: { courses: [] } }));

    const courses = coursesResponse.data.courses || [];

    const stats: DashboardStats = {
      classes: courses.length,
      assignments: {
        total: 0,
        pending: 0,
        missing: 0,
        completed: 0,
      },
      resources: 0,
      announcements: 0,
      // Removed notifications initialization
      // notifications: [],
    };

    // Process each course
    await Promise.all(courses.map(async (course) => {
      try {
        const [courseWorkResponse, materialsResponse] = await Promise.all([
          classroom.courses.courseWork.list({
            courseId: course.id!,
            fields: 'courseWork(id,state,dueDate)',
          }).catch(() => ({ data: null })),

          classroom.courses.courseWorkMaterials.list({
            courseId: course.id!,
          }).catch(() => ({ data: null })),
        ]);

        // Process course work
        const courseWork = courseWorkResponse.data;
        if (courseWork && courseWork.courseWork) {
          stats.assignments.total += courseWork.courseWork.length;
          courseWork.courseWork.forEach((work) => {
            if (work.state === 'CREATED') stats.assignments.pending++;
            if (work.state === 'TURNED_IN') stats.assignments.completed++;
            if (work.state === 'CREATED' && work.dueDate) {
              const dueDate = new Date(
                work.dueDate.year || 0,
                (work.dueDate.month || 1) - 1,
                work.dueDate.day || 1
              );
              if (dueDate < new Date()) {
                stats.assignments.missing++;
              }
            }
          });
        }

        // Process materials
        const materials = materialsResponse.data;
        if (materials && materials.courseWorkMaterial) {
          stats.resources += materials.courseWorkMaterial.length;
        }

        // Removed invalid notifications processing
        // The userProfiles.get method doesn't return 'notifications'
        // You can implement valid notifications fetching here if available

      } catch (error) {
        console.error(`Error processing course ${course.id}:`, error);
      }
    }));

    // No more slicing to show all notifications
    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
