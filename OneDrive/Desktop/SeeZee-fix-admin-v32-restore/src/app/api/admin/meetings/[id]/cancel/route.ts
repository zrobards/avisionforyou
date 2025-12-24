import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/server/db";

const ADMIN_ROLES = ["ADMIN", "CEO", "CFO", "STAFF", "FRONTEND", "BACKEND", "OUTREACH"];

/**
 * POST /api/admin/meetings/[id]/cancel
 * Admin cancels a meeting
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

    // Create notification for the client who created the meeting
    const clientUser = await db.user.findUnique({
      where: { id: meeting.createdBy },
      select: { id: true },
    });

    if (clientUser) {
      await db.notification.create({
        data: {
          userId: clientUser.id,
          type: "WARNING",
          title: "Meeting Cancelled",
          message: `Your meeting "${meeting.title.replace('[Meeting Request] ', '')}" has been cancelled by ${session.user.name || session.user.email}.${reason ? ` Reason: ${reason}` : ''}`,
          projectId: meeting.projectId,
        },
      });
    }

    // Notify all attendees
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
            .filter((user) => user.id !== meeting.createdBy) // Don't notify creator twice
            .map((user) => ({
              userId: user.id,
              type: "WARNING",
              title: "Meeting Cancelled",
              message: `The meeting "${meeting.title.replace('[Meeting Request] ', '')}" has been cancelled.${reason ? ` Reason: ${reason}` : ''}`,
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
      message: "Meeting cancelled. All participants have been notified.",
    });
  } catch (error: any) {
    console.error("Error cancelling meeting:", error);
    return NextResponse.json(
      { error: error.message || "Failed to cancel meeting" },
      { status: 500 }
    );
  }
}







