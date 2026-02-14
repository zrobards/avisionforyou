import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { logger } from '@/lib/logger'

// GET /api/team - List all active team members (public)
export async function GET() {
  try {
    const members = await db.teamMember.findMany({
      where: { isActive: true },
      orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
      select: {
        id: true,
        name: true,
        title: true,
        role: true,
        bio: true,
        credentials: true,
        email: true,
        imageUrl: true,
      }
    })

    return NextResponse.json(members, {
      headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' }
    })
  } catch (error) {
    logger.error({ err: error }, 'Error fetching team members')
    return NextResponse.json(
      { error: 'Failed to fetch team members' },
      { status: 500 }
    )
  }
}
