import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/db";
import { parseUserAgent, getIPFromHeaders } from "@/lib/device/parser";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const sessions = await prisma.userSession.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        lastActive: "desc",
      },
    });

    // Identify current session by matching user agent and IP
    const userAgent = req.headers.get("user-agent") || "";
    const ipAddress = getIPFromHeaders(req.headers);
    const parsed = parseUserAgent(userAgent);

    // Find the current session by matching browser, OS, and IP
    const currentSessionId = sessions.find(s => 
      s.browser === parsed.browser &&
      s.os === parsed.os &&
      (ipAddress === "unknown" || s.ipAddress === ipAddress || 
       // Also match if IP is similar (for dynamic IPs)
       (s.ipAddress && ipAddress && s.ipAddress.split('.').slice(0, 3).join('.') === ipAddress.split('.').slice(0, 3).join('.')))
    )?.id;

    // Add current session flag to each session
    const sessionsWithCurrent = sessions.map(s => ({
      ...s,
      isCurrent: s.id === currentSessionId,
    }));

    return NextResponse.json({ 
      sessions: sessionsWithCurrent,
      currentSessionId 
    });
  } catch (error) {
    console.error("Error fetching sessions:", error);
    return NextResponse.json(
      { error: "Failed to fetch sessions" },
      { status: 500 }
    );
  }
}









