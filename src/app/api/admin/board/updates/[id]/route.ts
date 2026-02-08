import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

// GET single update
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const update = await db.boardUpdate.findUnique({
    where: { id },
  })

  if (!update) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  return NextResponse.json(update)
}

// PUT update
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { title, content, category, priority } = await request.json()

  const update = await db.boardUpdate.update({
    where: { id },
    data: { title, content, category, priority },
  })

  return NextResponse.json(update)
}

// DELETE update
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  await db.boardUpdate.delete({
    where: { id },
  })

  return NextResponse.json({ success: true })
}
