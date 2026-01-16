import { NextRequest, NextResponse } from 'next/server';
import { requireBoardAccess } from '@/lib/board';
import { db } from '@/lib/db';
import { logBoardMeetingAction } from '@/lib/audit';

// GET - List all board meetings
export async function GET(request: NextRequest) {
  try {
    await requireBoardAccess();

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');

    const where: any = {};
    if (status) {
      where.status = status;
    }

    const meetings = await db.boardMeeting.findMany({
      where,
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { scheduledDate: 'desc' },
      take: limit,
    });

    return NextResponse.json(meetings);
  } catch (error) {
    console.error('Get board meetings error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch meetings' },
      { status: error instanceof Error && error.message.includes('Forbidden') ? 403 : 500 }
    );
  }
}

// POST - Create a new board meeting
export async function POST(request: NextRequest) {
  try {
    const { user } = await requireBoardAccess();
    const body = await request.json();

    const {
      title,
      description,
      type,
      scheduledDate,
      location,
      agenda,
      attendees,
    } = body;

    if (!title || !scheduledDate) {
      return NextResponse.json(
        { error: 'Title and scheduled date are required' },
        { status: 400 }
      );
    }

    const meeting = await db.boardMeeting.create({
      data: {
        title,
        description,
        type: type || 'REGULAR',
        scheduledDate: new Date(scheduledDate),
        location,
        agenda,
        attendees: attendees || [],
        createdById: (user as any).id,
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Log create action
    await logBoardMeetingAction('CREATE', meeting.id, (user as any).id, {
      title: meeting.title,
      scheduledDate: meeting.scheduledDate,
    });

    return NextResponse.json(meeting, { status: 201 });
  } catch (error) {
    console.error('Create board meeting error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create meeting' },
      { status: error instanceof Error && error.message.includes('Forbidden') ? 403 : 500 }
    );
  }
}
