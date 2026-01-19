import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

// GET all updates (for admin table)
export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const updates = await db.boardUpdate.findMany({
    orderBy: { createdAt: "desc" },
    include: { author: { select: { name: true } } },
  })

  return NextResponse.json(updates)
}

// POST new update
export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { title, content, category, priority } = await request.json()

  if (!title || !content || !category) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }

  const update = await db.boardUpdate.create({
    data: {
      title,
      content,
      category,
      priority: priority || false,
      authorId: (session.user as any).id,
    },
  })

  return NextResponse.json(update)
}
