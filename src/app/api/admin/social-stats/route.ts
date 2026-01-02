import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { revalidatePath } from 'next/cache'

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

    const body = await request.json()
    const { facebook, instagram, twitter, linkedin, tiktok } = body

    // Validate that all values are provided and are valid numbers
    const values = { facebook, instagram, twitter, linkedin, tiktok }
    const errors: string[] = []

    for (const [platform, value] of Object.entries(values)) {
      if (value === undefined || value === null || value === '') {
        errors.push(`${platform} is required`)
      } else {
        const numValue = parseInt(String(value), 10)
        if (isNaN(numValue) || numValue < 0) {
          errors.push(`${platform} must be a valid positive number`)
        }
      }
    }

    if (errors.length > 0) {
      return NextResponse.json(
        { error: 'Validation failed', details: errors },
        { status: 400 }
      )
    }

    // Store each platform's stats in the database
    const platforms = [
      { platform: 'facebook', followers: parseInt(String(facebook), 10), url: 'https://www.facebook.com/avisionforyourecovery', handle: '@AVisionForYouRecovery' },
      { platform: 'instagram', followers: parseInt(String(instagram), 10), url: 'https://www.instagram.com/avision_foryourecovery/', handle: '@avisionforyourecovery' },
      { platform: 'twitter', followers: parseInt(String(twitter), 10), url: 'https://twitter.com/search?q=avisionforyourecovery', handle: '@AVFYRecovery' },
      { platform: 'linkedin', followers: parseInt(String(linkedin), 10), url: 'https://www.linkedin.com/company/a-vision-for-you-inc-addiction-recovery-program/', handle: 'A Vision For You Recovery' },
      { platform: 'tiktok', followers: parseInt(String(tiktok), 10), url: 'https://www.tiktok.com/@avisionforyourecovery?_r=1&_t=ZP-92h34Bcel0Y', handle: '@avisionforyourecovery' }
    ]

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

    return NextResponse.json({
      success: true,
      message: 'Social stats updated successfully'
    })
  } catch (error) {
    console.error('Error updating social stats:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: 'Failed to update social stats', details: errorMessage },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    // Fetch all social stats from database
    const stats = await db.socialStats.findMany({
      orderBy: { platform: 'asc' }
    })

    // Convert to object format for easier access
    const statsObj = stats.reduce((acc, stat) => {
      acc[stat.platform] = stat.followers.toString()
      return acc
    }, {} as Record<string, string>)

    // Return with defaults if no data exists
    return NextResponse.json({
      facebook: statsObj.facebook || '869',
      instagram: statsObj.instagram || '112',
      twitter: statsObj.twitter || '70',
      linkedin: statsObj.linkedin || '23',
      tiktok: statsObj.tiktok || '41'
    })
  } catch (error) {
    console.error('Error fetching social stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch social stats' },
      { status: 500 }
    )
  }
}
