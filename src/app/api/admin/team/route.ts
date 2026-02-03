import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

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

    const body = await request.json();
    const { name, title, bio, role, imageUrl, email, phone } = body;

    if (!name || !title) {
      return NextResponse.json({ error: "Name and title are required" }, { status: 400 });
    }

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
