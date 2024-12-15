import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { google, classroom_v1 } from 'googleapis';
import { NextResponse } from 'next/server';

interface DashboardAssignment {
  id: string;
  title: string;
  courseName: string;
  dueDate?: string;
  alternateLink: string;
  creationTime: string;
}

interface DashboardAnnouncement {
  id: string;
  text: string;
  creationTime: string;
  courseName: string;
  alternateLink: string;
}

interface DashboardResource {
  id: string;
  title: string;
  courseName: string;
  alternateLink: string;
  materials: classroom_v1.Schema$Material[];
}

interface DashboardData {
  assignments: {
    recentlyAdded: DashboardAssignment[];
    total: number;
  };
  resources: {
    recentlyAdded: DashboardResource[];
    total: number;
  };
  announcements: DashboardAnnouncement[];
  classes: { id: string; name: string; teacherName: string; }[];
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const accessToken = session?.accessToken;

    if (!accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: accessToken });
    const classroom = google.classroom({ version: 'v1', auth });

    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    const allData: DashboardData = {
      assignments: { recentlyAdded: [], total: 0 },
      resources: { recentlyAdded: [], total: 0 },
      announcements: [],
      classes: [],
    };

    const coursesResponse = await classroom.courses.list({
      courseStates: ['ACTIVE'],
      pageSize: 20,
    });

    const courses = coursesResponse.data.courses || [];
    
    const batchSize = 5;

    for (let i = 0; i < courses.length; i += batchSize) {
      const batch = courses.slice(i, i + batchSize);
      
      await Promise.all(batch.map(async (course) => {
        try {
          await delay(500);

          const [courseWork, announcements, materials] = await Promise.all([
            classroom.courses.courseWork.list({
              courseId: course.id!,
              pageSize: 10,
              orderBy: 'updateTime desc'
            }).catch(() => ({ data: { courseWork: [] } })),

            classroom.courses.announcements.list({
              courseId: course.id!,
              pageSize: 5,
              orderBy: 'updateTime desc'
            }).catch(() => ({ data: { announcements: [] } })),

            classroom.courses.courseWorkMaterials.list({
              courseId: course.id!,
              pageSize: 5,
              orderBy: 'updateTime desc'
            }).catch(() => ({ data: { courseWorkMaterial: [] } }))
          ]);

          if (courseWork.data.courseWork) {
            courseWork.data.courseWork.forEach((work: classroom_v1.Schema$CourseWork) => {
              if (work.id && work.title) {
                const assignment: DashboardAssignment = {
                  id: work.id,
                  title: work.title,
                  courseName: course.name || '',
                  dueDate: work.dueDate ? new Date(
                    work.dueDate.year || 0,
                    (work.dueDate.month || 1) - 1,
                    work.dueDate.day || 1
                  ).toISOString() : undefined,
                  alternateLink: work.alternateLink || '',
                  creationTime: work.creationTime || new Date().toISOString(),
                };
                allData.assignments.recentlyAdded.push(assignment);
              }
            });
          }

          if (announcements.data.announcements) {
            announcements.data.announcements.forEach((announcement: classroom_v1.Schema$Announcement) => {
              if (announcement.id) {
                const dashboardAnnouncement: DashboardAnnouncement = {
                  id: announcement.id,
                  text: announcement.text || '',
                  creationTime: announcement.creationTime || new Date().toISOString(),
                  courseName: course.name || '',
                  alternateLink: announcement.alternateLink || '',
                };
                allData.announcements.push(dashboardAnnouncement);
              }
            });
          }

          if (materials.data.courseWorkMaterial) {
            materials.data.courseWorkMaterial.forEach((material: classroom_v1.Schema$CourseWorkMaterial) => {
              if (material.id && material.title) {
                const resource: DashboardResource = {
                  id: material.id,
                  title: material.title,
                  courseName: course.name || '',
                  alternateLink: material.alternateLink || '',
                  materials: material.materials || [],
                };
                allData.resources.recentlyAdded.push(resource);
              }
            });
          }
        } catch (error) {
          console.error(`Error processing course ${course.id}:`, error);
        }
      }));

      if (i + batchSize < courses.length) {
        await delay(1000);
      }
    }

    allData.assignments.recentlyAdded.sort((a, b) => 
      new Date(b.creationTime!).getTime() - new Date(a.creationTime!).getTime()
    );
    allData.assignments.recentlyAdded = allData.assignments.recentlyAdded.slice(0, 5);

    allData.announcements.sort((a, b) => 
      new Date(b.creationTime).getTime() - new Date(a.creationTime).getTime()
    );
    allData.announcements = allData.announcements.slice(0, 3);

    allData.resources.recentlyAdded.sort((a, b) => 
      new Date(b.id).getTime() - new Date(a.id).getTime()
    );
    allData.resources.recentlyAdded = allData.resources.recentlyAdded.slice(0, 5);

    return NextResponse.json(allData);

  } catch (error) {
    console.error('Dashboard Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}
