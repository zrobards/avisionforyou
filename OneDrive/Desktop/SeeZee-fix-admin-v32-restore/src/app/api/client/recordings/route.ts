import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get organizations the user belongs to
    const userOrgs = await prisma.organizationMember.findMany({
      where: { userId: session.user.id },
      select: { organizationId: true }
    });

    const orgIds = userOrgs.map(om => om.organizationId);

    // Get projects from those organizations
    const projects = await prisma.project.findMany({
      where: { organizationId: { in: orgIds } },
      select: { id: true }
    });

    const projectIds = projects.map(p => p.id);

    // Fetch recordings that are associated with the user's projects
    // and have been marked as visible to clients by admin
    const recordings = await prisma.recording.findMany({
      where: {
        projectId: {
          in: projectIds.length > 0 ? projectIds : ['none'] // Fallback to no matches
        },
        status: 'TRANSCRIBED', // Only show completed recordings to clients
        isClientVisible: true, // Only show recordings admin has marked as visible
      },
      include: {
        project: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({ recordings });

  } catch (error) {
    console.error('Error fetching client recordings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recordings' },
      { status: 500 }
    );
  }
}
