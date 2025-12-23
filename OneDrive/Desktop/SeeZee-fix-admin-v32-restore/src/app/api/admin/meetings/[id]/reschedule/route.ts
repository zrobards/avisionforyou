import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/server/db";

const ADMIN_ROLES = ["ADMIN", "CEO", "CFO", "STAFF", "FRONTEND", "BACKEND", "OUTREACH"];

/**
 * POST /api/admin/meetings/[id]/reschedule
 * Admin reschedules a meeting - sets status to RESCHEDULED and requires client confirmation
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
    const { newStartTime, newEndTime, reason } = body;

    if (!newStartTime || !newEndTime) {
      return NextResponse.json(
        { error: "newStartTime and newEndTime are required" },
        { status: 400 }
      );
    }

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

    // Store original times in metadata for reference
    const originalStartTime = meeting.startTime;
    const originalEndTime = meeting.endTime;

    // Update meeting with new times and set status to RESCHEDULED
    const updatedMeeting = await db.calendarEvent.update({
      where: { id },
      data: {
        startTime: new Date(newStartTime),
        endTime: new Date(newEndTime),
        status: "RESCHEDULED",
        description: `${meeting.description || ""}\n\n[Reschedule Request] ${reason || "Meeting rescheduled by admin"}\nOriginal time: ${originalStartTime.toLocaleString()}\nNew time: ${new Date(newStartTime).toLocaleString()}`.trim(),
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

    // Create notification for the client
    const clientUser = await db.user.findUnique({
      where: { id: meeting.createdBy },
      select: { id: true },
    });

    if (clientUser) {
      await db.notification.create({
        data: {
          userId: clientUser.id,
          type: "INFO",
          title: "Meeting Rescheduled",
          message: `Your meeting "${meeting.title.replace('[Meeting Request] ', '')}" has been rescheduled from ${originalStartTime.toLocaleString()} to ${new Date(newStartTime).toLocaleString()}.${reason ? ` Reason: ${reason}` : ''} Please confirm the new time.`,
          projectId: meeting.projectId,
        },
      });
    }

    // Create activity log
    await db.activity.create({
      data: {
        type: "MESSAGE",
        title: `Meeting rescheduled: ${meeting.title.replace('[Meeting Request] ', '')}`,
        description: `${session.user.name || session.user.email} rescheduled the meeting. Awaiting client confirmation.`,
        userId: session.user.id,
        projectId: meeting.projectId || null,
        entityType: "CalendarEvent",
        entityId: meeting.id,
        metadata: {
          previousStatus: meeting.status,
          newStatus: "RESCHEDULED",
          originalStartTime: originalStartTime.toISOString(),
          newStartTime: newStartTime,
          reason: reason || null,
        },
      },
    });

    return NextResponse.json({
      success: true,
      meeting: updatedMeeting,
      message: "Meeting rescheduled. Client will be notified to confirm.",
    });
  } catch (error: any) {
    console.error("Error rescheduling meeting:", error);
    return NextResponse.json(
      { error: error.message || "Failed to reschedule meeting" },
      { status: 500 }
    );
  }
}

