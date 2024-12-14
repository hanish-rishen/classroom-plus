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
    
    const response = await classroom.courses.list({
      pageSize: 20,
      courseStates: ['ACTIVE'],
    });

    const classes = response.data.courses?.map(course => ({
      id: course.id,
      name: course.name,
      section: course.section,
      enrollmentCode: course.enrollmentCode,
      updatedAt: course.updateTime,
      descriptionHeading: course.descriptionHeading,
      room: course.room,
      alternateLink: course.alternateLink, // Add this line
    })) || [];

    return NextResponse.json(classes);
  } catch (error) {
    console.error('Error fetching classes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch classes' },
      { status: 500 }
    );
  }
}
