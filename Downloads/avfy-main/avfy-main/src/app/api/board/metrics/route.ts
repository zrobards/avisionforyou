import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET() {
  const session = await getServerSession(authOptions)
  
  if (!session || ((session.user as any).role !== "BOARD" && (session.user as any).role !== "ADMIN")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  const [donationsThisMonth, meetingsThisMonth, totalSubscribers, pendingInquiries] = await Promise.all([
    db.donation.aggregate({
      where: { createdAt: { gte: startOfMonth }, status: "COMPLETED" },
      _sum: { amount: true },
      _count: true,
    }),
    db.programSession.count({
      where: { startDate: { gte: startOfMonth } },
    }),
    db.newsletterSubscriber.count({
      where: { subscribed: true },
    }),
    db.contactInquiry.count({
      where: { status: "NEW" },
    }),
  ])

  return NextResponse.json({
    donations: {
      amount: donationsThisMonth._sum.amount || 0,
      count: donationsThisMonth._count,
    },
    meetingsThisMonth,
    totalSubscribers,
    pendingInquiries,
  })
}
