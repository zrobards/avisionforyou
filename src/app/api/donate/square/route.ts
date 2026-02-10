import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { sendDonationConfirmationEmail } from "@/lib/email"
import { v4 as uuidv4 } from "uuid"
import { DonationSchema, validateRequest, getValidationErrors } from '@/lib/validation'
import { handleApiError, generateRequestId, logApiRequest } from '@/lib/apiErrors'
import { checkRateLimit } from '@/lib/rateLimit'
import { ZodError } from 'zod'
import { rateLimitResponse, errorResponse } from '@/lib/apiAuth'
import { logActivity, notifyByRole } from '@/lib/notifications'

// Get Square API base URL
function getSquareBaseUrl() {
  return process.env.SQUARE_ENVIRONMENT === "production"
    ? "https://connect.squareup.com"
    : "https://connect.squareupsandbox.com"
}

// Get Square Location ID from environment
function getSquareLocationId() {
  const locationId = process.env.SQUARE_LOCATION_ID
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
 * - Rate limited: 5 per IP per hour
 * - Validates all inputs with Zod
 * - No PII in error messages
 * - No Square API details in responses
 */
export async function POST(request: NextRequest) {
  const requestId = generateRequestId()
  const startTime = Date.now()

  try {
    // Get client IP for rate limiting
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               'unknown'

    // Check rate limit (5 donations per IP per hour)
    const rateLimitKey = `donate:${ip}`
    const rateLimit = checkRateLimit(rateLimitKey, 5, 3600)

    if (!rateLimit.allowed) {
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
      return rateLimitResponse(rateLimit.retryAfter || 60)
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

      // First create an order
      const orderBody = {
        idempotencyKey: donationSessionId,
        order: {
          locationId: locationId,
          lineItems: [
            {
              name: `A Vision For You - ${frequency === "ONE_TIME" ? "One-Time" : frequency === "MONTHLY" ? "Monthly" : "Annual"} Donation`,
              quantity: "1",
              basePriceMoney: {
                amount: amountInCents,
                currency: "USD"
              }
            }
          ]
        }
      }

      const orderResponse = await fetch(`${getSquareBaseUrl()}/v2/orders`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.SQUARE_ACCESS_TOKEN}`,
          "Content-Type": "application/json",
          "Square-Version": "2024-12-18"
        },
        body: JSON.stringify(orderBody)
      })

      if (!orderResponse.ok) {
        const errorData = await orderResponse.json()
        console.error("Square order error:", JSON.stringify(errorData))
        throw new Error(`Failed to create order: ${orderResponse.status}`)
      }

      const orderData = await orderResponse.json()
      const orderId = orderData.order.id

      // Now create a checkout link from the order
      const checkoutBody = {
        idempotencyKey: `${donationSessionId}-checkout`,
        order: {
          id: orderId
        },
        redirectUrl: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/donation/confirm?id=${donation.id}&amount=${amount}`,
        askForShippingAddress: false
      }

      const response = await fetch(`${getSquareBaseUrl()}/v2/checkouts`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.SQUARE_ACCESS_TOKEN}`,
          "Content-Type": "application/json",
          "Square-Version": "2024-12-18"
        },
        body: JSON.stringify(checkoutBody)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(`Square API error: ${response.status}`)
      }

      const checkout = await response.json()

      if (!checkout.checkout?.checkout_page_url) {
        throw new Error("Checkout URL not returned from Square")
      }

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
        console.error("Email send failed for donation:", donation.id)
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
          url: checkout.checkout.checkout_page_url,
          donationId: donation.id,
          isRecurring: frequency !== "ONE_TIME"
        },
        { status: 200 }
      )
    } catch (squareError: any) {
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
  } catch (error: any) {
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
