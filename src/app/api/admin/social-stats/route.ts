import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

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

    const { facebook, instagram, twitter, linkedin, tiktok } = await request.json()

    // Store in a settings table or use environment variables
    // For now, we'll just return success - the stats are stored in memory on the client
    // In a production app, you'd want to store these in the database

    console.log('Social stats updated:', { facebook, instagram, twitter, linkedin, tiktok })

    return NextResponse.json({
      success: true,
      message: 'Social stats updated successfully'
    })
  } catch (error) {
    console.error('Error updating social stats:', error)
    return NextResponse.json(
      { error: 'Failed to update social stats' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    // Return current stats from environment or database
    // For now, return a default response
    return NextResponse.json({
      facebook: process.env.SOCIAL_FACEBOOK || '869',
      instagram: process.env.SOCIAL_INSTAGRAM || '112',
      twitter: process.env.SOCIAL_TWITTER || '70',
      linkedin: process.env.SOCIAL_LINKEDIN || '23',
      tiktok: process.env.SOCIAL_TIKTOK || '41'
    })
  } catch (error) {
    console.error('Error fetching social stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch social stats' },
      { status: 500 }
    )
  }
}
