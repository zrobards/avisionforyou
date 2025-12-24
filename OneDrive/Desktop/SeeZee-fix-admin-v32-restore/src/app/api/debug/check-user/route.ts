import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// DEBUG ENDPOINT - Remove in production
export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    
    if (!email) {
      return NextResponse.json({ error: "Email required" }, { status: 400 });
    }

    // Check for exact match
    const exactUser = await prisma.user.findUnique({
      where: { email: email },
      select: {
        id: true,
        email: true,
        password: true,
        emailVerified: true,
        role: true,
        name: true,
        createdAt: true,
      },
    });

    // Check for case-insensitive match
    const lowerUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: {
        id: true,
        email: true,
        password: true,
        emailVerified: true,
        role: true,
        name: true,
        createdAt: true,
      },
    });

    // Check all users with similar email
    const similarUsers = await prisma.user.findMany({
      where: {
        email: {
          contains: email.toLowerCase().split('@')[0],
        },
      },
      select: {
        id: true,
        email: true,
        password: true,
        emailVerified: true,
        role: true,
        name: true,
        createdAt: true,
      },
      take: 5,
    });

    return NextResponse.json({
      searchEmail: email,
      exactMatch: exactUser ? {
        ...exactUser,
        hasPassword: !!exactUser.password,
        passwordLength: exactUser.password?.length || 0,
        password: undefined, // Don't expose actual password
      } : null,
      lowerMatch: lowerUser ? {
        ...lowerUser,
        hasPassword: !!lowerUser.password,
        passwordLength: lowerUser.password?.length || 0,
        password: undefined,
      } : null,
      similarUsers: similarUsers.map(u => ({
        ...u,
        hasPassword: !!u.password,
        passwordLength: u.password?.length || 0,
        password: undefined,
      })),
    });
  } catch (error) {
    console.error("Debug check error:", error);
    return NextResponse.json(
      { error: "Failed to check user" },
      { status: 500 }
    );
  }
}








