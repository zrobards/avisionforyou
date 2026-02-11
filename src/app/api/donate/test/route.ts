import { NextRequest, NextResponse } from "next/server"
import { requireAdminAuth } from '@/lib/apiAuth'

/**
 * GET /api/donate/test
 *
 * Check payment provider configuration (admin only)
 */
export async function GET(request: NextRequest) {
  const session = await requireAdminAuth(request)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  return NextResponse.json({
    square: {
      configured: !!process.env.SQUARE_ACCESS_TOKEN?.trim(),
      environment: process.env.SQUARE_ENVIRONMENT?.trim() || "not-configured",
    },
    stripe: {
      configured: !!process.env.STRIPE_SECRET_KEY,
    }
  })
}
