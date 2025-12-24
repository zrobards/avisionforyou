import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/server/db";

/**
 * POST /api/client/meetings/[id]/reschedule
 * Client reschedules their own meeting - sets status to RESCHEDULED and requires admin confirmation
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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

    // Verify the user is the one who created the meeting or is an attendee
    const isCreator = meeting.createdBy === session.user.id;
    const isAttendee = meeting.attendees.includes(session.user.email || "") || 
                       meeting.attendees.includes(session.user.id);

    if (!isCreator && !isAttendee) {
      return NextResponse.json(
        { error: "You are not authorized to reschedule this meeting" },
        { status: 403 }
      );
    }

    // Store original times for reference
    const originalStartTime = meeting.startTime;
    const originalEndTime = meeting.endTime;

    // Update meeting with new times and set status to RESCHEDULED
    const updatedMeeting = await db.calendarEvent.update({
      where: { id },
      data: {
        startTime: new Date(newStartTime),
        endTime: new Date(newEndTime),
        status: "RESCHEDULED",
        description: `${meeting.description || ""}\n\n[Reschedule Request] ${reason || "Meeting rescheduled by client"}\nOriginal time: ${originalStartTime.toLocaleString()}\nNew time: ${new Date(newStartTime).toLocaleString()}`.trim(),
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

    // Create notification for admins
    const admins = await db.user.findMany({
      where: {
        role: { in: ["ADMIN", "CEO", "CFO", "STAFF"] },
      },
      select: { id: true },
    });

    if (admins.length > 0) {
      await db.notification.createMany({
        data: admins.map((admin) => ({
          userId: admin.id,
          type: "INFO",
          title: "Meeting Reschedule Request",
          message: `${session.user.name || session.user.email} requested to reschedule meeting "${meeting.title.replace('[Meeting Request] ', '')}" from ${originalStartTime.toLocaleString()} to ${new Date(newStartTime).toLocaleString()}.${reason ? ` Reason: ${reason}` : ''} Please review and confirm.`,
          projectId: meeting.projectId,
        })),
      });
    }

    // Create activity log
    await db.activity.create({
      data: {
        type: "MESSAGE",
        title: `Meeting reschedule requested: ${meeting.title.replace('[Meeting Request] ', '')}`,
        description: `${session.user.name || session.user.email} requested to reschedule the meeting. Awaiting admin confirmation.`,
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
      message: "Meeting reschedule requested. Admins will be notified to confirm.",
    });
  } catch (error: any) {
    console.error("Error rescheduling meeting:", error);
    return NextResponse.json(
      { error: error.message || "Failed to reschedule meeting" },
      { status: 500 }
    );
  }
}






