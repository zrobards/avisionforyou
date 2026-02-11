import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { AnnouncementSchema, getValidationErrors } from "@/lib/validation"
import { ZodError } from "zod"
import { checkRateLimit } from "@/lib/rateLimit"
import { rateLimitResponse } from "@/lib/apiAuth"

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

  // Rate limit: 30 per hour per user
  const userId = (session.user as any)?.id || session.user?.email || "unknown"
  const rateLimit = checkRateLimit(`admin-announcements:${userId}`, 30, 3600)
  if (!rateLimit.allowed) {
    return rateLimitResponse(rateLimit.retryAfter || 60)
  }

  // Validate request body with Zod
  let validatedData
  try {
    const body = await request.json()
    validatedData = AnnouncementSchema.parse(body)
  } catch (error) {
    if (error instanceof ZodError) {
      const errors = getValidationErrors(error)
      return NextResponse.json(
        { error: "Validation failed", details: errors },
        { status: 400 }
      )
    }
    throw error
  }

  const { title, content, published } = validatedData

  const announcement = await db.communityAnnouncement.create({
    data: {
      title,
      content,
      published,
      authorId: (session.user as any).id
    }
  })

  return NextResponse.json(announcement)
}
