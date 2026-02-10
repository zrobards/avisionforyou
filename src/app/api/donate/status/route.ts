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
        configured: !!(process.env.SQUARE_ACCESS_TOKEN && process.env.SQUARE_LOCATION_ID),
        environment: process.env.SQUARE_ENVIRONMENT || "not-configured",
        accessTokenExists: !!process.env.SQUARE_ACCESS_TOKEN,
        accessTokenLength: process.env.SQUARE_ACCESS_TOKEN?.length || 0,
        locationIdExists: !!process.env.SQUARE_LOCATION_ID,
        locationIdLength: process.env.SQUARE_LOCATION_ID?.length || 0,
        locationIdPreview: process.env.SQUARE_LOCATION_ID ? `${process.env.SQUARE_LOCATION_ID.slice(0, 4)}...` : "MISSING"
      }
    }
  })
}
