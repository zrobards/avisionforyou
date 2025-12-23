import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/server/db";

const ADMIN_ROLES = ["ADMIN", "CEO", "CFO", "STAFF", "FRONTEND", "BACKEND", "OUTREACH"];

/**
 * POST /api/admin/meetings/[id]/approve
 * Admin approves a pending meeting request and confirms it
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user has admin role
    if (!ADMIN_ROLES.includes(session.user.role || "")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();
    const { meetingUrl, notes } = body;

    // Get the meeting
    const meeting = await db.calendarEvent.findUnique({
      where: { id },
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        organization: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!meeting) {
      return NextResponse.json({ error: "Meeting not found" }, { status: 404 });
    }

    if (meeting.status !== "PENDING") {
      return NextResponse.json(
        { error: "Only pending meetings can be approved" },
        { status: 400 }
      );
    }

    // Update meeting to SCHEDULED (confirmed)
    const updatedMeeting = await db.calendarEvent.update({
      where: { id },
      data: {
        status: "SCHEDULED",
        meetingUrl: meetingUrl || meeting.meetingUrl,
        description: notes 
          ? `${meeting.description || ""}\n\n[Admin Notes] ${notes}`.trim()
          : meeting.description,
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        organization: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Create notification for the client who requested the meeting
    const clientUser = await db.user.findUnique({
      where: { id: meeting.createdBy },
      select: { id: true },
    });

    if (clientUser) {
      await db.notification.create({
        data: {
          userId: clientUser.id,
          type: "SUCCESS",
          title: "Meeting Confirmed",
          message: `Your meeting "${meeting.title.replace('[Meeting Request] ', '')}" has been confirmed.`,
          projectId: meeting.projectId,
        },
      });
    }

    // Create activity log
    await db.activity.create({
      data: {
        type: "MESSAGE",
        title: `Meeting approved: ${meeting.title.replace('[Meeting Request] ', '')}`,
        description: `${session.user.name || session.user.email} approved the meeting`,
        userId: session.user.id,
        projectId: meeting.projectId || null,
        entityType: "CalendarEvent",
        entityId: meeting.id,
        metadata: {
          previousStatus: "PENDING",
          newStatus: "SCHEDULED",
        },
      },
    });

    return NextResponse.json({
      success: true,
      meeting: updatedMeeting,
      message: "Meeting approved and confirmed",
    });
  } catch (error: any) {
    console.error("Error approving meeting:", error);
    return NextResponse.json(
      { error: error.message || "Failed to approve meeting" },
      { status: 500 }
    );
  }
}

