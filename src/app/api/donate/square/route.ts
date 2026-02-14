import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { sendDonationConfirmationEmail } from "@/lib/email"
import { v4 as uuidv4 } from "uuid"
import { DonationSchema, validateRequest, getValidationErrors } from '@/lib/validation'
import { handleApiError, generateRequestId, logApiRequest } from '@/lib/apiErrors'
import { rateLimit, donateLimiter, getClientIp } from '@/lib/rateLimit'
import { ZodError } from 'zod'
import { rateLimitResponse, errorResponse } from '@/lib/apiAuth'
import { logActivity, notifyByRole } from '@/lib/notifications'
import { logger } from '@/lib/logger'

// Get Square API base URL
function getSquareBaseUrl() {
  return process.env.SQUARE_ENVIRONMENT?.trim() === "production"
    ? "https://connect.squareup.com"
    : "https://connect.squareupsandbox.com"
}

// Get Square Location ID from environment
function getSquareLocationId() {
  const locationId = process.env.SQUARE_LOCATION_ID?.trim()
  if (!locationId) {
    throw new Error("SQUARE_LOCATION_ID environment variable is required")
  }
  return locationId
}

// Calculate next renewal date based on start date and frequency
function getNextRenewalDate(startDate: Date, frequency: string): Date {
  const next = new Date(startDate)

  if (frequency === "MONTHLY") {
    next.setMonth(next.getMonth() + 1)
  } else if (frequency === "YEARLY") {
    next.setFullYear(next.getFullYear() + 1)
  }

  return next
}

/**
 * POST /api/donate/square
 *
 * Create donation and generate Square payment link
 *
 * PHASE 1 HARDENING:
 * - NO authentication required (public endpoint)
 * - Rate limited: 5 per IP per hour (via Upstash Redis)
 * - Validates all inputs with Zod
 * - No PII in error messages
 * - No Square API details in responses
 */
