import { NextResponse } from 'next/server'
import { TIKTOK_URL } from '@/lib/social'

export async function GET() {
  try {
    const response = await fetch(`https://www.tiktok.com/oembed?url=${encodeURIComponent(TIKTOK_URL)}`, {
      headers: {
        Accept: 'application/json'
      },
      next: { revalidate: 3600 }
    })

    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: 'Failed to load TikTok profile embed' },
        { status: response.status }
      )
    }

    const data = await response.json()

    return NextResponse.json({
      success: true,
      html: data.html ?? null,
      title: data.title ?? null,
      authorName: data.author_name ?? null,
      authorUrl: data.author_url ?? TIKTOK_URL
    })
  } catch (error) {
    console.error('Error fetching TikTok oEmbed:', error)

    return NextResponse.json(
      { success: false, error: 'Unable to load TikTok profile embed' },
      { status: 500 }
    )
  }
}
