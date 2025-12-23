import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/server/db";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    const body = await req.json();

    const { subscriptionId, projectId, billingDate } = body;

    if (!subscriptionId || !billingDate) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Verify the subscription belongs to the user
    const maintenancePlan = await db.maintenancePlan.findFirst({
      where: {
        id: subscriptionId,
        project: {
          organization: {
            members: {
              some: {
                userId: session.user.id,
              },
            },
          },
        },
      },
      include: {
        project: true,
      },
    });

    if (!maintenancePlan) {
      return NextResponse.json(
        { error: "Subscription not found or access denied" },
        { status: 404 }
      );
    }

    // Check if billing date event already exists
    const existingEvent = await db.calendarEvent.findFirst({
      where: {
        title: {
          contains: `Billing Date: ${maintenancePlan.project.name}`,
        },
        startTime: new Date(billingDate),
        createdBy: session.user.id,
      },
    });

    if (existingEvent) {
      return NextResponse.json(
        { error: "Billing date already added to calendar" },
        { status: 400 }
      );
    }

    // Get organization ID
    const orgMember = await db.organizationMember.findFirst({
      where: {
        userId: session.user.id,
        organizationId: maintenancePlan.project.organizationId,
      },
    });

    // Create calendar event for billing date
    const event = await db.calendarEvent.create({
      data: {
        title: `Billing Date: ${maintenancePlan.project.name}`,
        description: `Next billing date for ${maintenancePlan.project.name}`,
        startTime: new Date(billingDate),
        endTime: new Date(billingDate),
        allDay: true,
        timezone: "America/New_York",
        organizationId: maintenancePlan.project.organizationId || null,
        projectId: maintenancePlan.projectId,
        createdBy: session.user.id,
        attendees: [session.user.email || ''],
        color: "#8B5CF6", // Purple for billing
        status: "SCHEDULED",
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

    return NextResponse.json({
      success: true,
      event,
      message: "Billing date added to calendar successfully",
    });
  } catch (error) {
    console.error("Error adding billing date to calendar:", error);
    return NextResponse.json(
      { error: "Failed to add billing date to calendar" },
      { status: 500 }
    );
  }
}

