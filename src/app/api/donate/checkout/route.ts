import { NextRequest, NextResponse } from "next/server"
import { logger } from '@/lib/logger'

// Stripe checkout removed - using Square instead
// Redirect to Square payment endpoint
export async function POST(request: NextRequest) {
  try {
    return NextResponse.json(
      { error: "Use /api/donate/square endpoint for donations" },
      { status: 400 }
    )
  } catch (error) {
    logger.error({ err: error }, "Donation error")
    return NextResponse.json(
      { error: "Failed to process donation" },
      { status: 500 }
    )
  }
}
