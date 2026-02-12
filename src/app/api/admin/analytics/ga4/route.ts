import { NextRequest, NextResponse } from 'next/server'
import { requireAdminAuth, unauthorizedResponse } from '@/lib/apiAuth'
import { getGA4Metrics } from '@/lib/googleAnalytics'

export async function GET(req: NextRequest) {
  const session = await requireAdminAuth(req)
  if (!session) return unauthorizedResponse()

  const { searchParams } = new URL(req.url)
  const days = Math.min(Math.max(parseInt(searchParams.get('days') || '30'), 1), 365)

  const hasCredentials = !!(
    process.env.GOOGLE_ANALYTICS_CREDENTIALS &&
    process.env.GOOGLE_ANALYTICS_PROPERTY_ID
  )

  if (!hasCredentials) {
    return NextResponse.json({
      configured: false,
      message: 'Google Analytics credentials not configured. Set GOOGLE_ANALYTICS_CREDENTIALS and GOOGLE_ANALYTICS_PROPERTY_ID environment variables.',
    })
  }

  const data = await getGA4Metrics(days)

  if (!data) {
    return NextResponse.json({
      configured: true,
      error: 'Failed to fetch analytics data. Check your credentials and property ID.',
    }, { status: 502 })
  }

  return NextResponse.json({
    configured: true,
    data,
  })
}
