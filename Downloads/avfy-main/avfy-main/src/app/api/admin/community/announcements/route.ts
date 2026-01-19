import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

// GET all announcements (for admin table)
export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const announcements = await db.communityAnnouncement.findMany({
    orderBy: { createdAt: "desc" },
    include: { author: { select: { name: true } } }
  })

  return NextResponse.json(announcements)
}

// POST new announcement
export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { title, content, published } = await request.json()

  if (!title || !content) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }

  const announcement = await db.communityAnnouncement.create({
    data: {
      title,
      content,
      published: published || false,
      authorId: (session.user as any).id
    }
  })

  return NextResponse.json(announcement)
}
