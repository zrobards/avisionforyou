import { sendBulkMeetingReminders } from '@/lib/email'

// This endpoint is called by an external cron service
// Set up: Use https://cron-job.org, AWS EventBridge, or Google Cloud Scheduler
// Call this every 10 minutes: POST /api/cron/reminders
// For hourly use a service like: https://cron-job.org (free tier available)

export async function POST(request: Request) {
  try {
    // Verify the request has the correct secret
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET

    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
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

