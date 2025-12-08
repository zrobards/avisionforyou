import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

// GET /api/blog/[slug] - Get single post by slug
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const post = await db.blogPost.findUnique({
      where: { slug: params.slug },
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

    // Increment view count
    await db.blogPost.update({
      where: { id: post.id },
      data: { views: { increment: 1 } }
    })

    return NextResponse.json(post)
  } catch (error) {
    console.error('Error fetching blog post:', error)
    return NextResponse.json(
      { error: 'Failed to fetch blog post' },
      { status: 500 }
    )
  }
}

// PATCH /api/blog/[slug] - Update post (admin only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const user = await db.user.findUnique({
      where: { email: session.user.email }
    })

    if (user?.role !== 'ADMIN' && user?.role !== 'STAFF') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin only' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { title, content, excerpt, status, category, tags, imageUrl } = body

    // If title changed, update slug
    let updateData: any = {
      content,
      excerpt,
      status,
      category,
      tags: tags ? JSON.stringify(tags) : null,
      imageUrl
    }

    if (title) {
      updateData.title = title
      updateData.slug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
    }

    if (content) {
      const wordCount = content.split(/\s+/).length
      updateData.readTimeMinutes = Math.ceil(wordCount / 200)
    }

    // Set publishedAt if status changed to PUBLISHED
    if (status === 'PUBLISHED') {
      const existingPost = await db.blogPost.findUnique({
        where: { slug: params.slug }
      })
      if (existingPost && !existingPost.publishedAt) {
        updateData.publishedAt = new Date()
      }
    }

    const post = await db.blogPost.update({
      where: { slug: params.slug },
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
    console.error('Error updating blog post:', error)
    return NextResponse.json(
      { error: 'Failed to update blog post' },
      { status: 500 }
    )
  }
}

// DELETE /api/blog/[slug] - Delete post (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const user = await db.user.findUnique({
      where: { email: session.user.email }
    })

    if (user?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin only' },
        { status: 403 }
      )
    }

    await db.blogPost.delete({
      where: { slug: params.slug }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting blog post:', error)
    return NextResponse.json(
      { error: 'Failed to delete blog post' },
      { status: 500 }
    )
  }
}
