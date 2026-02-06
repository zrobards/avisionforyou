import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

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

    console.log(`Public newsletter API: Found ${newsletters.length} published newsletters`)
    if (newsletters.length > 0) {
      console.log('Latest newsletter:', {
        id: newsletters[0].id,
        title: newsletters[0].title,
        status: newsletters[0].status,
        publishedAt: newsletters[0].publishedAt
      })
    }

    return NextResponse.json(newsletters, {
      headers: {
        'Cache-Control': 'no-store, max-age=0'
      }
    })
  } catch (error) {
    console.error('Error fetching newsletters:', error)
    return NextResponse.json(
      { error: 'Failed to fetch newsletters' },
      { status: 500 }
    )
  }
}
