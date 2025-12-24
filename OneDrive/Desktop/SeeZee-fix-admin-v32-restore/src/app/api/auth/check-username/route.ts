import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateUsername } from "@/lib/auth/validation";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const username = searchParams.get("username");
    
    if (!username) {
      return NextResponse.json(
        { error: "Username is required" },
        { status: 400 }
      );
    }
    
    // Validate username format
    const validation = validateUsername(username);
    if (!validation.valid) {
      return NextResponse.json(
        { available: false, error: validation.error },
        { status: 200 }
      );
    }
    
    // Check if username exists
    const existingUser = await prisma.user.findUnique({
      where: { username: username.toLowerCase() },
    });
    
    return NextResponse.json({
      available: !existingUser,
      username: username,
    });
  } catch (error) {
    console.error("Check username error:", error);
    return NextResponse.json(
      { error: "Failed to check username availability" },
      { status: 500 }
    );
  }
}










