import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await auth();
  
  if (!session?.user || !["CEO", "CFO", "FRONTEND", "BACKEND", "OUTREACH"].includes(session.user.role || "")) {
    // CEO is already included, but keeping for clarity
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { title, url, description, category, icon } = body;

    if (!title || !url) {
      return NextResponse.json({ error: "Title and URL are required" }, { status: 400 });
    }

    const link = await prisma.link.create({
      data: {
        title,
        url,
        description: description || null,
        category: category || "OTHER",
        icon: icon || null,
        createdById: session.user.id,
      },
    });

    return NextResponse.json({ success: true, link });
  } catch (error) {
    console.error("[Create Link Error]", error);
    return NextResponse.json({ error: "Failed to create link" }, { status: 500 });
  }
}
