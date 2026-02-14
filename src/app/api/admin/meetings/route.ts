import { db } from "@/lib/db"
import { NextRequest, NextResponse } from "next/server"
import { requireAdminAuth, errorResponse, validationErrorResponse, successResponse } from '@/lib/apiAuth'
import { MeetingSchema, validateRequest, getValidationErrors } from '@/lib/validation'
import { handleApiError, generateRequestId, logApiRequest } from '@/lib/apiErrors'
import { ZodError } from 'zod'

/**
 * GET /api/admin/meetings
 * 
 * Fetch all meetings with RSVPs for admin view
 * 
 * PHASE 1 HARDENING:
 * - Requires admin authentication
 * - Returns paginated results (limit 100)
 * - No sensitive user data exposed
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

    const userId = session.user?.id

    // Parse pagination parameters
    const page = Math.max(1, parseInt(request.nextUrl.searchParams.get('page') || '1', 10))
    const limit = Math.min(100, Math.max(1, parseInt(request.nextUrl.searchParams.get('limit') || '100', 10)))
    const skip = (page - 1) * limit

    // Get all meetings with RSVPs for admin view
    const [meetings, total] = await Promise.all([
      db.programSession.findMany({
        include: {
          program: true,
          rsvps: {
            include: {
              user: { 
                select: { 
                  id: true, 
                  name: true
                } 
              }
            }
          }
        },
        orderBy: { startDate: "asc" },
        skip,
        take: limit
      }),
      db.programSession.count()
    ])

    // Format for frontend
    const formattedMeetings = meetings.map(meeting => ({
      id: meeting.id,
      title: meeting.title,
      description: meeting.description,
      startDate: meeting.startDate,
      endDate: meeting.endDate,
      startTime: meeting.startDate,
      endTime: meeting.endDate,
      format: meeting.format,
      location: meeting.location,
      link: meeting.link,
      capacity: meeting.capacity,
      program: meeting.program,
      rsvps: meeting.rsvps.map(rsvp => ({
        id: rsvp.id,
        user: rsvp.user,
        status: rsvp.status
      })),
      _count: {
        rsvps: meeting.rsvps.length
      }
    }))

    logApiRequest({
      timestamp: new Date(),
      method: 'GET',
      path: '/api/admin/meetings',
      userId,
      statusCode: 200,
      duration: Date.now() - startTime,
      requestId
    })

    return successResponse({
      data: formattedMeetings,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    const userId = (await requireAdminAuth(request))?.user?.id as string | undefined
    const errorInfo = handleApiError(error, 'admin/meetings', requestId, userId)

    logApiRequest({
      timestamp: new Date(),
      method: 'GET',
      path: '/api/admin/meetings',
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
 * POST /api/admin/meetings
 * 
 * Create new meeting
 * 
 * PHASE 1 HARDENING:
 * - Requires admin authentication
 * - Validates all inputs with Zod
 * - Validates date ordering (end after start)
 * - Validates location/link based on format
 * - No sensitive data in responses
 */
export async function POST(request: NextRequest) {
  const requestId = generateRequestId()
  const startTime = Date.now()

  try {
    // Require admin authentication
    const session = await requireAdminAuth(request)
    if (!session) {
      return errorResponse('Unauthorized', 'UNAUTHORIZED', 401)
    }

    const userId = session.user?.id

    // Validate request body with Zod
    let validatedData
    try {
      validatedData = await validateRequest(request, MeetingSchema)
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = getValidationErrors(error)
        logApiRequest({
          timestamp: new Date(),
          method: 'POST',
          path: '/api/admin/meetings',
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

    // Create or get default program
    let program = await db.program.findFirst({
      where: { slug: "mindbodysoul-iop" }
    })

    if (!program) {
      program = await db.program.create({
        data: {
          name: "MindBodySoul IOP",
          slug: "mindbodysoul-iop",
          description: "Recovery program",
          programType: "IOP"
        }
      })
    }

    // Create meeting
    const meeting = await db.programSession.create({
      data: {
        title: validatedData.title,
        description: validatedData.description || "",
        programId: program.id,
        startDate: validatedData.startTime,
        endDate: validatedData.endTime,
        format: validatedData.format,
        location: validatedData.format === "IN_PERSON" ? validatedData.location : null,
        link: validatedData.format !== "IN_PERSON" ? validatedData.link : null,
        capacity: validatedData.capacity || null
      },
      include: {
        program: true,
        rsvps: {
          include: {
            user: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      }
    })

    logApiRequest({
      timestamp: new Date(),
      method: 'POST',
      path: '/api/admin/meetings',
      userId,
      statusCode: 201,
      duration: Date.now() - startTime,
      requestId
    })

    return NextResponse.json(
      {
        success: true,
        data: meeting
      },
      { status: 201 }
    )
  } catch (error) {
    const userId = (await requireAdminAuth(request))?.user?.id as string | undefined
    const errorInfo = handleApiError(error, 'admin/meetings', requestId, userId)

    logApiRequest({
      timestamp: new Date(),
      method: 'POST',
      path: '/api/admin/meetings',
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
