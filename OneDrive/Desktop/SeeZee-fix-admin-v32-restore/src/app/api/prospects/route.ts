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
    const status = searchParams.get("status");
    const archived = searchParams.get("archived");
    const hasWebsite = searchParams.get("hasWebsite");
    const minScore = searchParams.get("minScore");
    const maxScore = searchParams.get("maxScore");
    const search = searchParams.get("search");
    const tag = searchParams.get("tag");
    const limit = parseInt(searchParams.get("limit") || "100");
    const offset = parseInt(searchParams.get("offset") || "0");

    // Build where clause
    const where: any = {
      ...(converted === "true" 
        ? { convertedAt: { not: null } }
        : { convertedAt: null }
      ),
    };

    if (status) {
      where.status = status;
    }

    // Handle archived filter
    if (archived !== null && archived !== undefined && archived !== "") {
      where.archived = archived === "true";
    }

    // Handle website filter
    if (hasWebsite !== null && hasWebsite !== undefined && hasWebsite !== "") {
      where.hasWebsite = hasWebsite === "true";
    }

    if (minScore || maxScore) {
      where.leadScore = {};
      if (minScore) where.leadScore.gte = parseInt(minScore);
      if (maxScore) where.leadScore.lte = parseInt(maxScore);
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { company: { contains: search, mode: "insensitive" } },
        { city: { contains: search, mode: "insensitive" } },
        { category: { contains: search, mode: "insensitive" } },
      ];
    }

    if (tag) {
      where.tags = { has: tag };
    }

    // Get total count
    const total = await prisma.prospect.count({ where });

    // Fetch prospects
    const prospects = await prisma.prospect.findMany({
      where,
      orderBy: [
        { leadScore: "desc" },
        { createdAt: "desc" },
      ],
      take: limit,
      skip: offset,
    });

    return NextResponse.json({ 
      prospects,
      total,
      limit,
      offset,
    });
  } catch (error: any) {
    console.error("Error fetching prospects:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch prospects" },
      { status: 500 }
    );
  }
}



