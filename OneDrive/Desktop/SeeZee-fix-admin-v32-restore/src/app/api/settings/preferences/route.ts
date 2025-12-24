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
    
    // Get user preferences
    const preferences = await prisma.userPreferences.findUnique({
      where: { userId: session.user.id },
    });
    
    return NextResponse.json({
      preferences: preferences || {
        theme: "dark",
        accentColor: "#dc2626",
        fontSize: "medium",
        reduceAnimations: false,
        language: "en",
        dateFormat: "MM/DD/YYYY",
        timeFormat: "12h",
        defaultView: "kanban",
        sidebarCollapsed: false,
        compactMode: false,
      },
    });
  } catch (error) {
    console.error("Get user preferences error:", error);
    return NextResponse.json(
      { error: "Failed to fetch user preferences" },
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
    
    // Update or create user preferences
    const preferences = await prisma.userPreferences.upsert({
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
      message: "User preferences updated successfully",
      preferences,
    });
  } catch (error) {
    console.error("Update user preferences error:", error);
    return NextResponse.json(
      { error: "Failed to update user preferences" },
      { status: 500 }
    );
  }
}










