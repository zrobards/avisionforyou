import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/apiAuth'
import { logger } from '@/lib/logger'

// Lazy-load DOMPurify to avoid crashes if jsdom isn't available on serverless
let sanitize: (html: string) => string
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const DOMPurify = require('isomorphic-dompurify')
  sanitize = (html: string) => DOMPurify.sanitize(html)
} catch {
  sanitize = (html: string) =>
    html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
}

// GET /api/blog/[slug] - Get single post by slug
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  try {
    const post = await db.blogPost.findUnique({
      where: { slug },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        }
      }
    })

    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      )
    }

    // Increment view count (fire-and-forget)
    db.blogPost.update({
      where: { id: post.id },
      data: { views: { increment: 1 } }
    }).catch(() => {})

    return NextResponse.json(post)
  } catch (error) {
    logger.error({ err: error }, 'Error fetching blog post')
    return NextResponse.json(
      { error: 'Failed to fetch blog post' },
      { status: 500 }
    )
  }
}

// PATCH /api/blog/[slug] - Update post (admin only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const session = await getSession()

    if (!session || !session.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const user = await db.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user || (user.role !== 'ADMIN' && session.user?.role !== 'ADMIN')) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin only' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { title, excerpt, status, category, tags, imageUrl } = body
    const content = body.content ? sanitize(body.content) : body.content

    // If title changed, update slug
    const updateData: Record<string, unknown> = {
      content,
      excerpt,
      status,
      category,
      tags: tags ? JSON.stringify(tags) : null,
      imageUrl
    }

    if (title) {
      updateData.title = title
      let newSlug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
      // Check for slug collision with a different post
      const post = await db.blogPost.findUnique({ where: { slug } })
      const existingWithSlug = await db.blogPost.findUnique({ where: { slug: newSlug } })
      if (existingWithSlug && post && existingWithSlug.id !== post.id) {
        newSlug = `${newSlug}-${Date.now()}`
      }
      updateData.slug = newSlug
    }

    if (content) {
      const wordCount = content.split(/\s+/).length
      updateData.readTimeMinutes = Math.ceil(wordCount / 200)
    }

    // Set publishedAt if status changed to PUBLISHED
    if (status === 'PUBLISHED') {
      const existingPost = await db.blogPost.findUnique({
        where: { slug }
      })
      if (existingPost && !existingPost.publishedAt) {
        updateData.publishedAt = new Date()
      }
    }

    const post = await db.blogPost.update({
      where: { slug },
      data: updateData,
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

    return NextResponse.json(post)
  } catch (error) {
    logger.error({ err: error }, 'Error updating blog post')
    return NextResponse.json(
      { error: 'Failed to update blog post' },
      { status: 500 }
    )
  }
}

// DELETE /api/blog/[slug] - Delete post (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const session = await getSession()

    if (!session || !session.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const user = await db.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user || (user.role !== 'ADMIN' && session.user?.role !== 'ADMIN')) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin only' },
        { status: 403 }
      )
    }

    await db.blogPost.delete({
      where: { slug }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error({ err: error }, 'Error deleting blog post')
    return NextResponse.json(
      { error: 'Failed to delete blog post' },
      { status: 500 }
    )
  }
}
