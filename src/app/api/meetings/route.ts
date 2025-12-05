import { db } from "@/lib/db"
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const meetings = await db.programSession.findMany({
      include: {
        rsvps: {
          select: { userId: true }
        }
      },
      orderBy: { startDate: "asc" }
    })

    return NextResponse.json({ meetings })
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
