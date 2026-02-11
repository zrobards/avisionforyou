import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { TeamMemberSchema, getValidationErrors } from "@/lib/validation";
import { ZodError } from "zod";
import { checkRateLimit } from "@/lib/rateLimit";
import { rateLimitResponse } from "@/lib/apiAuth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const members = await db.teamMember.findMany({
      orderBy: { order: "asc" },
    });

    return NextResponse.json(members);
  } catch (error) {
    console.error("Error fetching team:", error);
    return NextResponse.json({ error: "Failed to fetch team members" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Rate limit: 30 per hour per user
    const userId = (session.user as any)?.id || session.user?.email || "unknown";
    const rateLimit = checkRateLimit(`admin-team:${userId}`, 30, 3600);
    if (!rateLimit.allowed) {
      return rateLimitResponse(rateLimit.retryAfter || 60);
    }

    // Validate request body with Zod
    let validatedData;
    try {
      const body = await request.json();
      validatedData = TeamMemberSchema.parse(body);
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = getValidationErrors(error);
        return NextResponse.json(
          { error: "Validation failed", details: errors },
          { status: 400 }
        );
      }
      throw error;
    }

    const { name, title, bio, imageUrl, email, phone } = validatedData;

    const member = await db.teamMember.create({
      data: {
        name,
        title,
        bio: bio || "",
        email: email || null,
        imageUrl: imageUrl || null,
        phone: phone || null,
        order: 0,
        isActive: true,
        role: "STAFF", // Default TeamRole enum value
      },
    });

    return NextResponse.json(member);
  } catch (error) {
    console.error("Error creating team member:", error);
    return NextResponse.json({ error: "Failed to create team member" }, { status: 500 });
  }
}
