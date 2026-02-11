import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { sendEmail } from '@/lib/email'
import { ContactSchema, validateRequest, getValidationErrors } from '@/lib/validation'
import { handleApiError, generateRequestId, logApiRequest } from '@/lib/apiErrors'
import { checkRateLimit } from '@/lib/rateLimit'
import { ZodError } from 'zod'
import { escapeHtml } from '@/lib/sanitize'

/**
 * POST /api/contact
 * 
 * Submit contact inquiry
 * 
 * PHASE 1 HARDENING:
 * - NO authentication required (public endpoint)
 * - Rate limited: 5 per day per IP
 * - Validates all inputs with Zod
 * - Sanitizes text before storing
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

    // Check rate limit (5 per day per IP)
    const rateLimitKey = `contact:${ip}`
    const rateLimit = checkRateLimit(rateLimitKey, 5, 86400)

    if (!rateLimit.allowed) {
      logApiRequest({
        timestamp: new Date(),
        method: 'POST',
        path: '/api/contact',
        userId: undefined,
        statusCode: 429,
        duration: Date.now() - startTime,
        requestId,
        error: 'RATE_LIMIT_EXCEEDED'
      })
      return NextResponse.json(
        {
          success: false,
          error: 'Too many submissions. Please try again later.',
          code: 'RATE_LIMIT_EXCEEDED'
        },
        { status: 429, headers: { 'Retry-After': String(rateLimit.retryAfter || 3600) } }
      )
    }

    // Validate request body with Zod
    let validatedData
    try {
      validatedData = await validateRequest(request, ContactSchema)
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = getValidationErrors(error)
        logApiRequest({
          timestamp: new Date(),
          method: 'POST',
          path: '/api/contact',
          userId: undefined,
          statusCode: 400,
          duration: Date.now() - startTime,
          requestId,
          error: 'VALIDATION_ERROR'
        })
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid contact data',
            code: 'VALIDATION_ERROR',
            details: errors
          },
          { status: 400 }
        )
      }
      throw error
    }

    const { name, email, phone, department, subject, message } = validatedData

    // Save to database with sanitized data
    const inquiry = await db.contactInquiry.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        phone: phone ? phone.trim() : null,
        department: (department || 'general').toLowerCase().trim(),
        subject: subject.trim(),
        message: message.trim(),
        status: 'NEW'
      }
    })

    // Send email notifications (non-blocking)
    try {
      const departmentEmails: Record<string, string> = {
        general: 'info@avisionforyourecovery.org',
        programs: 'programs@avisionforyourecovery.org',
        donate: 'development@avisionforyourecovery.org',
        volunteer: 'volunteer@avisionforyourecovery.org',
        press: 'media@avisionforyourecovery.org',
        careers: 'hr@avisionforyourecovery.org'
      }

      const recipientEmail = departmentEmails[department || 'general'] || departmentEmails.general

      await Promise.all([
        // Send to staff
        sendEmail({
          to: recipientEmail,
          subject: `New Contact Form: ${subject}`,
          html: `
            <h2>New Contact Form Submission</h2>
            <p><strong>From:</strong> ${escapeHtml(name)} (${escapeHtml(email)})</p>
            ${phone ? `<p><strong>Phone:</strong> ${escapeHtml(phone)}</p>` : ''}
            <p><strong>Department:</strong> ${escapeHtml(department || 'general')}</p>
            <p><strong>Subject:</strong> ${escapeHtml(subject)}</p>
            <p><strong>Message:</strong></p>
            <p>${escapeHtml(message).replace(/\n/g, '<br>')}</p>
            <hr>
            <p><small>Inquiry ID: ${inquiry.id}</small></p>
          `
        }),
        // Send confirmation to submitter
        sendEmail({
          to: email,
          subject: 'Thank you for contacting A Vision For You',
          html: `
            <h2>Thank you for reaching out</h2>
            <p>Hi ${escapeHtml(name)},</p>
            <p>We've received your message and will respond within 24-48 hours. A member of our team will be in touch soon.</p>
            <p><strong>Your message:</strong></p>
            <p>${escapeHtml(message).replace(/\n/g, '<br>')}</p>
            <hr>
            <p>If you need immediate assistance, please call us at <strong>(502) 749-6344</strong>.</p>
            <p>Warm regards,<br>A Vision For You Team</p>
          `
        })
      ])
    } catch (emailError) {
      // Log but don't fail - inquiry was already saved
      console.error('Email notification failed for contact inquiry:', inquiry.id)
    }

    logApiRequest({
      timestamp: new Date(),
      method: 'POST',
      path: '/api/contact',
      userId: undefined,
      statusCode: 201,
      duration: Date.now() - startTime,
      requestId
    })

    return NextResponse.json({
      success: true,
      message: 'Your message has been received. We\'ll respond within 24 hours.',
      inquiryId: inquiry.id
    }, { status: 201 })
  } catch (error) {
    const errorInfo = handleApiError(error, 'contact', requestId, undefined)

    logApiRequest({
      timestamp: new Date(),
      method: 'POST',
      path: '/api/contact',
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
