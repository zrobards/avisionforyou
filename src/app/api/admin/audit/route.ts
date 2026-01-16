import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { getRecentAuditActivity } from '@/lib/audit'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const user = await db.user.findUnique({
      where: { email: session.user.email }
    })

    if (user?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const entity = searchParams.get('entity')
    const action = searchParams.get('action')

    // Build where clause
    const where: any = {}
    
    if (entity) {
      where.entity = entity
    }
    
    if (action) {
      where.action = action
    }

    // Fetch audit logs
    const logs = await db.auditLog.findMany({
      where,
      orderBy: {
        createdAt: 'desc'
      },
      take: Math.min(limit, 100)
    })

    return NextResponse.json({ data: logs })
  } catch (error) {
    console.error('Failed to fetch audit logs:', error)
    return NextResponse.json(
      { error: 'Failed to fetch audit logs' },
      { status: 500 }
    )
  }
}
