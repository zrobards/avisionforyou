import { db } from "@/lib/db"
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { logAuditAction, AuditAction, AuditEntity } from "@/lib/audit"

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

    if (user?.role !== "ADMIN" && user?.role !== "STAFF") {
      return NextResponse.json(
        { error: "Admin or staff access required" },
        { status: 403 }
      )
    }

    // Get query parameters for filtering
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const frequency = searchParams.get('frequency')
    const search = searchParams.get('search')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const exportCsv = searchParams.get('export') === 'csv'

    // Build where clause for filtering
    const where: any = {}
    
    if (status && status !== 'all') {
      where.status = status.toUpperCase()
    }
    
    if (frequency && frequency !== 'all') {
      where.frequency = frequency.toUpperCase()
    }
    
    if (startDate || endDate) {
      where.createdAt = {}
      if (startDate) {
        where.createdAt.gte = new Date(startDate)
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate)
      }
    }
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ]
    }

    // Get all donations with user details
    const donations = await db.donation.findMany({
      where,
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

    // Log export action if CSV export requested
    if (exportCsv) {
      await logAuditAction({
        action: AuditAction.EXPORT,
        entity: AuditEntity.DONATION,
        entityId: 'bulk',
        userId: user.id,
        details: {
          count: donations.length,
          filters: { status, frequency, search, startDate, endDate }
        },
        req: request
      })
    }

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
