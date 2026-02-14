import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

// GET single announcement
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const announcement = await db.communityAnnouncement.findUnique({
    where: { id },
    include: { author: { select: { name: true } } }
  })

  if (!announcement) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  return NextResponse.json(announcement)
}

// PUT update announcement
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { title, content, published } = await request.json()

  const announcement = await db.communityAnnouncement.update({
    where: { id },
    data: {
      ...(title && { title }),
      ...(content !== undefined && { content }),
      ...(published !== undefined && { published })
    }
  })

  return NextResponse.json(announcement)
}

// DELETE announcement
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  await db.communityAnnouncement.delete({
    where: { id }
  })

  return NextResponse.json({ success: true })
}
