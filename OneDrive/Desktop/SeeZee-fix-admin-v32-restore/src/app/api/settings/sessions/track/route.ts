import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/db";
import { parseUserAgent, getIPFromHeaders, getLocationFromIP } from "@/lib/device/parser";

/**
 * Create or update a user session
 * Called on login and periodically to update lastActive
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userAgent = req.headers.get("user-agent") || "";
    const ipAddress = getIPFromHeaders(req.headers);
    
    // Parse device info
    const parsed = parseUserAgent(userAgent);
    const deviceInfo = `${parsed.deviceType} - ${parsed.device}`;
    
    // Get location (async, but we'll do it in background)
    let location: string | undefined;
    if (ipAddress && ipAddress !== "unknown") {
      try {
        const locData = await getLocationFromIP(ipAddress);
        location = locData.location;
      } catch (error) {
        // Silently fail location lookup
        console.error("Location lookup failed:", error);
      }
    }

    // Create a session fingerprint (user agent + IP for uniqueness)
    // In production, you might want to use a more sophisticated fingerprint
    const sessionFingerprint = `${userAgent}-${ipAddress}`;

    // Check if a similar session exists (same user agent and IP)
    const existingSession = await prisma.userSession.findFirst({
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

    if (existingSession) {
      // Update existing session
      const updated = await prisma.userSession.update({
        where: { id: existingSession.id },
        data: {
          lastActive: new Date(),
          location: location || existingSession.location,
        },
      });

      return NextResponse.json({ 
        session: updated,
        isNew: false 
      });
    } else {
      // Create new session
      const newSession = await prisma.userSession.create({
        data: {
          userId: session.user.id,
          deviceInfo,
          browser: parsed.browser,
          os: parsed.os,
          ipAddress: ipAddress !== "unknown" ? ipAddress : undefined,
          location,
          lastActive: new Date(),
        },
      });

      return NextResponse.json({ 
        session: newSession,
        isNew: true 
      });
    }
  } catch (error) {
    console.error("Error tracking session:", error);
    return NextResponse.json(
      { error: "Failed to track session" },
      { status: 500 }
    );
  }
}

