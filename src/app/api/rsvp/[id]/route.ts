import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { NextRequest, NextResponse } from "next/server"

/**
 * GET /api/rsvp/[id]
 * Get a specific RSVP by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "You must be logged in" },
        { status: 401 }
      )
    }

    const user = await db.user.findUnique({
      where: { email: session.user.email || "" }
    })

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    const rsvp = await db.rSVP.findUnique({
      where: { id: params.id },
      include: {
        session: {
          include: {
            program: true
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    if (!rsvp) {
      return NextResponse.json(
        { error: "RSVP not found" },
        { status: 404 }
      )
    }

    // Only allow users to view their own RSVPs (or admins to view any)
    if (rsvp.userId !== user.id && user.role !== "ADMIN" && user.role !== "STAFF") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      )
    }

    return NextResponse.json({
      success: true,
      rsvp
    })
  } catch (error) {
    console.error("Get RSVP error:", error)
    return NextResponse.json(
      { error: "Failed to fetch RSVP" },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/rsvp/[id]
 * Update an RSVP status
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "You must be logged in" },
        { status: 401 }
      )
    }

    const { status } = await request.json()

    if (!status || !["CONFIRMED", "CANCELLED", "NO_SHOW"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status" },
        { status: 400 }
      )
    }

    const user = await db.user.findUnique({
      where: { email: session.user.email || "" }
    })

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    // Get the RSVP
    const rsvp = await db.rSVP.findUnique({
      where: { id: params.id },
      include: {
        session: true
      }
    })

    if (!rsvp) {
      return NextResponse.json(
        { error: "RSVP not found" },
        { status: 404 }
      )
    }

    // Only allow users to update their own RSVPs (or admins to update any)
    if (rsvp.userId !== user.id && user.role !== "ADMIN" && user.role !== "STAFF") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      )
    }

    // If changing from CANCELLED to CONFIRMED, check capacity
    if (rsvp.status !== "CONFIRMED" && status === "CONFIRMED") {
      if (rsvp.session.capacity) {
        const confirmedRsvpCount = await db.rSVP.count({
          where: {
            sessionId: rsvp.sessionId,
            status: "CONFIRMED"
          }
        })

        if (confirmedRsvpCount >= rsvp.session.capacity) {
          return NextResponse.json(
            { error: "Meeting is at full capacity" },
            { status: 400 }
          )
        }
      }
    }

    // Update the RSVP
    const updatedRsvp = await db.rSVP.update({
      where: { id: params.id },
      data: { status }
    })

    return NextResponse.json({
      success: true,
      message: `RSVP ${status.toLowerCase()}`,
      rsvp: updatedRsvp
    })
  } catch (error) {
    console.error("Update RSVP error:", error)
    return NextResponse.json(
      { error: "Failed to update RSVP" },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/rsvp/[id]
 * Delete an RSVP
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "You must be logged in" },
        { status: 401 }
      )
    }

    const user = await db.user.findUnique({
      where: { email: session.user.email || "" }
    })

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    // Get the RSVP
    const rsvp = await db.rSVP.findUnique({
      where: { id: params.id }
    })

    if (!rsvp) {
      return NextResponse.json(
        { error: "RSVP not found" },
        { status: 404 }
      )
    }

    // Only allow users to delete their own RSVPs (or admins to delete any)
    if (rsvp.userId !== user.id && user.role !== "ADMIN" && user.role !== "STAFF") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      )
    }

    // Delete the RSVP
    await db.rSVP.delete({
      where: { id: params.id }
    })

    return NextResponse.json({
      success: true,
      message: "RSVP deleted successfully"
    })
  } catch (error) {
    console.error("Delete RSVP error:", error)
    return NextResponse.json(
      { error: "Failed to delete RSVP" },
      { status: 500 }
    )
  }
}
