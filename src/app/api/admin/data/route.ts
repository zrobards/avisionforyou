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

    // Get comprehensive statistics
    const donationAggregate = await db.donation.aggregate({
      _count: { _all: true },
      _sum: { amount: true }
    })

    // Get user counts
    const totalUsers = await db.user.count()
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)
    const newUsersThisMonth = await db.user.count({
      where: { createdAt: { gte: startOfMonth } }
    })
    // adminCount already calculated above for dev bypass check

    // Get donation stats
    const recurringDonations = await db.donation.count({
      where: { frequency: { not: 'ONE_TIME' } }
    })

    // Get inquiry stats
    const contactInquiries = await db.contactInquiry.count()
    const newContactInquiries = await db.contactInquiry.count({
      where: { status: 'NEW' }
    })
    const admissionInquiries = await db.admissionInquiry.count()
    const pendingAdmissions = await db.admissionInquiry.count({
      where: { status: 'pending' }
    })

    // Get content stats
    const blogPosts = await db.blogPost.count()
    const newsletters = await db.newsletter.count()
    const teamMembers = await db.teamMember.count()

    const stats = {
      users: {
        total: totalUsers,
        newThisMonth: newUsersThisMonth,
        admins: adminCount
      },
      donations: {
        total: donationAggregate._count._all || 0,
        totalAmount: Math.round((donationAggregate._sum.amount || 0) * 100) / 100,
        thisMonth: 0, // Can be enhanced later
        recurring: recurringDonations
      },
      inquiries: {
        contact: contactInquiries,
        contactNew: newContactInquiries,
        admission: admissionInquiries,
        admissionPending: pendingAdmissions
      },
      content: {
        blogPosts,
        newsletters,
        teamMembers
      }
    }

    return NextResponse.json(stats, {
      headers: { 'Cache-Control': 'no-store, max-age=0' }
    })
  } catch (error) {
    console.error("Admin data error:", error)
    return NextResponse.json(
      { error: "Failed to fetch admin data" },
      { status: 500 }
    )
  }
}
