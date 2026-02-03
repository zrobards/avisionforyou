import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET - Get single class
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
    if (userRole !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const duiClass = await db.dUIClass.findUnique({
      where: { id: params.id },
      include: {
        registrations: {
          orderBy: { createdAt: "desc" }
        }
      }
    });

    if (!duiClass) {
      return NextResponse.json({ error: "Class not found" }, { status: 404 });
    }

    return NextResponse.json(duiClass);
  } catch (error) {
    console.error("Error fetching DUI class:", error);
    return NextResponse.json(
      { error: "Failed to fetch class" },
      { status: 500 }
    );
  }
}

// PATCH - Update class
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
    if (userRole !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const updateData: any = {};

    if (body.title !== undefined) updateData.title = body.title;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.date !== undefined) updateData.date = new Date(body.date);
    if (body.startTime !== undefined) updateData.startTime = body.startTime;
    if (body.endTime !== undefined) updateData.endTime = body.endTime;
    if (body.location !== undefined) updateData.location = body.location;
    if (body.price !== undefined) updateData.price = Math.round(parseFloat(body.price) * 100);
    if (body.capacity !== undefined) updateData.capacity = parseInt(body.capacity);
    if (body.instructor !== undefined) updateData.instructor = body.instructor;
    if (body.active !== undefined) updateData.active = body.active;

    const duiClass = await db.dUIClass.update({
      where: { id: params.id },
      data: updateData
    });

    return NextResponse.json(duiClass);
  } catch (error) {
    console.error("Error updating DUI class:", error);
    return NextResponse.json(
      { error: "Failed to update class" },
      { status: 500 }
    );
  }
}

// DELETE - Delete class
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userRole = (session.user as any)?.role;
    if (userRole !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Check if there are any registrations
    const registrations = await db.dUIRegistration.count({
      where: { classId: params.id }
    });

    if (registrations > 0) {
      // Soft delete by setting active to false
      await db.dUIClass.update({
        where: { id: params.id },
        data: { active: false }
      });
    } else {
      // Hard delete if no registrations
      await db.dUIClass.delete({
        where: { id: params.id }
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting DUI class:", error);
    return NextResponse.json(
      { error: "Failed to delete class" },
      { status: 500 }
    );
  }
}
