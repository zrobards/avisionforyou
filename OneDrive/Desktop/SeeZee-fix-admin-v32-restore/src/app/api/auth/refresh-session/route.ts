import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

// Force Node.js runtime for Prisma support
export const runtime = "nodejs";

/**
 * Diagnostic endpoint to check and refresh user session
 * This forces a JWT refresh by triggering the update callback
 */
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id || !session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get current token to see what's cached
    const token = await getToken({
      req,
      secureCookie: process.env.NODE_ENV === 'production',
    });

    // Fetch fresh user data from database
    const dbUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        role: true,
        tosAcceptedAt: true,
        profileDoneAt: true,
        questionnaireCompleted: true,
        emailVerified: true,
        password: true,
      },
    });

    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Compare database state with token state
    const tokenTosAccepted = token?.tosAccepted === true;
    const tokenProfileDone = token?.profileDone === true;
    const dbTosAccepted = !!dbUser.tosAcceptedAt;
    const dbProfileDone = !!dbUser.profileDoneAt;

    const mismatches = [];
    if (tokenTosAccepted !== dbTosAccepted) {
      mismatches.push(`ToS: token=${tokenTosAccepted}, db=${dbTosAccepted}`);
    }
    if (tokenProfileDone !== dbProfileDone) {
      mismatches.push(`Profile: token=${tokenProfileDone}, db=${dbProfileDone}`);
    }

    return NextResponse.json({
      success: true,
      diagnostic: {
        userId: dbUser.id,
        email: dbUser.email,
        role: dbUser.role,
        databaseState: {
          tosAcceptedAt: dbUser.tosAcceptedAt?.toISOString() || null,
          profileDoneAt: dbUser.profileDoneAt?.toISOString() || null,
          questionnaireCompleted: dbUser.questionnaireCompleted?.toISOString() || null,
          emailVerified: !!dbUser.emailVerified,
          hasPassword: !!dbUser.password,
        },
        tokenState: {
          tosAccepted: tokenTosAccepted,
          profileDone: tokenProfileDone,
          role: token?.role,
        },
        mismatches: mismatches.length > 0 ? mismatches : null,
        recommendation: mismatches.length > 0 
          ? "Session token is out of sync. Sign out and sign back in to refresh your session."
          : "Session is in sync. If you're still having issues, try signing out and back in.",
      },
    });
  } catch (error) {
    console.error("Session refresh error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

/**
 * Force refresh the session by updating it
 * This triggers the JWT callback with trigger === "update"
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id || !session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch fresh user data from database
    const dbUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        role: true,
        tosAcceptedAt: true,
        profileDoneAt: true,
        questionnaireCompleted: true,
        emailVerified: true,
      },
    });

    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Return data that the frontend can use to update the session
    // The frontend will need to call session.update() with this data
    return NextResponse.json({
      success: true,
      sessionUpdate: {
        role: dbUser.role,
        tosAcceptedAt: dbUser.tosAcceptedAt?.toISOString() || null,
        profileDoneAt: dbUser.profileDoneAt?.toISOString() || null,
        questionnaireCompleted: dbUser.questionnaireCompleted?.toISOString() || null,
        emailVerified: !!dbUser.emailVerified,
      },
      message: "Call session.update() with the sessionUpdate data to refresh your session",
    });
  } catch (error) {
    console.error("Session refresh error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}






