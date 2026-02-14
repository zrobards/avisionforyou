import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { logger } from '@/lib/logger'

// This endpoint creates the social_stats table if it doesn't exist
// Only accessible to admins
export async function POST(request: NextRequest) {
  try {
    // Check if user is authenticated and is admin
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const user = await db.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    // Try to create the table using raw SQL
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

      // Try to seed initial data if table is empty
      const existingStats = await db.$queryRawUnsafe(`
        SELECT COUNT(*) as count FROM "social_stats";
      `) as Array<{ count: bigint }>

      if (existingStats[0]?.count === 0n) {
        await db.$executeRawUnsafe(`
          INSERT INTO "social_stats" ("id", "platform", "followers", "handle", "url", "updatedAt", "createdAt")
          VALUES
            (gen_random_uuid()::text, 'facebook', 869, '@AVisionForYouRecovery', 'https://www.facebook.com/avisionforyourecovery', NOW(), NOW()),
            (gen_random_uuid()::text, 'instagram', 112, '@avisionforyourecovery', 'https://www.instagram.com/avision_foryourecovery/', NOW(), NOW()),
            (gen_random_uuid()::text, 'linkedin', 23, 'A Vision For You', 'https://www.linkedin.com/company/a-vision-for-you-inc-addiction-recovery-program/', NOW(), NOW()),
            (gen_random_uuid()::text, 'tiktok', 41, '@avisionforyourecovery', 'https://www.tiktok.com/@avisionforyourecovery', NOW(), NOW())
          ON CONFLICT ("platform") DO NOTHING;
        `)
      }

      return NextResponse.json({
        success: true,
        message: 'Social stats table created and initialized successfully'
      })
    } catch (sqlError: unknown) {
      // If table already exists, that's fine
      const err = sqlError as { message?: string; code?: string }
      if (err?.message?.includes('already exists') || err?.code === '42P07') {
        return NextResponse.json({
          success: true,
          message: 'Table already exists'
        })
      }
      throw sqlError
    }
  } catch (error) {
    logger.error({ err: error }, 'Error initializing social stats table')
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: 'Failed to initialize social stats table' },
      { status: 500 }
    )
  }
}

