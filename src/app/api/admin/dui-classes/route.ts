import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { DUIClassSchema, getValidationErrors } from "@/lib/validation";
import { ZodError } from "zod";
import { checkRateLimit } from "@/lib/rateLimit";
import { rateLimitResponse } from "@/lib/apiAuth";
import { logger } from '@/lib/logger'

// GET - List all DUI classes
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userRole = session.user?.role;
    if (userRole !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const classes = await db.dUIClass.findMany({
      orderBy: { date: "desc" },
      include: {
        _count: {
          select: {
            registrations: {
              where: {
                status: { not: "CANCELLED" }
              }
            }
          }
        }
      }
    });

    return NextResponse.json(classes);
  } catch (error) {
    logger.error({ err: error }, "Error fetching DUI classes");
    return NextResponse.json(
      { error: "Failed to fetch classes" },
      { status: 500 }
    );
  }
}

// POST - Create new DUI class
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userRole = session.user?.role;
    if (userRole !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Rate limit: 30 per hour per user
    const userId = (session.user as any)?.id || session.user?.email || "unknown";
    const rateLimit = checkRateLimit(`admin-dui-classes:${userId}`, 30, 3600);
    if (!rateLimit.allowed) {
      return rateLimitResponse(rateLimit.retryAfter || 60);
    }

    // Validate request body with Zod
    let validatedData;
    try {
      const body = await request.json();
      validatedData = DUIClassSchema.parse(body);
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

    const {
      title,
      description,
      date,
      startTime,
      endTime,
      location,
      price,
      capacity,
      instructor,
      active
    } = validatedData;

    // Convert price to cents
    const priceInCents = Math.round(price * 100);

    const duiClass = await db.dUIClass.create({
      data: {
        title,
        description: description || null,
        date: new Date(date),
        startTime,
        endTime,
        location,
        price: priceInCents,
        capacity,
        instructor: instructor || null,
        active
      }
    });

    return NextResponse.json(duiClass, { status: 201 });
  } catch (error) {
    logger.error({ err: error }, "Error creating DUI class");
    return NextResponse.json(
      { error: "Failed to create class" },
      { status: 500 }
    );
  }
}
