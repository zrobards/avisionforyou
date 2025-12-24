import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/server/db";

/**
 * POST /api/client/meetings/[id]/cancel
 * Client cancels their own meeting
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
    const { reason } = body;

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
        { error: "You are not authorized to cancel this meeting" },
        { status: 403 }
      );
    }

    // Don't allow canceling already cancelled meetings
    if (meeting.status === "CANCELLED") {
      return NextResponse.json(
        { error: "This meeting is already cancelled" },
        { status: 400 }
      );
    }

    // Update meeting to CANCELLED
    const updatedMeeting = await db.calendarEvent.update({
      where: { id },
      data: {
        status: "CANCELLED",
        description: `${meeting.description || ""}\n\n[Cancelled] Meeting cancelled by ${session.user.name || session.user.email} on ${new Date().toLocaleString()}.${reason ? ` Reason: ${reason}` : ''}`.trim(),
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
          type: "WARNING",
          title: "Meeting Cancelled by Client",
          message: `${session.user.name || session.user.email} cancelled the meeting "${meeting.title.replace('[Meeting Request] ', '')}".${reason ? ` Reason: ${reason}` : ''}`,
          projectId: meeting.projectId,
        })),
      });
    }

    // Notify other attendees (if not the creator)
    if (meeting.attendees && meeting.attendees.length > 0) {
      const attendeeUsers = await db.user.findMany({
        where: {
          OR: [
            { email: { in: meeting.attendees } },
            { id: { in: meeting.attendees } },
          ],
        },
        select: { id: true },
      });

      if (attendeeUsers.length > 0) {
        await db.notification.createMany({
          data: attendeeUsers
            .filter((user) => user.id !== session.user.id) // Don't notify the person who cancelled
            .map((user) => ({
              userId: user.id,
              type: "WARNING",
              title: "Meeting Cancelled",
              message: `The meeting "${meeting.title.replace('[Meeting Request] ', '')}" has been cancelled by ${session.user.name || session.user.email}.${reason ? ` Reason: ${reason}` : ''}`,
              projectId: meeting.projectId,
            })),
        });
      }
    }

    // Create activity log
    await db.activity.create({
      data: {
        type: "MESSAGE",
        title: `Meeting cancelled: ${meeting.title.replace('[Meeting Request] ', '')}`,
        description: `${session.user.name || session.user.email} cancelled the meeting.${reason ? ` Reason: ${reason}` : ''}`,
        userId: session.user.id,
        projectId: meeting.projectId || null,
        entityType: "CalendarEvent",
        entityId: meeting.id,
        metadata: {
          previousStatus: meeting.status,
          newStatus: "CANCELLED",
          reason: reason || null,
        },
      },
    });

    return NextResponse.json({
      success: true,
      meeting: updatedMeeting,
      message: "Meeting cancelled. All participants and admins have been notified.",
    });
  } catch (error: any) {
    console.error("Error cancelling meeting:", error);
    return NextResponse.json(
      { error: error.message || "Failed to cancel meeting" },
      { status: 500 }
    );
  }
}







