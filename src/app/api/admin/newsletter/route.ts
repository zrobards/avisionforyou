import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { db as prisma } from '@/lib/db'
import { requireAdminAuth, errorResponse, validationErrorResponse, successResponse } from '@/lib/apiAuth'
import { NewsletterSchema, validateRequest, getValidationErrors } from '@/lib/validation'
import { handleApiError, generateRequestId, logApiRequest } from '@/lib/apiErrors'
import { ZodError } from 'zod'

/**
 * GET /api/admin/newsletter
 * 
 * Fetch all newsletters with pagination
 * 
 * PHASE 1 HARDENING:
 * - Requires admin authentication
 * - Returns paginated results (limit 50)
 * - No PII exposed
 */
export async function GET(req: NextRequest) {
  const requestId = generateRequestId()
  const startTime = Date.now()

  try {
    // Require admin authentication
    const session = await requireAdminAuth(req)
    if (!session) {
      return errorResponse('Unauthorized', 'UNAUTHORIZED', 401)
    }

    const userId = (session.user as any)?.id

    // Parse pagination parameters
    const page = Math.max(1, parseInt(req.nextUrl.searchParams.get('page') || '1', 10))
    const limit = Math.min(50, Math.max(1, parseInt(req.nextUrl.searchParams.get('limit') || '50', 10)))
    const skip = (page - 1) * limit

    // Fetch newsletters with pagination
    const [newsletters, total] = await Promise.all([
      prisma.newsletter.findMany({
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      }),
      prisma.newsletter.count()
    ])

    logApiRequest({
      timestamp: new Date(),
      method: 'GET',
      path: '/api/admin/newsletter',
      userId,
      statusCode: 200,
      duration: Date.now() - startTime,
      requestId
    })

    return successResponse({
      data: newsletters,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    const userId = (await requireAdminAuth(req))?.user?.id as string | undefined
    const errorInfo = handleApiError(error, 'admin/newsletter', requestId, userId)

    logApiRequest({
      timestamp: new Date(),
      method: 'GET',
      path: '/api/admin/newsletter',
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

/**
 * POST /api/admin/newsletter
 * 
 * Create new newsletter
 * 
 * PHASE 1 HARDENING:
 * - Requires admin authentication
 * - Validates all inputs with Zod
 * - ADMIN role can create any status
 * - No sensitive data in responses
 */
export async function POST(req: NextRequest) {
  const requestId = generateRequestId()
  const startTime = Date.now()

  try {
    // Require admin authentication
    const session = await requireAdminAuth(req)
    if (!session) {
      return errorResponse('Unauthorized', 'UNAUTHORIZED', 401)
    }

    const userId = (session.user as any)?.id

    // Validate request body with Zod
    let validatedData
    try {
      validatedData = await validateRequest(req, NewsletterSchema)
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = getValidationErrors(error)
        logApiRequest({
          timestamp: new Date(),
          method: 'POST',
          path: '/api/admin/newsletter',
          userId,
          statusCode: 400,
          duration: Date.now() - startTime,
          requestId,
          error: 'VALIDATION_ERROR'
        })
        return validationErrorResponse(errors)
      }
      throw error
    }

    let status = validatedData.status || 'DRAFT'

    // Generate slug from title with timestamp for uniqueness
    const baseSlug = validatedData.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
    const slug = `${baseSlug}-${Date.now()}`

    // Create newsletter
    const newsletter = await prisma.newsletter.create({
      data: {
        title: validatedData.title,
        slug,
        content: validatedData.content,
        excerpt: validatedData.excerpt,
        imageUrl: null, // Field not in schema for Phase 1
        status,
        authorId: userId,
        publishedAt: status === 'PUBLISHED' ? new Date() : null
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    // Revalidate pages to show new newsletter instantly
    revalidatePath('/newsletter')
    revalidatePath('/admin/newsletter')
    if (status === 'PUBLISHED') {
      revalidatePath('/api/public/newsletter')
    }

    logApiRequest({
      timestamp: new Date(),
      method: 'POST',
      path: '/api/admin/newsletter',
      userId,
      statusCode: 201,
      duration: Date.now() - startTime,
      requestId
    })

    return NextResponse.json(
      {
        success: true,
        data: newsletter
      },
      { status: 201 }
    )
  } catch (error) {
    const userId = (await requireAdminAuth(req))?.user?.id as string | undefined
    const errorInfo = handleApiError(error, 'admin/newsletter', requestId, userId)

    logApiRequest({
      timestamp: new Date(),
      method: 'POST',
      path: '/api/admin/newsletter',
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
