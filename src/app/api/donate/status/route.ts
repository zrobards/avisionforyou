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
        configured: !!(process.env.SQUARE_ACCESS_TOKEN?.trim() && process.env.SQUARE_LOCATION_ID?.trim()),
        environment: process.env.SQUARE_ENVIRONMENT?.trim() || "not-configured",
        accessTokenExists: !!process.env.SQUARE_ACCESS_TOKEN?.trim(),
        accessTokenLength: process.env.SQUARE_ACCESS_TOKEN?.trim().length || 0,
        locationIdExists: !!process.env.SQUARE_LOCATION_ID?.trim(),
        locationIdLength: process.env.SQUARE_LOCATION_ID?.trim().length || 0,
        locationIdPreview: process.env.SQUARE_LOCATION_ID?.trim() ? `${process.env.SQUARE_LOCATION_ID.trim().slice(0, 4)}...` : "MISSING"
      }
    }
  })
}
