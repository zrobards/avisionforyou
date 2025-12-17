import { db } from "@/lib/db"
import { sendDonationThankYou } from "@/lib/email"
import { NextRequest, NextResponse } from "next/server"

// Stripe webhooks removed - Square handles webhooks directly
export async function POST(request: NextRequest) {
  try {
    return NextResponse.json(
      { error: "Square webhooks are handled separately" },
      { status: 400 }
    )
  } catch (error) {
    console.error("Webhook error:", error)
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    )
  }
}
