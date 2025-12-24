import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/db";
import { parseUserAgent, getIPFromHeaders } from "@/lib/device/parser";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Identify current session to preserve it
    const userAgent = req.headers.get("user-agent") || "";
    const ipAddress = getIPFromHeaders(req.headers);
    const parsed = parseUserAgent(userAgent);

    // Find current session
    const currentSession = await prisma.userSession.findFirst({
      where: {
        userId: session.user.id,
        browser: parsed.browser,
        os: parsed.os,
        ipAddress: ipAddress !== "unknown" ? ipAddress : undefined,
      },
      orderBy: {
        lastActive: "desc",
      },
    });

    // Delete all sessions except the current one
    const result = await prisma.userSession.deleteMany({
      where: {
        userId: session.user.id,
        ...(currentSession ? { id: { not: currentSession.id } } : {}),
      },
    });

    return NextResponse.json({ 
      success: true,
      count: result.count,
      preserved: currentSession ? 1 : 0
    });
  } catch (error) {
    console.error("Error revoking all sessions:", error);
    return NextResponse.json(
      { error: "Failed to revoke sessions" },
      { status: 500 }
    );
  }
}











