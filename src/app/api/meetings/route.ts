import { db } from "@/lib/db"
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const searchParams = request.nextUrl.searchParams
    const upcoming = searchParams.get('upcoming') === 'true'

    // Get user for filtering personalized results
    let userId: string | null = null
    if (session?.user?.email) {
      const user = await db.user.findUnique({
        where: { email: session.user.email }
      })
      userId = user?.id || null
    }

    const now = new Date()
    const whereClause = upcoming ? { startDate: { gte: now } } : {}

    const meetings = await db.programSession.findMany({
      where: whereClause,
      include: {
        program: true,
        rsvps: {
          include: {
            user: { select: { id: true, email: true, name: true } }
          }
        }
      },
      orderBy: { startDate: "asc" }
    })

    // If user is authenticated, include their RSVP status
    const formattedMeetings = meetings.map(meeting => {
      const userRsvp = userId 
        ? meeting.rsvps.find(r => r.userId === userId)
        : null

      return {
        id: meeting.id,
        title: meeting.title,
        description: meeting.description,
        startDate: meeting.startDate,
        endDate: meeting.endDate,
        format: meeting.format,
        location: meeting.location,
        link: meeting.link,
        capacity: meeting.capacity,
        program: meeting.program,
        rsvpCount: meeting.rsvps.length,
        userRsvpStatus: userRsvp?.status || null,
        reminderStatus: userRsvp ? {
          reminder24h: userRsvp.reminder24hSent,
          reminder1h: userRsvp.reminder1hSent,
        } : null
      }
    })

    return NextResponse.json({ meetings: formattedMeetings })
  } catch (error) {
    console.error("Get meetings error:", error)
    return NextResponse.json(
      { error: "Failed to fetch meetings" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user?.email) {
      return NextResponse.json(
        { error: "Must be logged in to create meetings" },
        { status: 401 }
      )
    }

    const user = await db.user.findUnique({
      where: { email: session.user.email }
    })

    if (user?.role !== "ADMIN" && user?.role !== "STAFF") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      )
    }

    const { title, description, program, startTime, endTime, format, link } = await request.json()

    const meeting = await db.programSession.create({
      data: {
        title,
        description,
        programId: program,
        startDate: new Date(startTime),
        endDate: new Date(endTime),
        format, // "IN_PERSON" or "ONLINE"
        link: format === "ONLINE" ? link : null,
        location: format === "IN_PERSON" ? "1675 Story Ave, Louisville, KY 40206" : null
      }
    })

    return NextResponse.json(
      { success: true, meeting },
      { status: 201 }
    )
  } catch (error) {
    console.error("Create meeting error:", error)
    return NextResponse.json(
      { error: "Failed to create meeting" },
      { status: 500 }
    )
  }
}
