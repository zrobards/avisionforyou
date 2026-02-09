import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(request: Request) {
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

    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");

    const whereClause: any = {};
    if (category && category !== "all") {
      whereClause.tags = { has: category };
    }

    const mediaItems = await db.mediaItem.findMany({
      where: whereClause,
      orderBy: { uploadedAt: "desc" },
      include: {
        uploadedBy: {
          select: { name: true, email: true },
        },
      },
    });

    return NextResponse.json(mediaItems);
  } catch (error) {
    console.error("Error fetching media items:", error);
    return NextResponse.json(
      { error: "Failed to fetch media items" },
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
    const tags = formData.get("tags") as string;
    const usage = formData.get("usage") as string;

    if (!file) {
      return NextResponse.json({ error: "File is required" }, { status: 400 });
    }

    // Convert file to base64
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Data = buffer.toString("base64");
    const dataUrl = `data:${file.type};base64,${base64Data}`;

    // Determine media type
    const type = file.type.startsWith("image/") ? "image" : "video";

    const mediaItem = await db.mediaItem.create({
      data: {
        filename: file.name,
        type,
        url: dataUrl,
        size: file.size,
        mimeType: file.type,
        tags: tags ? tags.split(",").map((t) => t.trim()) : [],
        usage: usage ? usage.split(",").map((u) => u.trim()) : [],
        uploadedById: user.id,
      },
    });

    return NextResponse.json(mediaItem);
  } catch (error) {
    console.error("Error uploading media:", error);
    return NextResponse.json(
      { error: "Failed to upload media" },
      { status: 500 }
    );
  }
}
