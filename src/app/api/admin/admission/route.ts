import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

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

    if (user?.role !== 'ADMIN' && user?.role !== 'STAFF') {
      return NextResponse.json(
        { error: 'Admin or staff access required' },
        { status: 403 }
      )
    }

    // Get query parameters for filtering
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const program = searchParams.get('program')
    const search = searchParams.get('search')

    // Build where clause for filtering
    const where: any = {}
    
    if (status && status !== 'all') {
      where.status = status
    }
    
    if (program && program !== 'all') {
      where.program = { contains: program, mode: 'insensitive' }
    }
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ]
    }

    // Fetch admission inquiries
    const inquiries = await db.admissionInquiry.findMany({
      where,
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({ data: inquiries })
  } catch (error) {
    console.error('Admission inquiries fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch admission inquiries' },
      { status: 500 }
    )
  }
}
