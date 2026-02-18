import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { checkRateLimit } from '@/lib/rateLimit'
import { rateLimitResponse } from '@/lib/apiAuth'
import DOMPurify from 'isomorphic-dompurify'
import fs from 'fs'
import path from 'path'
import { logger } from '@/lib/logger'

const BLOG_POSTS_PATH = path.join(process.cwd(), 'data', 'blog-posts.json')

// GET /api/blog - List all published posts (public) or all posts (admin)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const { searchParams } = new URL(request.url)
    const includesDrafts = searchParams.get('drafts') === 'true'

    // Check if user is admin
    let isAdmin = false
    if (session?.user?.email) {
      const user = await db.user.findUnique({
        where: { email: session.user.email }
      })
      isAdmin = user?.role === 'ADMIN'
    }

    const posts = await db.blogPost.findMany({
      where: includesDrafts && isAdmin ? {} : { status: 'PUBLISHED' },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: { publishedAt: 'desc' },
      take: 50
    })

    return NextResponse.json(posts, {
      headers: {
        'Cache-Control': 'no-store, max-age=0'
      }
    })
  } catch (error: unknown) {
    logger.error({ err: error }, 'Error fetching blog posts')
    if (fs.existsSync(BLOG_POSTS_PATH)) {
      const fallbackPosts = JSON.parse(fs.readFileSync(BLOG_POSTS_PATH, 'utf-8'))
      return NextResponse.json(fallbackPosts, {
        headers: {
          'Cache-Control': 'no-store, max-age=0'
        }
      })
    }
    return NextResponse.json(
      { error: 'Failed to fetch blog posts' },
      { status: 500 }
    )
  }
}

// POST /api/blog - Create new blog post (admin only)
export async function POST(request: NextRequest) {
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

    // Rate limit: 30 per hour per user
    const rl = checkRateLimit(`admin-blog:${user.id}`, 30, 3600)
    if (!rl.allowed) {
      return rateLimitResponse(rl.retryAfter || 60)
    }

    const body = await request.json()
    const { title, excerpt, status, category, tags, imageUrl } = body
    const content = body.content ? DOMPurify.sanitize(body.content) : body.content

    if (!title || !content) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 }
      )
    }

    // Generate slug from title with collision avoidance
    let slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')

    const existingSlug = await db.blogPost.findUnique({ where: { slug } })
    if (existingSlug) {
      slug = `${slug}-${Date.now()}`
    }

    // Calculate read time (rough estimate: 200 words per minute)
    const wordCount = content.split(/\s+/).length
    const readTimeMinutes = Math.ceil(wordCount / 200)

    const post = await db.blogPost.create({
      data: {
        title,
        slug,
        content,
        excerpt: excerpt || content.substring(0, 200) + '...',
        authorId: user.id,
        status: status || 'DRAFT',
        category,
        tags: tags ? JSON.stringify(tags) : null,
        imageUrl,
        readTimeMinutes,
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

    return NextResponse.json(post, { status: 201 })
  } catch (error: unknown) {
    logger.error({ err: error }, 'Error creating blog post')
    return NextResponse.json(
      { error: 'Failed to create blog post' },
      { status: 500 }
    )
  }
}
