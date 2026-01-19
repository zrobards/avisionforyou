import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET - Get registrations for a class
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userRole = (session.user as any)?.role;
    if (userRole !== "ADMIN" && userRole !== "STAFF") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const registrations = await db.dUIRegistration.findMany({
      where: { classId: params.id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true
          }
        },
        class: {
          select: {
            title: true,
            date: true
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json(registrations);
  } catch (error) {
    console.error("Error fetching registrations:", error);
    return NextResponse.json(
      { error: "Failed to fetch registrations" },
      { status: 500 }
    );
  }
}

// PATCH - Update registration (e.g., mark attendance)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const { registrationId, status, attendedAt } = body;

    if (!registrationId) {
      return NextResponse.json(
        { error: "Registration ID required" },
        { status: 400 }
      );
    }

    const updateData: any = {};
    if (status !== undefined) updateData.status = status;
    if (attendedAt !== undefined) {
      updateData.attendedAt = attendedAt ? new Date(attendedAt) : null;
    }

    const registration = await db.dUIRegistration.update({
      where: { id: registrationId },
      data: updateData
    });

    return NextResponse.json(registration);
  } catch (error) {
    console.error("Error updating registration:", error);
    return NextResponse.json(
      { error: "Failed to update registration" },
      { status: 500 }
    );
  }
}
