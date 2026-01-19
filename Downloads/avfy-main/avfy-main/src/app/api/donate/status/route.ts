import { NextRequest, NextResponse } from "next/server"

/**
 * GET /api/donate/status
 * 
 * Check payment processing configuration status
 * Returns which payment methods are available
 */
export async function GET(request: NextRequest) {
  return NextResponse.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    paymentMethods: {
      stripe: {
        configured: !!(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY),
        environment: process.env.NODE_ENV
      },
      square: {
        configured: !!(process.env.SQUARE_ACCESS_TOKEN),
        environment: process.env.SQUARE_ENVIRONMENT || "not-configured",
        accessTokenExists: !!process.env.SQUARE_ACCESS_TOKEN,
        accessTokenLength: process.env.SQUARE_ACCESS_TOKEN?.length || 0
      }
    }
  })
}
