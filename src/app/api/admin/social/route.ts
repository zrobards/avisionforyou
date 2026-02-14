import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { v4 as uuidv4 } from 'uuid'
import { logger } from '@/lib/logger'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const description = formData.get('description') as string
    const platformsStr = formData.get('platforms') as string
    const scheduledFor = formData.get('scheduledFor') as string
    const file = formData.get('file') as File | null

    if (!description) {
      return NextResponse.json(
        { error: 'Description is required' },
        { status: 400 }
      )
    }

    const platforms = JSON.parse(platformsStr)
    if (!platforms || platforms.length === 0) {
      return NextResponse.json(
        { error: 'At least one platform must be selected' },
        { status: 400 }
      )
    }

    let videoUrl: string | null = null

    // Handle file upload if provided
    if (file) {
      const buffer = await file.arrayBuffer()
      const fileName = `social-media/${uuidv4()}-${file.name}`
      
      // In production, upload to cloud storage (S3, Cloudinary, etc.)
      // For now, we'll store metadata and the file buffer separately
      videoUrl = fileName
    }

    // Determine status based on scheduled time
    const status = scheduledFor && new Date(scheduledFor) > new Date() ? 'scheduled' : 'posted'

    // Create post in database
    const post = await db.socialMediaPost.create({
      data: {
        description,
        platforms,
        videoUrl,
        scheduledFor: scheduledFor ? new Date(scheduledFor) : null,
        status,
      },
    })

    return NextResponse.json(post)
  } catch (error) {
    logger.error({ err: error }, 'Error creating social media post')
    return NextResponse.json(
      { error: 'Failed to create post' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const posts = await db.socialMediaPost.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
    })

    return NextResponse.json(posts)
  } catch (error) {
    logger.error({ err: error }, 'Error fetching posts')
    return NextResponse.json(
      { error: 'Failed to fetch posts' },
      { status: 500 }
    )
  }
}
