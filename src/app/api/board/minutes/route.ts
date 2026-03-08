import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { put } from "@vercel/blob";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user || (user.role !== "BOARD" && user.role !== "ADMIN")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const minutes = await db.meetingMinutes.findMany({
      orderBy: { meetingDate: "desc" },
      include: {
        uploadedBy: {
          select: { name: true, email: true },
        },
      },
    });

    return NextResponse.json(minutes);
  } catch (error) {
    console.error("Error fetching meeting minutes:", error);
    return NextResponse.json(
      { error: "Failed to fetch meeting minutes" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user || (user.role !== "BOARD" && user.role !== "ADMIN")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const title = formData.get("title") as string;
    const meetingDate = formData.get("meetingDate") as string;
    const attendees = formData.get("attendees") as string;

    if (!file || !title || !meetingDate) {
      return NextResponse.json(
        { error: "File, title, and meeting date are required" },
        { status: 400 }
      );
    }

    // Upload to Vercel Blob storage
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const blob = await put(`minutes/${Date.now()}-${file.name}`, buffer, {
      access: "public",
      contentType: file.type,
    });

    const minutes = await db.meetingMinutes.create({
      data: {
        title,
        meetingDate: new Date(meetingDate),
        fileUrl: blob.url,
        fileName: file.name,
        attendees,
        uploadedById: user.id,
      },
      include: {
        uploadedBy: {
          select: { name: true, email: true },
        },
      },
    });

    return NextResponse.json(minutes);
  } catch (error) {
    console.error("Error creating meeting minutes:", error);
    return NextResponse.json(
      { error: "Failed to create meeting minutes" },
      { status: 500 }
    );
  }
}
