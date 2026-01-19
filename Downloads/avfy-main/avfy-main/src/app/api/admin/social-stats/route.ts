import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { db } from '@/lib/db'
import { requireAdminAuth, requireAdminOrStaffAuth, errorResponse, validationErrorResponse, successResponse } from '@/lib/apiAuth'
import { SocialStatsSchema, validateRequest, getValidationErrors } from '@/lib/validation'
import { handleApiError, generateRequestId, logApiRequest } from '@/lib/apiErrors'
import { ZodError } from 'zod'

// Note: apiAuth.ts now correctly imports authOptions from @/lib/auth instead of the route file

/**
 * POST /api/admin/social-stats
 * 
 * Update social media follower counts
 * 
 * PHASE 1 HARDENING:
 * - Requires admin authentication
 * - Validates all inputs with Zod
 * - Stores as integers in database
 * - Returns numbers (not strings)
 * - No sensitive data in error messages
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

    const userId = (session.user as any)?.id

    // Validate request body with Zod
    let validatedData
    try {
      validatedData = await validateRequest(request, SocialStatsSchema)
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = getValidationErrors(error)
        logApiRequest({
          timestamp: new Date(),
          method: 'POST',
          path: '/api/admin/social-stats',
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

    // Store each platform's stats in the database (as integers)
    const platforms = [
      { platform: 'facebook', followers: validatedData.facebook, url: 'https://www.facebook.com/avisionforyourecovery', handle: '@AVisionForYouRecovery' },
      { platform: 'instagram', followers: validatedData.instagram, url: 'https://www.instagram.com/avision_foryourecovery/', handle: '@avisionforyourecovery' },
      { platform: 'twitter', followers: validatedData.twitter, url: 'https://twitter.com/search?q=avisionforyourecovery', handle: '@AVFYRecovery' },
      { platform: 'linkedin', followers: validatedData.linkedin, url: 'https://www.linkedin.com/company/a-vision-for-you-inc-addiction-recovery-program/', handle: 'A Vision For You' },
      { platform: 'tiktok', followers: validatedData.tiktok, url: 'https://www.tiktok.com/@avisionforyourecovery?_r=1&_t=ZP-92h34Bcel0Y', handle: '@avisionforyourecovery' }
    ]

    // Check if table exists, create it if not
    try {
      await db.socialStats.findFirst()
    } catch (error: any) {
      // Table doesn't exist, create it
      if (error?.message?.includes('does not exist') || error?.code === '42P01') {
        console.log('Creating social_stats table...')
        try {
          await db.$executeRawUnsafe(`
            CREATE TABLE IF NOT EXISTS "social_stats" (
              "id" TEXT NOT NULL,
              "platform" TEXT NOT NULL,
              "followers" INTEGER NOT NULL DEFAULT 0,
              "handle" TEXT,
              "url" TEXT,
              "updatedAt" TIMESTAMP(3) NOT NULL,
              "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
              CONSTRAINT "social_stats_pkey" PRIMARY KEY ("id")
            );
          `)

          await db.$executeRawUnsafe(`
            CREATE UNIQUE INDEX IF NOT EXISTS "social_stats_platform_key" 
            ON "social_stats"("platform");
          `)
          console.log('Table created successfully')
        } catch (createError) {
          console.error('Error creating table:', createError)
          // Continue anyway, might already exist
        }
      } else {
        throw error
      }
    }

    // Upsert each platform's stats
    for (const data of platforms) {
      await db.socialStats.upsert({
        where: { platform: data.platform },
        update: { followers: data.followers },
        create: data
      })
    }

    // Revalidate all pages that use social stats
    revalidatePath('/', 'layout')
    revalidatePath('/social')
    revalidatePath('/api/public/social-stats')

    logApiRequest({
      timestamp: new Date(),
      method: 'POST',
      path: '/api/admin/social-stats',
      userId,
      statusCode: 200,
      duration: Date.now() - startTime,
      requestId
    })

    return successResponse({
      facebook: validatedData.facebook,
      instagram: validatedData.instagram,
      twitter: validatedData.twitter,
      linkedin: validatedData.linkedin,
      tiktok: validatedData.tiktok
    })
  } catch (error) {
    const userId = (await requireAdminAuth(request))?.user?.id as string | undefined
    const errorInfo = handleApiError(error, 'admin/social-stats', requestId, userId)
    
    logApiRequest({
      timestamp: new Date(),
      method: 'POST',
      path: '/api/admin/social-stats',
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
 * GET /api/admin/social-stats
 * 
 * Fetch current social media follower counts
 * 
 * Returns numbers (not strings) for type safety
 */
export async function GET(request: NextRequest) {
  const requestId = generateRequestId()
  const startTime = Date.now()

  try {
    // Require admin or staff authentication for read access
    const session = await requireAdminOrStaffAuth(request)
    if (!session) {
      return errorResponse('Unauthorized', 'UNAUTHORIZED', 401)
    }

    const userId = (session.user as any)?.id

    // Fetch all social stats from database
    let stats
    try {
      stats = await db.socialStats.findMany({
        orderBy: { platform: 'asc' }
      })
    } catch (error: any) {
      // If table doesn't exist, return hardcoded defaults
      if (error?.message?.includes('does not exist') || error?.code === '42P01') {
        logApiRequest({
          timestamp: new Date(),
          method: 'GET',
          path: '/api/admin/social-stats',
          userId,
          statusCode: 200,
          duration: Date.now() - startTime,
          requestId
        })
        
        return successResponse({
          facebook: 869,
          instagram: 112,
          twitter: 70,
          linkedin: 23,
          tiktok: 41
        })
      }
      throw error
    }

    // Convert database records to response object with numbers (not strings)
    const statsObj: Record<string, number> = {
      facebook: 869,
      instagram: 112,
      twitter: 70,
      linkedin: 23,
      tiktok: 41
    }

    // Override with actual data from database if it exists
    for (const stat of stats) {
      statsObj[stat.platform] = stat.followers
    }

    logApiRequest({
      timestamp: new Date(),
      method: 'GET',
      path: '/api/admin/social-stats',
      userId,
      statusCode: 200,
      duration: Date.now() - startTime,
      requestId
    })

    return successResponse({
      facebook: statsObj.facebook,
      instagram: statsObj.instagram,
      twitter: statsObj.twitter,
      linkedin: statsObj.linkedin,
      tiktok: statsObj.tiktok
    })
  } catch (error) {
    const userId = (await requireAdminOrStaffAuth(request))?.user?.id as string | undefined
    const errorInfo = handleApiError(error, 'admin/social-stats', requestId, userId)

    logApiRequest({
      timestamp: new Date(),
      method: 'GET',
      path: '/api/admin/social-stats',
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
