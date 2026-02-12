import { NextResponse, NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

/**
 * PHASE 1 API AUTHENTICATION & AUTHORIZATION
 * 
 * Centralized security layer for all API endpoints
 */

/**
 * Role-based access control matrix
 * 
 * ADMIN:
 * - Full access to all admin endpoints
 * - Can create/publish newsletters
 * - Can manage all data
 * 
 * USER:
 * - Can submit admissions
 * - Can donate
 * - Can view own data only
 */

export const ADMIN_ONLY = ['ADMIN'] as const
export const ALL_AUTHENTICATED = ['ADMIN', 'USER'] as const

export type UserRole = 'ADMIN' | 'USER'

/**
 * Check if user has required role
 * 
 * @param userRole - User's current role
 * @param allowedRoles - Array of allowed roles
 * @returns true if user's role is in allowed list
 */
export function hasRole(userRole: string | undefined, allowedRoles: readonly string[]): boolean {
  return !!userRole && allowedRoles.includes(userRole)
}

/**
 * Get authenticated session
 * 
 * @returns Session if authenticated, null otherwise
 */
export async function getSession() {
  if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_BYPASS_AUTH === 'true') {
    return {
      user: {
        id: 'bypass-review',
        name: 'Review Admin',
        email: 'admin@avisionforyou.org',
        role: 'ADMIN'
      },
      expires: '2099-01-01T00:00:00.000Z'
    } as any
  }
  return await getServerSession(authOptions)
}

/**
 * Verify request is from authenticated admin user
 * 
 * Usage in API routes:
 * const session = await requireAdminAuth(req)
 * 
 * @returns Session object if authorized
 * @throws If not authenticated or not admin
 */
export async function requireAdminAuth(req: NextRequest) {
  const session = await getSession()

  if (!session || !session.user) {
    return null
  }

  const userRole = (session.user as any)?.role

  if (!hasRole(userRole, ADMIN_ONLY)) {
    return null
  }

  return session
}


/**
 * Verify request is from authenticated user
 * 
 * @returns Session object if authenticated
 * @throws If not authenticated
 */
export async function requireAuth(req: NextRequest) {
  const session = await getSession()

  if (!session || !session.user) {
    return null
  }

  return session
}

/**
 * Response helpers for consistent API responses
 */

export function successResponse<T>(data: T, status = 200) {
  return NextResponse.json(
    { success: true, data },
    { status }
  )
}

export function errorResponse(message: string, code: string, status = 400, details?: string[]) {
  return NextResponse.json(
    {
      success: false,
      error: message,
      code,
      ...(details && { details }),
    },
    { status }
  )
}

export function unauthorizedResponse() {
  return errorResponse(
    'Unauthorized',
    'UNAUTHORIZED',
    401
  )
}

export function forbiddenResponse() {
  return errorResponse(
    'Forbidden',
    'FORBIDDEN',
    403
  )
}

export function validationErrorResponse(errors: string[]) {
  return errorResponse(
    'Invalid request data',
    'VALIDATION_ERROR',
    400,
    errors
  )
}

export function notFoundResponse() {
  return errorResponse(
    'Not found',
    'NOT_FOUND',
    404
  )
}

export function serverErrorResponse(requestId: string) {
  return errorResponse(
    'Server error. Please contact support.',
    'SERVER_ERROR',
    500
  )
}

/**
 * Rate limit exceeded response
 */
export function rateLimitResponse(retryAfter: number) {
  const response = errorResponse(
    'Too many requests. Please try again later.',
    'RATE_LIMIT_EXCEEDED',
    429
  )
  response.headers.set('Retry-After', retryAfter.toString())
  return response
}
