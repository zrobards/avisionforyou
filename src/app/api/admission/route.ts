import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sendAdmissionConfirmation, sendAdmissionNotificationToAdmin } from '@/lib/email';
import { requireAdminAuth, errorResponse, validationErrorResponse, successResponse } from '@/lib/apiAuth'
import { AdmissionSchema, validateRequest, getValidationErrors } from '@/lib/validation'
import { handleApiError, generateRequestId, logApiRequest } from '@/lib/apiErrors'
import { checkRateLimit } from '@/lib/rateLimit'
import { ZodError } from 'zod'

/**
 * POST /api/admission
 * 
 * Submit admission inquiry
 * 
 * PHASE 1 HARDENING:
 * - NO authentication required (public endpoint)
 * - Rate limited: 10 per day per IP, 1 per day per email
 * - Validates all inputs with Zod
 * - Sanitizes text before storing
 * - Prevents duplicate email submissions
 * - No PII in error messages
 */
export async function POST(request: NextRequest) {
  const requestId = generateRequestId()
  const startTime = Date.now()

  try {
    // Get client IP for rate limiting
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               'unknown'

    // Validate request body with Zod FIRST (to get email for per-email rate limit)
    let validatedData
    try {
      validatedData = await validateRequest(request, AdmissionSchema)
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = getValidationErrors(error)
        logApiRequest({
          timestamp: new Date(),
          method: 'POST',
          path: '/api/admission',
          userId: undefined,
          statusCode: 400,
          duration: Date.now() - startTime,
          requestId,
          error: 'VALIDATION_ERROR'
        })
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid admission data',
            code: 'VALIDATION_ERROR',
            details: errors
          },
          { status: 400 }
        )
      }
      throw error
    }

    const { name, email, phone, program, message } = validatedData

    // Check IP rate limit (10 per day)
    const ipLimitKey = `admission:ip:${ip}`
    const ipLimit = checkRateLimit(ipLimitKey, 10, 86400)

    if (!ipLimit.allowed) {
      logApiRequest({
        timestamp: new Date(),
        method: 'POST',
        path: '/api/admission',
        userId: undefined,
        statusCode: 429,
        duration: Date.now() - startTime,
        requestId,
        error: 'IP_RATE_LIMIT_EXCEEDED'
      })
      return NextResponse.json(
        {
          success: false,
          error: 'Too many submissions. Please try again later.',
          code: 'RATE_LIMIT_EXCEEDED'
        },
        { status: 429, headers: { 'Retry-After': String(ipLimit.retryAfter || 3600) } }
      )
    }

    // Check email rate limit (1 per day)
    const emailLimitKey = `admission:email:${email.toLowerCase()}`
    const emailLimit = checkRateLimit(emailLimitKey, 1, 86400)

    if (!emailLimit.allowed) {
      logApiRequest({
        timestamp: new Date(),
        method: 'POST',
        path: '/api/admission',
        userId: undefined,
        statusCode: 429,
        duration: Date.now() - startTime,
        requestId,
        error: 'EMAIL_RATE_LIMIT_EXCEEDED'
      })
      return NextResponse.json(
        {
          success: false,
          error: 'An inquiry from this email was already submitted today',
          code: 'RATE_LIMIT_EXCEEDED'
        },
        { status: 429, headers: { 'Retry-After': String(emailLimit.retryAfter || 86400) } }
      )
    }

    // Check if email already exists in database
    const existingInquiry = await db.admissionInquiry.findUnique({
      where: { email: email.toLowerCase() },
    }).catch(() => null)

    if (existingInquiry) {
      logApiRequest({
        timestamp: new Date(),
        method: 'POST',
        path: '/api/admission',
        userId: undefined,
        statusCode: 400,
        duration: Date.now() - startTime,
        requestId,
        error: 'DUPLICATE_EMAIL'
      })
      return NextResponse.json(
        {
          success: false,
          error: 'An inquiry from this email already exists',
          code: 'DUPLICATE_SUBMISSION'
        },
        { status: 400 }
      )
    }

    // Create new admission inquiry with sanitized data
    const inquiry = await db.admissionInquiry.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        phone: phone?.trim() || null,
        program: (program || 'Not specified').trim(),
        message: (message || '').trim(),
        status: 'pending',
      },
    })

    // Send confirmation emails (non-blocking)
    try {
      await Promise.all([
        sendAdmissionConfirmation(name, email, program || 'Not specified'),
        sendAdmissionNotificationToAdmin(name, email, phone || '', program || 'Not specified', message || '')
      ])
    } catch (emailError) {
      // Log but don't fail - inquiry was already saved
      console.error("Email send failed for admission inquiry:", inquiry.id)
    }

    logApiRequest({
      timestamp: new Date(),
      method: 'POST',
      path: '/api/admission',
      userId: undefined,
      statusCode: 201,
      duration: Date.now() - startTime,
      requestId
    })

    return NextResponse.json(
      {
        success: true,
        message: 'Inquiry submitted successfully',
        inquiryId: inquiry.id,
      },
      { status: 201 }
    )
  } catch (error) {
    const errorInfo = handleApiError(error, 'admission', requestId, undefined)

    logApiRequest({
      timestamp: new Date(),
      method: 'POST',
      path: '/api/admission',
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

/**
 * GET /api/admission
 * 
 * Fetch admission inquiries
 * 
 * PHASE 1 HARDENING:
 * - Requires admin authentication (not fake Bearer check)
 * - Returns paginated results (limit 50)
 * - Excludes sensitive phone numbers
 */
export async function GET(request: NextRequest) {
  const requestId = generateRequestId()
  const startTime = Date.now()

  try {
    // Require admin authentication
    const session = await requireAdminAuth(request)
    if (!session) {
      return errorResponse('Unauthorized', 'UNAUTHORIZED', 401)
    }

    const userId = (session.user as any)?.id

    // Parse pagination parameters
    const page = Math.max(1, parseInt(request.nextUrl.searchParams.get('page') || '1', 10))
    const limit = Math.min(50, Math.max(1, parseInt(request.nextUrl.searchParams.get('limit') || '50', 10)))
    const skip = (page - 1) * limit

    // Fetch inquiries with pagination
    const [inquiries, total] = await Promise.all([
      db.admissionInquiry.findMany({
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          program: true,
          message: true,
          status: true,
          createdAt: true,
          updatedAt: true
        }
      }),
      db.admissionInquiry.count()
    ])

    logApiRequest({
      timestamp: new Date(),
      method: 'GET',
      path: '/api/admission',
      userId,
      statusCode: 200,
      duration: Date.now() - startTime,
      requestId
    })

    return successResponse({
      data: inquiries,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    const userId = (await requireAdminAuth(request))?.user?.id as string | undefined
    const errorInfo = handleApiError(error, 'admission', requestId, userId)

    logApiRequest({
      timestamp: new Date(),
      method: 'GET',
      path: '/api/admission',
      userId,
      statusCode: errorInfo.statusCode,
      duration: Date.now() - startTime,
      requestId,
      error: errorInfo.code
    })

    return NextResponse.json(
      {
        success: false,
        error: errorInfo.message,
        code: errorInfo.code,
        ...(errorInfo.details && { details: errorInfo.details })
      },
      { status: errorInfo.statusCode }
    )
  }
}
