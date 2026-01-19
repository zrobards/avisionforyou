import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET - List all DUI classes
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userRole = (session.user as any)?.role;
    if (userRole !== "ADMIN" && userRole !== "STAFF") {
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
    console.error("Error fetching DUI classes:", error);
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

    const userRole = (session.user as any)?.role;
    if (userRole !== "ADMIN" && userRole !== "STAFF") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
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
      active = true
    } = body;

    // Validate required fields
    if (!title || !date || !startTime || !endTime || !location || !price || !capacity) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Convert price to cents
    const priceInCents = Math.round(parseFloat(price) * 100);

    const duiClass = await db.dUIClass.create({
      data: {
        title,
        description: description || null,
        date: new Date(date),
        startTime,
        endTime,
        location,
        price: priceInCents,
        capacity: parseInt(capacity),
        instructor: instructor || null,
        active: active !== false
      }
    });

    return NextResponse.json(duiClass, { status: 201 });
  } catch (error) {
    console.error("Error creating DUI class:", error);
    return NextResponse.json(
      { error: "Failed to create class" },
      { status: 500 }
    );
  }
}
