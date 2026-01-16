import { sendBulkMeetingReminders } from '@/lib/email'

// This endpoint is called by Vercel Cron every 10 minutes
// Vercel Cron jobs are automatically authenticated - no Bearer token needed
// For external cron services, use CRON_SECRET authentication

export async function GET(request: Request) {
  try {
    // Check if called by Vercel Cron (has special headers) or external service
    const authHeader = request.headers.get('authorization')
    const isVercelCron = request.headers.get('user-agent')?.includes('vercel-cron')
    
    // If not Vercel Cron, require authentication
    if (!isVercelCron) {
      const cronSecret = process.env.CRON_SECRET
      
      if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
        return new Response('Unauthorized', { status: 401 })
      }
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

