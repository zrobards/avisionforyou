import { NextRequest, NextResponse } from "next/server"
import { requireAdminAuth } from '@/lib/apiAuth'

/**
 * GET /api/donate/status
 *
 * Check payment processing configuration status (admin only)
 */
export async function GET(request: NextRequest) {
  const session = await requireAdminAuth(request)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  return NextResponse.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    paymentMethods: {
      stripe: {
        configured: !!(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY),
      },
      square: {
        configured: !!(process.env.SQUARE_ACCESS_TOKEN?.trim() && process.env.SQUARE_LOCATION_ID?.trim()),
        environment: process.env.SQUARE_ENVIRONMENT?.trim() || "not-configured",
      }
    }
  })
}
