import { db } from "@/lib/db"
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const body = await request.json()
    const { title, description, startTime, endTime, format, location, link } = body

    const updatedMeeting = await db.programSession.update({
      where: { id: params.id },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(startTime && { startDate: new Date(startTime) }),
        ...(endTime && { endDate: new Date(endTime) }),
        ...(format && { format }),
        ...(location !== undefined && { location: format === "IN_PERSON" ? location : null }),
        ...(link !== undefined && { link: format !== "IN_PERSON" ? link : null })
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

    return NextResponse.json({ meeting: updatedMeeting })
  } catch (error) {
    console.error("Update meeting error:", error)
    return NextResponse.json(
      { error: "Failed to update meeting" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Delete all RSVPs first
    await db.rSVP.deleteMany({
      where: { sessionId: params.id }
    })

    // Delete the meeting
    await db.programSession.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete meeting error:", error)
    return NextResponse.json(
      { error: "Failed to delete meeting" },
      { status: 500 }
    )
  }
}
