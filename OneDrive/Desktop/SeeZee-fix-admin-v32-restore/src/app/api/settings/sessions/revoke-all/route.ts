import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/db";

export async function POST() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get current session ID from headers or token
    // For now, we'll delete all sessions and create a new one
    // In production, you'd want to preserve the current session
    
    const result = await prisma.userSession.deleteMany({
      where: {
        userId: session.user.id,
      },
    });

    return NextResponse.json({ 
      success: true,
      count: result.count 
    });
  } catch (error) {
    console.error("Error revoking all sessions:", error);
    return NextResponse.json(
      { error: "Failed to revoke sessions" },
      { status: 500 }
    );
  }
}




