import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { checkRateLimit, getClientIp, RATE_LIMITS } from "@/lib/rateLimit"
import { rateLimitResponse, validationErrorResponse } from "@/lib/apiAuth"

const rsvpSchema = z.object({
  sessionId: z.string().min(1),
  status: z.string().min(1).optional()
})

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request)
    const rateKey = `rsvp:${ip}`
    const rate = checkRateLimit(rateKey, RATE_LIMITS.RSVP.limit, RATE_LIMITS.RSVP.windowSeconds)
    if (!rate.allowed) {
      return rateLimitResponse(rate.retryAfter || 60)
    }

    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "You must be logged in to RSVP" },
        { status: 401 }
      )
    }

    const parsed = rsvpSchema.safeParse(await request.json())
    if (!parsed.success) {
      const errors = parsed.error.issues.map(issue => issue.message)
      return validationErrorResponse(errors)
    }

    const { sessionId, status } = parsed.data

    if (!sessionId) {
      return NextResponse.json(
        { error: "Session ID required" },
        { status: 400 }
      )
    }

    // Get user from database
    const user = await db.user.findUnique({
      where: { email: session.user.email || "" }
    })

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    // Check if program session exists
    const programSession = await db.programSession.findUnique({
      where: { id: sessionId }
    })

    if (!programSession) {
      return NextResponse.json(
        { error: "Program session not found" },
        { status: 404 }
      )
    }

    // Check if RSVP already exists
    const existingRsvp = await db.rSVP.findUnique({
      where: {
        userId_sessionId: {
          userId: user.id,
          sessionId: sessionId
        }
      }
    })

    if (existingRsvp) {
      // Update existing RSVP
      const updatedRsvp = await db.rSVP.update({
        where: {
          userId_sessionId: {
            userId: user.id,
            sessionId: sessionId
          }
        },
        data: { status: status || "CONFIRMED" }
      })

      return NextResponse.json({
        success: true,
        message: "RSVP updated",
        rsvp: updatedRsvp
      })
    }

    // Create new RSVP
    const newRsvp = await db.rSVP.create({
      data: {
        userId: user.id,
        sessionId: sessionId,
        status: status || "CONFIRMED"
      }
    })

    return NextResponse.json(
      {
        success: true,
        message: "RSVP created successfully",
        rsvp: newRsvp
      },
      { status: 201 }
    )
  } catch (error) {

    return NextResponse.json(
      { error: "Failed to process RSVP" },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "You must be logged in" },
        { status: 401 }
      )
    }

    const user = await db.user.findUnique({
      where: { email: session.user.email || "" },
      include: {
        rsvps: {
          include: {
            session: {
              include: {
                program: {
                  select: { name: true }
                }
              }
            }
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      rsvps: user.rsvps
    })
  } catch (error) {
    console.error("Get RSVPs error:", error)
    return NextResponse.json(
      { error: "Failed to fetch RSVPs" },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "You must be logged in" },
        { status: 401 }
      )
    }

    const { sessionId } = await request.json()

    if (!sessionId) {
      return NextResponse.json(
        { error: "Session ID required" },
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

    await db.rSVP.delete({
      where: {
        userId_sessionId: {
          userId: user.id,
          sessionId: sessionId
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: "RSVP cancelled"
    })
  } catch (error) {
    console.error("Cancel RSVP error:", error)
    return NextResponse.json(
      { error: "Failed to cancel RSVP" },
      { status: 500 }
    )
  }
}
