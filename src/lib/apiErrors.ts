import { ZodError } from 'zod'
import * as Sentry from '@sentry/nextjs'
import { logger } from '@/lib/logger'

/**
 * PHASE 1 ERROR HANDLING & LOGGING
 * 
 * Centralized error handling with:
 * - No sensitive data leakage
 * - Consistent response format
 * - Server-side logging for debugging
 * - Request IDs for support tracking
 */

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public details?: string[]
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

/**
 * Generate unique request ID for tracking
 */
export function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Log API request (server-side only, no PII)
 * 
 * @param context - Request context information
 */
export function logApiRequest(context: {
  timestamp: Date
  method: string
  path: string
  userId?: string
  statusCode: number
  duration: number
  requestId: string
  error?: string
}) {
  const log = [
    `[${context.timestamp.toISOString()}]`,
    context.method,
    context.path,
    `userId=${context.userId || 'anonymous'}`,
    `status=${context.statusCode}`,
    `duration=${context.duration}ms`,
    `requestId=${context.requestId}`,
    ...(context.error ? [`error=${context.error}`] : [])
  ].join(' ')

  if (context.statusCode >= 500) {
    logger.error({ ...context }, log)
  } else if (context.statusCode >= 400) {
    logger.warn({ ...context }, log)
  } else {
    logger.info({ ...context }, log)
  }
}

/**
 * Handle validation errors from Zod
 */
export function handleValidationError(error: ZodError) {
  const errors = error.errors.map(err => {
    const path = err.path.join('.')
    return `${path}: ${err.message}`
  })

  return {
    statusCode: 400,
    code: 'VALIDATION_ERROR',
    message: 'Invalid request data',
    details: errors
  }
}

/**
 * Handle general API errors
 * 
 * Usage in API routes:
 * try {
 *   // ... your code
 * } catch (error) {
 *   return handleApiError(error, 'social-stats')
 * }
 */
export function handleApiError(
  error: unknown,
  context: string,
  requestId: string,
  userId?: string
) {
  const timestamp = new Date()

  // Handle validation errors
  if (error instanceof ZodError) {
    const result = handleValidationError(error)
    logApiRequest({
      timestamp,
      method: 'POST',
      path: `/api/${context}`,
      userId,
      statusCode: result.statusCode,
      duration: 0,
      requestId,
      error: 'VALIDATION_ERROR'
    })
    return {
      statusCode: result.statusCode,
      code: result.code,
      message: result.message,
      details: result.details
    }
  }

  // Handle custom API errors
  if (error instanceof ApiError) {
    logApiRequest({
      timestamp,
      method: 'POST',
      path: `/api/${context}`,
      userId,
      statusCode: error.statusCode,
      duration: 0,
      requestId,
      error: error.code
    })
    return {
      statusCode: error.statusCode,
      code: error.code,
      message: error.message,
      details: error.details
    }
  }

  // Handle database errors (don't expose details)
  if (error instanceof Error) {
    const isDatabaseError = error.message.includes('Prisma') || error.message.includes('database')

    // Log full error server-side
    logger.error({ err: error, requestId, userId, context }, `Unhandled error in ${context}`)

    // Report 500-level errors to Sentry
    Sentry.captureException(error, {
      tags: { context, requestId },
      extra: { userId },
    })

    return {
      statusCode: 500,
      code: 'SERVER_ERROR',
      message: isDatabaseError
        ? 'Failed to save changes. Please try again.'
        : 'An error occurred. Please try again.',
      details: undefined
    }
  }

  // Handle unknown errors
  logger.error({ error, requestId, userId, context }, `Unknown error in ${context}`)

  // Report unknown 500-level errors to Sentry
  Sentry.captureException(error, {
    tags: { context, requestId },
    extra: { userId },
  })

  return {
    statusCode: 500,
    code: 'SERVER_ERROR',
    message: 'An unexpected error occurred. Please contact support.',
    details: undefined
  }
}

