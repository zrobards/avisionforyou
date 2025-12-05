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
        { error: "Only admins can view donation data" },
        { status: 403 }
      )
    }

    // Get all donations with user details
    const donations = await db.donation.findMany({
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

    // Calculate statistics
    const stats = {
      totalDonations: donations.length,
      totalAmount: donations.reduce((sum, d) => sum + d.amount, 0),
      averageDonation: donations.length > 0 
        ? Math.round((donations.reduce((sum, d) => sum + d.amount, 0) / donations.length) * 100) / 100
        : 0,
      oneTimeDonations: donations.filter(d => d.frequency === 'ONE_TIME').length,
      recurringDonations: donations.filter(d => d.frequency !== 'ONE_TIME').length,
      totalRecurring: donations
        .filter(d => d.frequency !== 'ONE_TIME')
        .reduce((sum, d) => sum + d.amount, 0),
      completedDonations: donations.filter(d => d.status === 'COMPLETED').length,
      failedDonations: donations.filter(d => d.status === 'FAILED').length,
      pendingDonations: donations.filter(d => d.status === 'PENDING').length,
      anonymousDonations: donations.filter(d => !d.userId).length
    }

    // Donations by month (last 12 months)
    const monthlyDonations: { [key: string]: { count: number; amount: number } } = {}
    const today = new Date()
    
    for (let i = 11; i >= 0; i--) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1)
      const monthKey = date.toLocaleString('default', { month: 'short', year: 'numeric' })
      monthlyDonations[monthKey] = { count: 0, amount: 0 }
    }

    donations.forEach(d => {
      const monthKey = d.createdAt.toLocaleString('default', { month: 'short', year: 'numeric' })
      if (monthlyDonations[monthKey]) {
        monthlyDonations[monthKey].count++
        monthlyDonations[monthKey].amount += d.amount
      }
    })

    return NextResponse.json({
      donations,
      stats,
      monthlyDonations
    })
  } catch (error) {
    console.error("Donations data error:", error)
    return NextResponse.json(
      { error: "Failed to fetch donations data" },
      { status: 500 }
    )
  }
}
