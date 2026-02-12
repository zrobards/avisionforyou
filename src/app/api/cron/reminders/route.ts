import { sendBulkMeetingReminders } from '@/lib/email'
import crypto from 'crypto'

// This endpoint is called by Vercel Cron every 10 minutes
// Vercel Cron jobs are automatically authenticated - no Bearer token needed
// For external cron services, use CRON_SECRET authentication

export async function GET(request: Request) {
  try {
    // Require Bearer token auth for all callers
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET

    if (!cronSecret || !authHeader) {
      return new Response('Unauthorized', { status: 401 })
    }

    const expectedAuth = `Bearer ${cronSecret}`
    try {
      const isValid = crypto.timingSafeEqual(
        Buffer.from(authHeader),
        Buffer.from(expectedAuth)
      )
      if (!isValid) {
        return new Response('Unauthorized', { status: 401 })
      }
    } catch {
      return new Response('Unauthorized', { status: 401 })
    }

    const result = await sendBulkMeetingReminders()

    return Response.json({
      success: true,
      message: `Sent ${result.total} reminders (24h: ${result.sent24h}, 1h: ${result.sent1h})`,
      ...result,
    })
  } catch (error) {
    console.error('Cron error:', error)
    return Response.json(
      { success: false, error: 'Failed to send reminders' },
      { status: 500 }
    )
  }
}

// Also support POST for external cron services
export async function POST(request: Request) {
  return GET(request)
}

