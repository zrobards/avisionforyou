import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { logger } from '@/lib/logger'

// DELETE document
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const document = await db.boardDocument.findUnique({
      where: { id },
    })

    if (!document) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    // Delete from database (file is stored as base64 in database)
    await db.boardDocument.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error({ err: error }, "Error deleting document")
    return NextResponse.json({ error: "Failed to delete document" }, { status: 500 })
  }
}
