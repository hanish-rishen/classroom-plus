import { google } from 'googleapis';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

interface ExtendedSession {
  accessToken?: string;
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions) as ExtendedSession;
    
    if (!session?.accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: session.accessToken });

    const classroom = google.classroom({ version: 'v1', auth });
    
    // First get all courses
    const coursesResponse = await classroom.courses.list({
      pageSize: 20,
      courseStates: ['ACTIVE'],
    });

    const courses = coursesResponse.data.courses || [];

    // Then get announcements for each course
    const announcements = [];
    for (const course of courses) {
      try {
        const announcementsResponse = await classroom.courses.announcements.list({
          courseId: course.id!,
          pageSize: 20,
          announcementStates: ['PUBLISHED'],
        });

        if (announcementsResponse.data.announcements) {
          announcements.push(
            ...announcementsResponse.data.announcements.map(announcement => ({
              id: announcement.id,
              text: announcement.text,
              creationTime: announcement.creationTime,
              updateTime: announcement.updateTime,
              courseName: course.name,
              courseId: course.id,
              materials: announcement.materials,
              creatorUserId: announcement.creatorUserId,
              alternateLink: announcement.alternateLink,
            }))
          );
        }
      } catch (error) {
        console.error(`Error fetching announcements for course ${course.id}:`, error);
      }
    }

    // Sort by creation time, newest first
    announcements.sort((a, b) => 
      new Date(b.creationTime!).getTime() - new Date(a.creationTime!).getTime()
    );

    return NextResponse.json(announcements);
  } catch (error) {
    console.error('Error fetching announcements:', error);
    return NextResponse.json(
      { error: 'Failed to fetch announcements' },
      { status: 500 }
    );
  }
}
