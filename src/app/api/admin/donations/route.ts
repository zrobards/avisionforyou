import { db } from "@/lib/db"
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { logger } from '@/lib/logger'
import { getVisibleDonationsForDashboard } from "@/lib/donations"

// DELETE all donations (admin only — for clearing test/seed data)
export async function DELETE() {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await db.user.findUnique({
      where: { email: session.user.email }
    })

    if (user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Only admins can delete donations" }, { status: 403 })
    }

    const result = await db.donation.deleteMany({})

    return NextResponse.json({
      message: `Deleted ${result.count} donations`,
      count: result.count
    })
  } catch (error) {
    logger.error({ err: error }, "Error deleting donations")
    return NextResponse.json({ error: "Failed to delete donations" }, { status: 500 })
  }
}

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

    if (user?.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Only admins can view donation data" },
        { status: 403 }
      )
    }

    // Get all donations with user details
    const { searchParams } = new URL(request.url)
    const skip = parseInt(searchParams.get('skip') || '0', 10)
    const donations = await db.donation.findMany({
      take: 100,
      skip: isNaN(skip) ? 0 : skip,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    const visibleDonations = await getVisibleDonationsForDashboard(
      donations.map(({ user: _user, ...donation }) => donation)
    )

    const visibleDonationMap = new Map(visibleDonations.map((donation) => [donation.id, donation]))
    const filteredDonations = donations
      .filter((donation) => visibleDonationMap.has(donation.id))
      .map((donation) => {
        const syncedDonation = visibleDonationMap.get(donation.id)

        if (!syncedDonation) {
          return donation
        }

        return {
          ...donation,
          ...syncedDonation
        }
      })

    // Calculate statistics
    const stats = {
      totalDonations: filteredDonations.length,
      totalAmount: filteredDonations.reduce((sum, d) => sum + Number(d.amount), 0),
      averageDonation: filteredDonations.length > 0
        ? Math.round((filteredDonations.reduce((sum, d) => sum + Number(d.amount), 0) / filteredDonations.length) * 100) / 100
        : 0,
      oneTimeDonations: filteredDonations.filter(d => d.frequency === 'ONE_TIME').length,
      recurringDonations: filteredDonations.filter(d => d.frequency !== 'ONE_TIME').length,
      totalRecurring: filteredDonations
        .filter(d => d.frequency !== 'ONE_TIME')
        .reduce((sum, d) => sum + Number(d.amount), 0),
      completedDonations: filteredDonations.filter(d => d.status === 'COMPLETED').length,
      failedDonations: filteredDonations.filter(d => d.status === 'FAILED').length,
      pendingDonations: filteredDonations.filter(d => d.status === 'PENDING').length,
      anonymousDonations: filteredDonations.filter(d => !d.userId).length
    }

    // Donations by month (last 12 months)
    const monthlyDonations: { [key: string]: { count: number; amount: number } } = {}
    const today = new Date()
    
    for (let i = 11; i >= 0; i--) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1)
      const monthKey = date.toLocaleString('default', { month: 'short', year: 'numeric' })
      monthlyDonations[monthKey] = { count: 0, amount: 0 }
    }

    filteredDonations.forEach(d => {
      const monthKey = d.createdAt.toLocaleString('default', { month: 'short', year: 'numeric' })
      if (monthlyDonations[monthKey]) {
        monthlyDonations[monthKey].count++
        monthlyDonations[monthKey].amount += Number(d.amount)
      }
    })

    return NextResponse.json({
      donations: filteredDonations,
      stats,
      monthlyDonations
    })
  } catch (error) {
    logger.error({ err: error }, "Donations data error")
    return NextResponse.json(
      { error: "Failed to fetch donations data" },
      { status: 500 }
    )
  }
}
