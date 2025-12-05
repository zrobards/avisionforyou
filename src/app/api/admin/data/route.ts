import { db } from "@/lib/db"
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

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

    if (user?.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Admin access required" },
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
      })
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
