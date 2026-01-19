import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET(request: Request) {
  const session = await getServerSession(authOptions)
  
  if (!session || ((session.user as any).role !== "ALUMNI" && (session.user as any).role !== "ADMIN")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const upcoming = searchParams.get("upcoming") === "true"
  const limit = parseInt(searchParams.get("limit") || "50")

  const where = upcoming 
    ? { startDate: { gte: new Date() } }
    : {}

  const meetings = await db.programSession.findMany({
    where,
    orderBy: { startDate: upcoming ? "asc" : "desc" },
    take: limit,
    include: {
      program: {
        select: { name: true, slug: true }
      }
    }
  })

  // Get user's RSVPs to mark which meetings they've registered for
  const userRsvps = await db.rSVP.findMany({
    where: { userId: (session.user as any).id },
    select: { sessionId: true, status: true }
  })

  const rsvpMap = new Map(userRsvps.map(r => [r.sessionId, r.status]))

  const meetingsWithRsvpStatus = meetings.map(meeting => ({
    ...meeting,
    userRsvpStatus: rsvpMap.get(meeting.id) || null
  }))

  return NextResponse.json(meetingsWithRsvpStatus)
}
