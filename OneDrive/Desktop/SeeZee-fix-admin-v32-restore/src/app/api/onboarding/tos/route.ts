import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Force Node.js runtime for Prisma support
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    // Get session from auth() - it automatically reads from cookies
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { accepted } = await req.json();

    if (!accepted) {
      return NextResponse.json({ error: "Must accept terms" }, { status: 400 });
    }

    // Update user with ToS acceptance
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        tosAcceptedAt: new Date(),
        tosVersion: "1.0", // Track version for future updates
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("ToS acceptance error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
