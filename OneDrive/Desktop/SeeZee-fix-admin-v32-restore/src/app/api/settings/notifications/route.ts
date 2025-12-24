import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    // Get notification preferences
    const preferences = await prisma.notificationPreferences.findUnique({
      where: { userId: session.user.id },
    });
    
    return NextResponse.json({
      preferences: preferences || {
        projectUpdatesEmail: true,
        billingEmail: true,
        marketingEmail: false,
        securityEmail: true,
        projectUpdatesApp: true,
        billingApp: true,
        securityApp: true,
        browserPushEnabled: false,
        digestFrequency: "none",
      },
    });
  } catch (error) {
    console.error("Get notification preferences error:", error);
    return NextResponse.json(
      { error: "Failed to fetch notification preferences" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    const body = await request.json();
    
    // Update or create notification preferences
    const preferences = await prisma.notificationPreferences.upsert({
      where: { userId: session.user.id },
      update: {
        ...body,
        updatedAt: new Date(),
      },
      create: {
        userId: session.user.id,
        ...body,
      },
    });
    
    return NextResponse.json({
      success: true,
      message: "Notification preferences updated successfully",
      preferences,
    });
  } catch (error) {
    console.error("Update notification preferences error:", error);
    return NextResponse.json(
      { error: "Failed to update notification preferences" },
      { status: 500 }
    );
  }
}











