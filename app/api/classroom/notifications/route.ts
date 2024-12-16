export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { google, classroom_v1 } from 'googleapis';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// Update the helper function at the top of the file
function decodeGoogleId(encodedId: string): string {
  const base64Regex = /^[A-Za-z0-9+/=_-]+$/;
  
  if (!base64Regex.test(encodedId)) {
    return encodedId;
  }

  try {
    return Buffer.from(encodedId, 'base64url').toString('ascii');
  } catch (error) {
    console.error('Error decoding ID:', error);
    return encodedId;
  }
}

// Add these helper functions at the top
function formatClassroomId(id: string): string {
  // Remove any non-numeric characters
  const numericId = id.replace(/\D/g, '');
  // Convert to decimal if it's a valid number
  try {
    return numericId;
  } catch (error) {
    console.error('Error formatting ID:', error);
    return id;
  }
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
        // Add alternateLink to fields
        fields: 'courseWork(id,title,updateTime,alternateLink)',
      });

      const courseWork = courseWorkResponse.data.courseWork || [];

      courseWork.forEach((work) => {
        notifications.push({
          id: work.id,
          type: 'CourseWork',
          title: work.title,
          message: `Updated coursework: ${work.title}`,
          timestamp: work.updateTime || new Date().toISOString(),
          // Use the alternateLink from Google Classroom API
          link: work.alternateLink || '',
          read: false,
          courseId: course.id,
          courseworkId: work.id,
          courseName: course.name || 'Unknown Course',
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
