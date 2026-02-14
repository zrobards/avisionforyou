import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

// POST - Create RSVP
export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  
  if (!session || (session.user.role !== "ALUMNI" && session.user.role !== "BOARD" && session.user.role !== "ADMIN")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { meetingId } = await request.json()

  if (!meetingId) {
    return NextResponse.json({ error: "Meeting ID required" }, { status: 400 })
  }

  const userId = session.user.id

  // Check if already RSVPed
  const existing = await db.rSVP.findFirst({
    where: { userId, sessionId: meetingId }
  })

  if (existing) {
    return NextResponse.json({ error: "Already RSVPed" }, { status: 400 })
  }

  // Verify meeting exists
  const meeting = await db.programSession.findUnique({
    where: { id: meetingId }
  })

  if (!meeting) {
    return NextResponse.json({ error: "Meeting not found" }, { status: 404 })
  }

  const rsvp = await db.rSVP.create({
    data: {
      userId,
      sessionId: meetingId,
      status: "CONFIRMED"
    }
  })

  return NextResponse.json(rsvp)
}

// DELETE - Cancel RSVP
export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions)
  
  if (!session || (session.user.role !== "ALUMNI" && session.user.role !== "BOARD" && session.user.role !== "ADMIN")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { meetingId } = await request.json()

  if (!meetingId) {
    return NextResponse.json({ error: "Meeting ID required" }, { status: 400 })
  }

  const userId = session.user.id

  // Use deleteMany since we don't have the unique constraint name
  await db.rSVP.deleteMany({
    where: { userId, sessionId: meetingId }
  })

  return NextResponse.json({ success: true })
}
