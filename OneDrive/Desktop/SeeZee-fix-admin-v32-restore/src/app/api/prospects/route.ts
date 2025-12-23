import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/prospects
 * Fetch all unconverted prospects
 */
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only CEO, CFO, or OUTREACH roles can access
    const allowedRoles = ["CEO", "CFO", "OUTREACH"];
    if (!allowedRoles.includes(session.user.role || "")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const converted = searchParams.get("converted");

    const prospects = await prisma.prospect.findMany({
      where: {
        ...(converted === "true" 
          ? { convertedAt: { not: null } }
          : { convertedAt: null }
        ),
      },
      orderBy: [
        { leadScore: "desc" },
        { createdAt: "desc" },
      ],
    });

    return NextResponse.json({ prospects });
  } catch (error: any) {
    console.error("Error fetching prospects:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch prospects" },
      { status: 500 }
    );
  }
}

