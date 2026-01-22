import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    const { taskId, projectId, responses } = data;

    // Validate required fields
    if (!taskId || !projectId || !responses) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify user has access to this project
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        organization: {
          members: {
            some: {
              userId: session.user.id,
            },
          },
        },
      },
    });

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found or access denied' },
        { status: 404 }
      );
    }

    // Create or update project questionnaire
    const questionnaire = await prisma.projectQuestionnaire.upsert({
      where: { projectId },
      update: {
        responses,
        completedAt: new Date(),
      },
      create: {
        projectId,
        taskId,
        responses,
        completedAt: new Date(),
      },
    });

    // Mark task as completed
    await prisma.clientTask.update({
      where: { id: taskId },
      data: {
        status: 'completed',
        completedAt: new Date(),
      },
    });

    // Create notification for admin/team
    // Find all users with admin/staff roles
    const admins = await prisma.user.findMany({
      where: {
        role: {
          in: ['CEO', 'CFO', 'ADMIN', 'FRONTEND', 'BACKEND'],
        },
      },
    });

    // Create notifications for all admins
    await Promise.all(
      admins.map((admin) =>
        prisma.notification.create({
          data: {
            title: 'Client Completed Questionnaire',
            message: `${session.user.name || session.user.email} has completed the project questionnaire for ${project.name}.`,
            type: 'INFO',
            userId: admin.id,
          },
        })
      )
    );

    return NextResponse.json({ success: true, questionnaire });
  } catch (error) {
    console.error('Failed to save detailed questionnaire:', error);
    return NextResponse.json(
      { error: 'Failed to save questionnaire' },
      { status: 500 }
    );
  }
}

