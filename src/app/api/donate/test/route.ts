import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json({
    square: {
      configured: !!process.env.SQUARE_ACCESS_TOKEN,
      environment: process.env.SQUARE_ENVIRONMENT,
      publicEnvironment: process.env.NEXT_PUBLIC_SQUARE_ENVIRONMENT,
      accessTokenLength: process.env.SQUARE_ACCESS_TOKEN?.length || 0,
      applicationId: process.env.SQUARE_APPLICATION_ID ? "configured" : "missing"
    },
    stripe: {
      configured: !!process.env.STRIPE_SECRET_KEY,
      publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ? "configured" : "missing",
      webhookSecret: !!process.env.STRIPE_WEBHOOK_SECRET
    }
  })
}
