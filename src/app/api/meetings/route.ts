import { db } from "@/lib/db"
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { logger } from '@/lib/logger'

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
        // Keep legacy fields for existing clients
        startTime: meeting.startDate,
        endTime: meeting.endDate,
        format: meeting.format,
        location: meeting.location,
        link: meeting.link,
        capacity: meeting.capacity,
        program: meeting.program,
        rsvps: meeting.rsvps,
        rsvpCount: meeting.rsvps.length,
        userRsvpStatus: userRsvp?.status || null,
        reminderStatus: userRsvp ? {
          reminder24h: userRsvp.reminder24hSent,
          reminder1h: userRsvp.reminder1hSent,
        } : null
      }
    })

    return NextResponse.json({ meetings: formattedMeetings }, {
      headers: { 'Cache-Control': 'no-store, max-age=0' }
    })
  } catch (error) {
    logger.error({ err: error }, "Get meetings error")
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

    if (user?.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      )
    }

    const { title, description, program, startTime, endTime, format, link } = await request.json()

    // Ensure programs exist - create if missing
    const programSlugs = {
      'MINDBODYSOUL_IOP': 'mindbodysoul-iop',
      'SURRENDER_PROGRAM': 'surrender-program',
      'MOVING_MOUNTAINS': 'moving-mountains'
    }

    const programSlug = programSlugs[program as keyof typeof programSlugs] || 'mindbodysoul-iop'

    let existingProgram = await db.program.findUnique({
      where: { slug: programSlug }
    })

    if (!existingProgram) {
      // Create the program if it doesn't exist
      const programNames = {
        'mindbodysoul-iop': 'MindBodySoul IOP',
        'surrender-program': 'Surrender Program',
        'moving-mountains': 'Moving Mountains Ministry'
      }
      existingProgram = await db.program.create({
        data: {
          name: programNames[programSlug as keyof typeof programNames],
          slug: programSlug,
          description: 'Recovery program',
          programType: 'IOP'
        }
      })
    }

    const meeting = await db.programSession.create({
      data: {
        title,
        description: description || '',
        programId: existingProgram.id,
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
    logger.error({ err: error }, "Create meeting error")
    return NextResponse.json(
      { error: "Failed to create meeting" },
      { status: 500 }
    )
  }
}
