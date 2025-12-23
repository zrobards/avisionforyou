import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/server/db";

/**
 * POST /api/client/meetings/[id]/confirm-reschedule
 * Client confirms a rescheduled meeting
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
        { error: "You are not authorized to confirm this meeting" },
        { status: 403 }
      );
    }

    if (meeting.status !== "RESCHEDULED") {
      return NextResponse.json(
        { error: "This meeting is not awaiting reschedule confirmation" },
        { status: 400 }
      );
    }

    // Update meeting to SCHEDULED (confirmed)
    const updatedMeeting = await db.calendarEvent.update({
      where: { id },
      data: {
        status: "SCHEDULED",
        description: `${meeting.description || ""}\n\n[Client Confirmed] Reschedule confirmed by ${session.user.name || session.user.email} on ${new Date().toLocaleString()}`.trim(),
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
        role: { in: ["ADMIN", "CEO", "CFO"] },
      },
      select: { id: true },
    });

    await db.notification.createMany({
      data: admins.map((admin) => ({
        userId: admin.id,
        type: "SUCCESS",
        title: "Rescheduled Meeting Confirmed",
        message: `${session.user.name || session.user.email} confirmed the rescheduled meeting: "${meeting.title.replace('[Meeting Request] ', '')}"`,
        projectId: meeting.projectId,
      })),
    });

    // Create activity log
    await db.activity.create({
      data: {
        type: "MESSAGE",
        title: `Rescheduled meeting confirmed: ${meeting.title.replace('[Meeting Request] ', '')}`,
        description: `${session.user.name || session.user.email} confirmed the rescheduled meeting time`,
        userId: session.user.id,
        projectId: meeting.projectId || null,
        entityType: "CalendarEvent",
        entityId: meeting.id,
        metadata: {
          previousStatus: "RESCHEDULED",
          newStatus: "SCHEDULED",
        },
      },
    });

    return NextResponse.json({
      success: true,
      meeting: updatedMeeting,
      message: "Rescheduled meeting confirmed",
    });
  } catch (error: any) {
    console.error("Error confirming rescheduled meeting:", error);
    return NextResponse.json(
      { error: error.message || "Failed to confirm rescheduled meeting" },
      { status: 500 }
    );
  }
}

