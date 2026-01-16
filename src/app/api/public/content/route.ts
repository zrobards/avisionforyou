import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET - Fetch site content (public endpoint)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const key = searchParams.get('key')

    if (key) {
      // Fetch specific content by key
      const content = await db.siteContent.findUnique({
        where: { key }
      })

      if (!content) {
        return NextResponse.json({ error: 'Content not found' }, { status: 404 })
      }

      return NextResponse.json(content)
    }

    // Fetch all content
    const content = await db.siteContent.findMany({
      orderBy: { key: 'asc' }
    })

    // Convert to key-value map for easier consumption
    const contentMap: Record<string, any> = {}
    content.forEach(item => {
      try {
        // Try to parse JSON values
        contentMap[item.key] = item.type === 'json' ? JSON.parse(item.value) : item.value
      } catch {
        contentMap[item.key] = item.value
      }
    })

    return NextResponse.json(contentMap, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600'
      }
    })
  } catch (error) {
    console.error('Error fetching content:', error)
    return NextResponse.json({ error: 'Failed to fetch content' }, { status: 500 })
  }
}
