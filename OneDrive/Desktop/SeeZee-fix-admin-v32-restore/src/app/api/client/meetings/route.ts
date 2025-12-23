import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/server/db";

// GET: Fetch all meetings/calendar events for the current client
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's organizations
    const userOrgs = await db.organizationMember.findMany({
      where: { userId: session.user.id },
      select: { organizationId: true },
    });

    const orgIds = userOrgs.map((o) => o.organizationId);

    // Find all projects the user has access to
    const projects = await db.project.findMany({
      where: {
        organizationId: { in: orgIds.length > 0 ? orgIds : [] },
      },
      select: { id: true },
    });

    const projectIds = projects.map((p) => p.id);

    // Build the where clause conditionally
    const whereConditions: any[] = [];
    
    // Add project-based conditions
    if (projectIds.length > 0) {
      whereConditions.push({ projectId: { in: projectIds } });
    }
    
    // Add organization-based conditions
    if (orgIds.length > 0) {
      whereConditions.push({ organizationId: { in: orgIds } });
    }
    
    // Add attendee-based conditions (only if email or id exists)
    if (session.user.email) {
      whereConditions.push({ attendees: { has: session.user.email } });
    }
    if (session.user.id) {
      whereConditions.push({ attendees: { has: session.user.id } });
    }
    
    // Add createdBy condition
    whereConditions.push({ createdBy: session.user.id });

    // Get calendar events for user's projects and organizations
    const meetings = await db.calendarEvent.findMany({
      where: whereConditions.length > 0 ? { OR: whereConditions } : { createdBy: session.user.id },
      orderBy: { startTime: "desc" },
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

    return NextResponse.json({ meetings });
  } catch (error) {
    console.error("Error fetching client meetings:", error);
    return NextResponse.json(
      { error: "Failed to fetch meetings", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

// POST: Create a meeting request from the client dashboard
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id || !session.user.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { 
      title, 
      description, 
      preferredDate, 
      preferredTime,
      duration = 30, 
      projectId,
      meetingType = "GENERAL",
    } = body;

    if (!title) {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      );
    }

    // Parse the preferred date and time
    let startTime: Date;
    if (preferredDate && preferredTime) {
      startTime = new Date(`${preferredDate}T${preferredTime}`);
    } else if (preferredDate) {
      startTime = new Date(preferredDate);
    } else {
      // Default to tomorrow at 10 AM if no date provided
      startTime = new Date();
      startTime.setDate(startTime.getDate() + 1);
      startTime.setHours(10, 0, 0, 0);
    }

    // Calculate end time based on duration
    const endTime = new Date(startTime.getTime() + duration * 60 * 1000);

    // Get organization for the project if provided
    let organizationId: string | null = null;
    if (projectId) {
      const project = await db.project.findUnique({
        where: { id: projectId },
        select: { organizationId: true },
      });
      organizationId = project?.organizationId || null;
    }

    // Create the calendar event as a pending meeting request
    const meeting = await db.calendarEvent.create({
      data: {
        title: `[Meeting Request] ${title}`,
        description: description || `Meeting requested by ${session.user.name || session.user.email}\n\nType: ${meetingType}`,
        startTime,
        endTime,
        status: "PENDING", // Pending until admin approves
        createdBy: session.user.id,
        attendees: [session.user.email],
        projectId: projectId || null,
        organizationId,
        color: "#EF4444", // Red color for pending requests
      },
    });

    // Create an activity log
    await db.activity.create({
      data: {
        type: "MESSAGE",
        title: `Meeting request: ${title}`,
        description: `${session.user.name || session.user.email} requested a meeting`,
        userId: session.user.id,
        projectId: projectId || null,
        entityType: "CalendarEvent",
        entityId: meeting.id,
        metadata: {
          meetingType,
          preferredDate,
          preferredTime,
          duration,
        },
      },
    });

    // Create notification for admin
    const admins = await db.user.findMany({
      where: {
        role: { in: ["ADMIN", "CEO"] },
      },
      select: { id: true },
    });

    await db.notification.createMany({
      data: admins.map((admin) => ({
        userId: admin.id,
        type: "MEETING_REQUEST" as any,
        title: "New Meeting Request",
        message: `${session.user.name || session.user.email} has requested a meeting: ${title}`,
        projectId: projectId || null,
      })),
    });

    return NextResponse.json({ 
      success: true, 
      meeting,
      message: "Meeting request submitted successfully. We'll confirm the time soon!" 
    });
  } catch (error) {
    console.error("Error creating meeting request:", error);
    return NextResponse.json(
      { error: "Failed to create meeting request" },
      { status: 500 }
    );
  }
}
