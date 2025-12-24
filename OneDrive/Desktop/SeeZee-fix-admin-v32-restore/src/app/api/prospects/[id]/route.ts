import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { ProspectStatus, ActivityType } from '@prisma/client';

/**
 * GET /api/prospects/[id]
 * Get a single prospect by ID
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const allowedRoles = ['CEO', 'CFO', 'OUTREACH'];
    if (!allowedRoles.includes(session.user.role || '')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;

    const prospect = await prisma.prospect.findUnique({
      where: { id },
      include: {
        activities: {
          orderBy: { createdAt: 'desc' },
        },
        emails: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!prospect) {
      return NextResponse.json({ error: 'Prospect not found' }, { status: 404 });
    }

    return NextResponse.json({ prospect });
  } catch (error: any) {
    console.error('[GET /api/prospects/:id]', error);
    return NextResponse.json(
      { error: 'Failed to fetch prospect' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/prospects/[id]
 * Update a prospect (admin only)
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const allowedRoles = ['CEO', 'CFO', 'OUTREACH'];
    if (!allowedRoles.includes(session.user.role || '')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();
    const { status, internalNotes, tags, archived, convertedAt, convertedToLeadId, ...rest } = body;

    const existingProspect = await prisma.prospect.findUnique({
      where: { id },
    });

    if (!existingProspect) {
      return NextResponse.json({ error: 'Prospect not found' }, { status: 404 });
    }

    const updateData: any = { ...rest };
    let activityType: ActivityType | undefined;
    let activityDescription: string | undefined;

    if (status && status !== existingProspect.status) {
      updateData.status = status;
      activityType = ActivityType.STATUS_CHANGED;
      activityDescription = `Status changed from ${existingProspect.status} to ${status}`;
    }
    if (internalNotes !== undefined) updateData.internalNotes = internalNotes;
    if (tags !== undefined) updateData.tags = tags;
    if (archived !== undefined) {
      updateData.archived = archived;
      activityType = archived ? ActivityType.ARCHIVED : ActivityType.STATUS_CHANGED;
      activityDescription = archived ? 'Prospect archived' : 'Prospect unarchived';
    }
    if (convertedAt !== undefined) updateData.convertedAt = convertedAt ? new Date(convertedAt) : null;
    if (convertedToLeadId !== undefined) updateData.convertedToLeadId = convertedToLeadId;

    const updatedProspect = await prisma.prospect.update({
      where: { id },
      data: updateData,
    });

    if (activityType && activityDescription) {
      await prisma.prospectActivity.create({
        data: {
          prospectId: updatedProspect.id,
          type: activityType,
          description: activityDescription,
          metadata: {
            oldStatus: existingProspect.status,
            newStatus: updatedProspect.status,
            updatedBy: session.user.id,
          },
        },
      });
    }

    return NextResponse.json({ prospect: updatedProspect });
  } catch (error: any) {
    console.error('[PATCH /api/prospects/:id]', error);
    return NextResponse.json(
      { error: 'Failed to update prospect' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/prospects/[id]
 * Delete a prospect (CEO only)
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // CEO can delete, others can archive
    const allowedRoles = ['CEO', 'CFO', 'OUTREACH'];
    if (!allowedRoles.includes(session.user.role || '')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;

    const existingProspect = await prisma.prospect.findUnique({
      where: { id },
    });

    if (!existingProspect) {
      return NextResponse.json({ error: 'Prospect not found' }, { status: 404 });
    }

    await prisma.prospect.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[DELETE /api/prospects/:id]', error);
    return NextResponse.json(
      { error: 'Failed to delete prospect' },
      { status: 500 }
    );
  }
}
