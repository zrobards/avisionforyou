import { db } from "@/lib/db"
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user?.email) {
      return NextResponse.json(
        { error: "Must be logged in" },
        { status: 401 }
      )
    }

    const user = await db.user.findUnique({
      where: { email: session.user.email }
    })

    if (user?.role !== "ADMIN" && user?.role !== "STAFF") {
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 403 }
      )
    }

    // Get all meetings with RSVPs for admin view
    const meetings = await db.programSession.findMany({
      include: {
        program: true,
        rsvps: {
          include: {
            user: { 
              select: { 
                id: true, 
                email: true, 
                name: true 
              } 
            }
          }
        }
      },
      orderBy: { startDate: "asc" }
    })

    // Format for frontend
    const formattedMeetings = meetings.map(meeting => ({
      id: meeting.id,
      title: meeting.title,
      description: meeting.description,
      startDate: meeting.startDate,
      endDate: meeting.endDate,
      startTime: meeting.startDate,
      endTime: meeting.endDate,
      format: meeting.format,
      location: meeting.location,
      link: meeting.link,
      capacity: meeting.capacity,
      program: meeting.program,
      rsvps: meeting.rsvps.map(rsvp => ({
        id: rsvp.id,
        user: rsvp.user,
        status: rsvp.status
      })),
      _count: {
        rsvps: meeting.rsvps.length
      }
    }))

    return NextResponse.json({ meetings: formattedMeetings })
  } catch (error) {
    console.error("Get admin meetings error:", error)
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
        { error: "Must be logged in" },
        { status: 401 }
      )
    }

    const user = await db.user.findUnique({
      where: { email: session.user.email }
    })

    if (user?.role !== "ADMIN" && user?.role !== "STAFF") {
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 403 }
      )
    }

    const { title, description, startTime, endTime, format, location, link } = await request.json()

    if (!title || !startTime) {
      return NextResponse.json(
        { error: "Title and start time are required" },
        { status: 400 }
      )
    }

    // Create or get default program
    let program = await db.program.findFirst({
      where: { slug: "mindbodysoul-iop" }
    })

    if (!program) {
      program = await db.program.create({
        data: {
          name: "MindBodySoul IOP",
          slug: "mindbodysoul-iop",
          description: "Recovery program",
          programType: "IOP"
        }
      })
    }

    const meeting = await db.programSession.create({
      data: {
        title,
        description: description || "",
        programId: program.id,
        startDate: new Date(startTime),
        endDate: new Date(endTime),
        format,
        location: format === "IN_PERSON" ? location : null,
        link: format !== "IN_PERSON" ? link : null
      },
      include: {
        program: true,
        rsvps: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                name: true
              }
            }
          }
        }
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
