import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { logger } from "@/lib/logger"
import { getVisibleDonationsForDashboard } from "@/lib/donations"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await db.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user || (user.role !== "BOARD" && user.role !== "ADMIN")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const donations = await db.donation.findMany({
      take: 100,
      orderBy: { createdAt: "desc" }
    })

    const visibleDonations = await getVisibleDonationsForDashboard(donations)

    const stats = {
      totalDonations: visibleDonations.length,
      totalAmount: visibleDonations.reduce((sum, donation) => sum + Number(donation.amount), 0),
      averageDonation: visibleDonations.length > 0
        ? Math.round((visibleDonations.reduce((sum, donation) => sum + Number(donation.amount), 0) / visibleDonations.length) * 100) / 100
        : 0,
      oneTimeDonations: visibleDonations.filter((donation) => donation.frequency === "ONE_TIME").length,
      recurringDonations: visibleDonations.filter((donation) => donation.frequency !== "ONE_TIME").length,
      totalRecurring: visibleDonations
        .filter((donation) => donation.frequency !== "ONE_TIME")
        .reduce((sum, donation) => sum + Number(donation.amount), 0),
      completedDonations: visibleDonations.filter((donation) => donation.status === "COMPLETED").length,
      failedDonations: visibleDonations.filter((donation) => donation.status === "FAILED").length,
      pendingDonations: visibleDonations.filter((donation) => donation.status === "PENDING").length,
      anonymousDonations: visibleDonations.filter((donation) => !donation.userId).length
    }

    const monthlyDonations: Record<string, { count: number; amount: number }> = {}
    const today = new Date()

    for (let i = 11; i >= 0; i--) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1)
      const monthKey = date.toLocaleString("default", { month: "short", year: "numeric" })
      monthlyDonations[monthKey] = { count: 0, amount: 0 }
    }

    visibleDonations.forEach((donation) => {
      const monthKey = donation.createdAt.toLocaleString("default", { month: "short", year: "numeric" })
      if (monthlyDonations[monthKey]) {
        monthlyDonations[monthKey].count++
        monthlyDonations[monthKey].amount += Number(donation.amount)
      }
    })

    const topDonors = Array.from(
      visibleDonations.reduce((map, donation) => {
        const donorKey = donation.name?.trim() || donation.email?.trim() || "Anonymous"
        const current = map.get(donorKey) || 0
        map.set(donorKey, current + Number(donation.amount))
        return map
      }, new Map<string, number>())
    )
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, total]) => ({ name, total }))

    return NextResponse.json({
      donations: visibleDonations,
      stats,
      monthlyDonations,
      topDonors
    })
  } catch (error) {
    logger.error({ err: error }, "Error fetching board donation analytics")
    return NextResponse.json(
      { error: "Failed to fetch donation analytics" },
      { status: 500 }
    )
  }
}
