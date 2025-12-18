import { db } from "@/lib/db"
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const user = await db.user.findUnique({
      where: { email: session.user.email }
    })

    const isAdmin = user?.role === "ADMIN"
    const isStaff = user?.role === "STAFF"
    const isDevBypass = process.env.NODE_ENV === 'development'

    // In development, if no admins exist yet, allow first authenticated user
    const adminCount = await db.user.count({ where: { role: "ADMIN" } })
    const allowDevFallback = isDevBypass && adminCount === 0

    if (!isAdmin && !isStaff && !allowDevFallback) {
      return NextResponse.json(
        { error: "Admin or staff access required" },
        { status: 403 }
      )
    }

    // Get all users with their assessments
    const users = await db.user.findMany({
      include: {
        assessment: true,
        rsvps: {
          include: {
            session: true
          }
        }
      },
      where: {
        role: "USER"
      }
    })

    // Get all meetings
    const meetings = await db.programSession.findMany({
      include: {
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

    // Get statistics
    const donationAggregate = await db.donation.aggregate({
      _count: { _all: true },
      _sum: { amount: true }
    })

    const stats = {
      totalUsers: users.length,
      completedAssessments: users.filter(u => u.assessment).length,
      totalRsvps: await db.rSVP.count(),
      upcomingMeetings: await db.programSession.count({
        where: {
          startDate: {
            gte: new Date()
          }
        }
      }),
      totalDonations: donationAggregate._count._all,
      donationVolume: donationAggregate._sum.amount || 0
    }

    return NextResponse.json({
      users,
      meetings,
      stats
    })
  } catch (error) {
    console.error("Admin data error:", error)
    return NextResponse.json(
      { error: "Failed to fetch admin data" },
      { status: 500 }
    )
  }
}
