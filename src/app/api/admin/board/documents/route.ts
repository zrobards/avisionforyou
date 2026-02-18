import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { logger } from '@/lib/logger'

// GET all documents
export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const documents = await db.boardDocument.findMany({
    orderBy: { uploadedAt: "desc" },
    include: { uploadedBy: { select: { name: true } } },
  })

  return NextResponse.json(documents)
}

// POST new document (with file upload)
export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    const title = formData.get("title") as string
    const description = formData.get("description") as string
    const category = formData.get("category") as string

    if (!file || !title || !category) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // File size limit: 10MB
    const MAX_DOCUMENT_BYTES = 10 * 1024 * 1024
    if (file.size > MAX_DOCUMENT_BYTES) {
      return NextResponse.json(
        { error: `File too large. Maximum size is 10MB.` },
        { status: 400 }
      )
    }

    // Allowed document types
    const ALLOWED_DOCUMENT_TYPES = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'text/plain',
    ]
    if (!ALLOWED_DOCUMENT_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Allowed: PDF, Word, Excel, PowerPoint, and text files." },
        { status: 400 }
      )
    }

    // Convert file to base64 (matching existing media upload pattern)
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64Data = buffer.toString('base64')
    const dataUrl = `data:${file.type};base64,${base64Data}`

    const document = await db.boardDocument.create({
      data: {
        title,
        description,
        fileName: file.name,
        fileUrl: dataUrl,
        fileSize: file.size,
        category: category as import('@prisma/client').BoardDocumentCategory,
        uploadedById: session.user.id,
      },
    })

    return NextResponse.json(document)
  } catch (error) {
    logger.error({ err: error }, "Error uploading document")
    return NextResponse.json({ error: "Failed to upload document" }, { status: 500 })
  }
}
