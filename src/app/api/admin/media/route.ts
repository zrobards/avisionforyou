import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db as prisma } from '@/lib/db'
import { rateLimit, mediaUploadLimiter } from '@/lib/rateLimit'
import { rateLimitResponse, validationErrorResponse } from '@/lib/apiAuth'

const MAX_UPLOAD_BYTES = 10 * 1024 * 1024 // 10MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime']

// GET - Fetch all media
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userRole = session.user.role
    if (userRole !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const media = await prisma.mediaItem.findMany({
      take: 50,
      orderBy: { uploadedAt: 'desc' },
      select: {
        id: true,
        filename: true,
        type: true,
        url: true,
        size: true,
        mimeType: true,
        tags: true,
        usage: true,
        uploadedAt: true,
        uploadedById: true,
        uploadedBy: {
          select: {
            name: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json(media, {
      headers: { 'Cache-Control': 'no-store, max-age=0' }
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch media' }, { status: 500 })
  }
}

// POST - Upload new media
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userRole = session.user.role
    if (userRole !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const rl = await rateLimit(mediaUploadLimiter, session.user.id || 'unknown')
    if (!rl.success) {
      return rateLimitResponse(60)
    }

    const formData = await req.formData()
    const file = formData.get('file') as File
    const tagsRaw = (formData.get('tags') as string) || '[]'
    const usageRaw = (formData.get('usage') as string) || '[]'

    let tags: string[] = []
    let usage: string[] = []
    try {
      tags = JSON.parse(tagsRaw)
      usage = JSON.parse(usageRaw)
    } catch {
      return validationErrorResponse(['Invalid tags or usage format'])
    }

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (file.size > MAX_UPLOAD_BYTES) {
      return NextResponse.json({ error: 'File too large' }, { status: 413 })
    }

    const isImage = ALLOWED_IMAGE_TYPES.includes(file.type)
    const isVideo = ALLOWED_VIDEO_TYPES.includes(file.type)
    if (!isImage && !isVideo) {
      return NextResponse.json({ error: 'Unsupported file type' }, { status: 400 })
    }

    // Get file info
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Determine file type
    const fileType = isImage ? 'image' : isVideo ? 'video' : 'other'

    // For now, we'll store the file info in the database
    // In production, you'd upload to cloud storage (AWS S3, Cloudinary, etc.)
    const base64Data = buffer.toString('base64')
    const dataUrl = `data:${file.type};base64,${base64Data}`

    const mediaItem = await prisma.mediaItem.create({
      data: {
        filename: file.name,
        type: fileType,
        url: dataUrl, // In production, this would be a cloud storage URL
        size: file.size,
        mimeType: file.type,
        tags: tags,
        usage: usage,
        uploadedById: session.user.id
      },
      include: {
        uploadedBy: {
          select: {
            name: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json(mediaItem)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to upload media' }, { status: 500 })
  }
}
