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

    const polls = await db.communityPoll.findMany({
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { votes: true } } },
    });

    return NextResponse.json(polls);
  } catch (error) {
    console.error("Error fetching polls:", error);
    return NextResponse.json(
      { error: "Failed to fetch polls" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { title, description, closesAt } = body;

    if (!title || title.trim() === "") {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      );
    }

    const poll = await db.communityPoll.create({
      data: {
        title: title.trim(),
        description: description?.trim() || null,
        closesAt: closesAt ? new Date(closesAt) : null,
        createdById: session.user.id,
        active: true,
      },
    });

    return NextResponse.json(poll);
  } catch (error) {
    console.error("Error creating poll:", error);
    return NextResponse.json(
      { error: "Failed to create poll. Check server logs." },
      { status: 500 }
    );
  }
}
