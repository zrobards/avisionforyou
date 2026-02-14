import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { logger } from '@/lib/logger'

// Get user's RSVPs and send reminders based on timing
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Must be logged in' },
        { status: 401 }
      )
    }

    const user = await db.user.findUnique({
      where: { email: session.user.email },
      include: {
        rsvps: {
          include: {
            session: {
              include: { program: true }
            }
          },
          where: {
            status: 'CONFIRMED'
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const now = new Date()
    const upcomingRsvps = user.rsvps.filter(rsvp => {
      const meetingTime = new Date(rsvp.session.startDate)
      return meetingTime > now
    })

    return NextResponse.json({
      rsvps: upcomingRsvps.map(rsvp => ({
        id: rsvp.id,
        meetingTitle: rsvp.session.title,
        startDate: rsvp.session.startDate,
        location: rsvp.session.location,
        format: rsvp.session.format,
        link: rsvp.session.link,
        reminder24hSent: rsvp.reminder24hSent,
        reminder1hSent: rsvp.reminder1hSent,
        status: rsvp.status
      }))
    })
  } catch (error) {
    logger.error({ err: error }, 'Get RSVPs error')
    return NextResponse.json(
      { error: 'Failed to fetch RSVPs' },
      { status: 500 }
    )
  }
}

// Cancel an RSVP
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Must be logged in' },
        { status: 401 }
      )
    }

    const user = await db.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const { rsvpId } = await request.json()

    // Verify the RSVP belongs to the user
    const rsvp = await db.rSVP.findUnique({
      where: { id: rsvpId }
    })

    if (!rsvp || rsvp.userId !== user.id) {
      return NextResponse.json(
        { error: 'RSVP not found or unauthorized' },
        { status: 404 }
      )
    }

    // Update RSVP status to cancelled
    const updated = await db.rSVP.update({
      where: { id: rsvpId },
      data: { status: 'CANCELLED' }
    })

    return NextResponse.json({
      success: true,
      message: 'RSVP cancelled successfully',
      rsvp: updated
    })
  } catch (error) {
    logger.error({ err: error }, 'Cancel RSVP error')
    return NextResponse.json(
      { error: 'Failed to cancel RSVP' },
      { status: 500 }
    )
  }
}
