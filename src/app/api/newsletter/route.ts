import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { logger } from '@/lib/logger'

export const dynamic = 'force-dynamic'

// GET - Fetch all published newsletters (public)
export async function GET(req: NextRequest) {
  try {
    const newsletters = await db.newsletter.findMany({
      where: {
        status: 'PUBLISHED'
      },
      orderBy: [
        { publishedAt: 'desc' },
        { createdAt: 'desc' }
      ],
      include: {
        author: {
          select: {
            name: true,
            email: true
          }
        }
      }
    })

    logger.info({ count: newsletters.length }, 'Public newsletter API: fetched published newsletters')
    if (newsletters.length > 0) {
      logger.debug({ id: newsletters[0].id, title: newsletters[0].title, status: newsletters[0].status }, 'Latest newsletter')
    }

    return NextResponse.json(newsletters, {
      headers: {
        'Cache-Control': 'no-store, max-age=0'
      }
    })
  } catch (error) {
    logger.error({ err: error }, 'Error fetching newsletters')
    return NextResponse.json(
      { error: 'Failed to fetch newsletters' },
      { status: 500 }
    )
  }
}