export async function POST(request: NextRequest) {
  const requestId = generateRequestId()
  const startTime = Date.now()

  try {
    // Get client IP for rate limiting
    const ip = getClientIp(request)

    // Check rate limit (5 donations per IP per hour via Upstash Redis)
    const rl = await rateLimit(donateLimiter, ip)

    if (!rl.success) {
      logApiRequest({
        timestamp: new Date(),
        method: 'POST',
        path: '/api/donate/square',
        userId: undefined,
        statusCode: 429,
        duration: Date.now() - startTime,
        requestId,
        error: 'RATE_LIMIT_EXCEEDED'
      })
      return rateLimitResponse(60)
    }

    // Validate request body with Zod
    let validatedData
    try {
      validatedData = await validateRequest(request, DonationSchema)
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = getValidationErrors(error)
        logApiRequest({
          timestamp: new Date(),
          method: 'POST',
          path: '/api/donate/square',
          userId: undefined,
          statusCode: 400,
          duration: Date.now() - startTime,
          requestId,
          error: 'VALIDATION_ERROR'
        })
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid donation data',
            code: 'VALIDATION_ERROR',
            details: errors
          },
          { status: 400 }
        )
      }
      throw error
    }

    const { amount, frequency, email, name } = validatedData

    // Amount in cents
    const amountInCents = Math.round(amount * 100)

    // Generate a unique donation ID
    const donationSessionId = uuidv4()
    const now = new Date()
    const nextRenewalDate = frequency !== "ONE_TIME" ? getNextRenewalDate(now, frequency) : null

    // Save donation record to database first (PENDING status)
    const donation = await db.donation.create({
      data: {
        amount,
        frequency: frequency as "ONE_TIME" | "MONTHLY" | "YEARLY",
        email,
        name,
        status: "PENDING",
        squarePaymentId: donationSessionId,
        nextRenewalDate: nextRenewalDate,
        recurringStartDate: frequency !== "ONE_TIME" ? now : null,
        renewalSchedule: "anniversary"
      }
    })

    // Create Square Payment Link via HTTP API
    try {
      // Get location ID
      const locationId = getSquareLocationId()

      // Create payment link via Square Payment Links API (replaces deprecated /v2/checkouts)
      const paymentLinkBody = {
        idempotency_key: donationSessionId,
        quick_pay: {
          name: `A Vision For You - ${frequency === "ONE_TIME" ? "One-Time" : frequency === "MONTHLY" ? "Monthly" : "Annual"} Donation`,
          price_money: {
            amount: amountInCents,
            currency: "USD"
          },
          location_id: locationId
        },
        checkout_options: {
          redirect_url: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/donation/confirm?id=${donation.id}&amount=${amount}`,
          ask_for_shipping_address: false
        }
      }

      const response = await fetch(`${getSquareBaseUrl()}/v2/online-checkout/payment-links`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.SQUARE_ACCESS_TOKEN?.trim()}`,
          "Content-Type": "application/json",
          "Square-Version": "2024-12-18"
        },
        body: JSON.stringify(paymentLinkBody)
      })

      if (!response.ok) {
        const errorData = await response.json()
        logger.error({ errorData }, "Square payment link error")
        throw new Error(`Square API error: ${response.status}`)
      }

      const paymentLinkData = await response.json()

      if (!paymentLinkData.payment_link?.url) {
        throw new Error("Payment link URL not returned from Square")
      }

      const paymentUrl = paymentLinkData.payment_link.url

      // Send confirmation email (non-blocking)
      try {
        await sendDonationConfirmationEmail(
          donation.id,
          email,
          name,
          amount,
          frequency as "ONE_TIME" | "MONTHLY" | "YEARLY"
        )
      } catch (emailError) {
        // Log but don't fail - donation was already saved
        logger.error({ err: emailError, donationId: donation.id }, "Email send failed for donation")
      }

      // Log activity and notify board (non-blocking)
      const freqLabel = frequency === "ONE_TIME" ? "one-time" : frequency === "MONTHLY" ? "monthly" : "annual"
      logActivity("donation", `New $${amount} ${freqLabel} donation`, name || "Anonymous", `/admin/donations`)
      notifyByRole(["BOARD", "ADMIN"], "donation", "New Donation Received", `$${amount} ${freqLabel} donation from ${name || "Anonymous"}`, `/admin/donations`)

      logApiRequest({
        timestamp: new Date(),
        method: 'POST',
        path: '/api/donate/square',
        userId: undefined,
        statusCode: 200,
        duration: Date.now() - startTime,
        requestId
      })

      // Return ONLY necessary data - no Square internals
      return NextResponse.json(
        {
          success: true,
          url: paymentUrl,
          donationId: donation.id,
          isRecurring: frequency !== "ONE_TIME"
        },
        { status: 200 }
      )
    } catch (squareError: unknown) {
      // Mark donation as FAILED since Square API call failed
      try {
        await db.donation.update({
          where: { id: donation.id },
          data: { status: "FAILED" }
        })
      } catch (updateError) {
        logger.error({ err: updateError }, "Failed to mark donation as FAILED")
      }

      const errorInfo = handleApiError(squareError, 'donate/square', requestId, undefined)

      logApiRequest({
        timestamp: new Date(),
        method: 'POST',
        path: '/api/donate/square',
        userId: undefined,
        statusCode: 500,
        duration: Date.now() - startTime,
        requestId,
        error: 'SQUARE_ERROR'
      })

      return NextResponse.json(
        {
          success: false,
          error: 'Payment processing failed. Please check your details and try again.',
          code: 'PAYMENT_ERROR'
        },
        { status: 500 }
      )
    }
  } catch (error: unknown) {
    const errorInfo = handleApiError(error, 'donate/square', requestId, undefined)

    logApiRequest({
      timestamp: new Date(),
      method: 'POST',
      path: '/api/donate/square',
      userId: undefined,
      statusCode: errorInfo.statusCode,
      duration: Date.now() - startTime,
      requestId,
      error: errorInfo.code
    })

    return NextResponse.json(
      {
        success: false,
        error: errorInfo.message,
        code: errorInfo.code
      },
      { status: errorInfo.statusCode }
    )
  }
}
