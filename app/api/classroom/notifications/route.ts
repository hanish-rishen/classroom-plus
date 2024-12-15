export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { google, classroom_v1 } from 'googleapis';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: session.accessToken });
    const classroom = google.classroom({ version: 'v1', auth });

    // Fetch recent course work as a proxy for notifications
    const coursesResponse = await classroom.courses.list({
      courseStates: ['ACTIVE'],
      pageSize: 50,
      fields: 'courses(id,name)',
    });

    const courses = coursesResponse.data.courses || [];

    const notifications: any[] = [];

    for (const course of courses) {
      const courseWorkResponse = await classroom.courses.courseWork.list({
        courseId: course.id!,
        pageSize: 10,
        orderBy: 'updateTime desc',
        fields: 'courseWork(id,title,updateTime)',
      });

      const courseWork = courseWorkResponse.data.courseWork || [];

      courseWork.forEach((work) => {
        notifications.push({
          id: work.id,
          type: 'CourseWork',
          title: work.title,
          message: `Updated coursework: ${work.title}`,
          timestamp: work.updateTime || new Date().toISOString(),
          link: `https://classroom.google.com/c/${course.id}/a/${work.id}`,
          read: false, // Default to unread
          courseId: course.id,
          courseworkId: work.id,
          courseName: course.name || 'Unknown Course', // Added courseName
        });
      });
    }

    // Sort notifications by timestamp (newest first)
    notifications.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    return NextResponse.json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
  }
}
