import { NextRequest, NextResponse } from 'next/server'
import { requireAdminAuth, errorResponse, successResponse } from '@/lib/apiAuth'
import { db } from '@/lib/db'
import { handleApiError, generateRequestId, logApiRequest } from '@/lib/apiErrors'

export const dynamic = 'force-dynamic'

/**
 * GET /api/admin/contact
 * 
 * Fetch all contact inquiries
 * 
 * PHASE 1 HARDENING:
 * - Requires admin authentication (not just checking existence)
 * - Returns paginated results (limit 50)
 * - Fixed boolean logic error from original
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
      db.contactInquiry.findMany({
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limit,
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          department: true,
          subject: true,
          message: true,
          status: true,
          createdAt: true,
          updatedAt: true
        }
      }),
      db.contactInquiry.count()
    ])

    logApiRequest({
      timestamp: new Date(),
      method: 'GET',
      path: '/api/admin/contact',
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
    const errorInfo = handleApiError(error, 'admin/contact', requestId, userId)

    logApiRequest({
      timestamp: new Date(),
      method: 'GET',
      path: '/api/admin/contact',
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
