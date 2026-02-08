import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET - Fetch single published newsletter by slug (public)
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const newsletter = await db.newsletter.findFirst({
      where: {
        slug,
        status: 'PUBLISHED'
      },
      include: {
        author: {
          select: {
            name: true,
            email: true
          }
        }
      }
    })

    if (!newsletter) {
      return NextResponse.json(
        { error: 'Newsletter not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(newsletter, {
      headers: {
        'Cache-Control': 'no-store, max-age=0'
      }
    })
  } catch (error) {
    console.error('Error fetching newsletter:', error)
    return NextResponse.json(
      { error: 'Failed to fetch newsletter' },
      { status: 500 }
    )
  }
}
