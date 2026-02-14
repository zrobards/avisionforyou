import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock dependencies before importing the route handler
vi.mock('@/lib/db', () => ({
  db: {
    blogPost: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
    },
    user: {
      findUnique: vi.fn(),
    },
  },
}))

vi.mock('next-auth', () => ({
  getServerSession: vi.fn(),
}))

vi.mock('@/lib/auth', () => ({
  authOptions: {},
}))

vi.mock('@/lib/rateLimit', () => ({
  checkRateLimit: vi.fn().mockReturnValue({ allowed: true }),
}))

vi.mock('@/lib/apiAuth', () => ({
  rateLimitResponse: vi.fn(),
}))

vi.mock('fs', () => ({
  default: {
    existsSync: vi.fn().mockReturnValue(false),
    readFileSync: vi.fn(),
  },
  existsSync: vi.fn().mockReturnValue(false),
  readFileSync: vi.fn(),
}))

import { GET, POST } from '@/app/api/blog/route'
import { db } from '@/lib/db'
import { getServerSession } from 'next-auth'

describe('GET /api/blog', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return published blog posts for unauthenticated users', async () => {
    const mockPosts = [
      {
        id: 'post-1',
        title: 'Recovery Success Story',
        slug: 'recovery-success-story',
        content: 'A story about recovery...',
        excerpt: 'A story about recovery...',
        status: 'PUBLISHED',
        publishedAt: new Date('2024-01-15'),
        author: { id: 'user-1', name: 'Admin', email: 'admin@avfy.org' },
      },
      {
        id: 'post-2',
        title: 'New Program Launch',
        slug: 'new-program-launch',
        content: 'We are launching a new program...',
        excerpt: 'We are launching...',
        status: 'PUBLISHED',
        publishedAt: new Date('2024-02-01'),
        author: { id: 'user-1', name: 'Admin', email: 'admin@avfy.org' },
      },
    ]

    vi.mocked(getServerSession).mockResolvedValue(null)
    vi.mocked(db.blogPost.findMany).mockResolvedValue(mockPosts as any)

    const request = new Request('http://localhost:3000/api/blog', {
      method: 'GET',
    })

    const response = await GET(request as any)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toHaveLength(2)
    expect(data[0].title).toBe('Recovery Success Story')

    // Should only query published posts
    expect(db.blogPost.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { status: 'PUBLISHED' },
      })
    )
  })

  it('should return all posts (including drafts) for admin users requesting drafts', async () => {
    const mockPosts = [
      {
        id: 'post-1',
        title: 'Published Post',
        status: 'PUBLISHED',
        publishedAt: new Date('2024-01-15'),
        author: { id: 'user-1', name: 'Admin', email: 'admin@avfy.org' },
      },
      {
        id: 'post-2',
        title: 'Draft Post',
        status: 'DRAFT',
        publishedAt: null,
        author: { id: 'user-1', name: 'Admin', email: 'admin@avfy.org' },
      },
    ]

    vi.mocked(getServerSession).mockResolvedValue({
      user: { email: 'admin@avfy.org', name: 'Admin' },
      expires: '2099-01-01',
    } as any)

    vi.mocked(db.user.findUnique).mockResolvedValue({
      id: 'user-1',
      email: 'admin@avfy.org',
      role: 'ADMIN',
    } as any)

    vi.mocked(db.blogPost.findMany).mockResolvedValue(mockPosts as any)

    const request = new Request('http://localhost:3000/api/blog?drafts=true', {
      method: 'GET',
    })

    const response = await GET(request as any)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toHaveLength(2)

    // Should query without status filter for admin with drafts=true
    expect(db.blogPost.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {},
      })
    )
  })
})

describe('POST /api/blog', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should reject unauthenticated requests with 401', async () => {
    vi.mocked(getServerSession).mockResolvedValue(null)

    const request = new Request('http://localhost:3000/api/blog', {
      method: 'POST',
      body: JSON.stringify({
        title: 'Test Post',
        content: 'Some content here.',
      }),
      headers: { 'Content-Type': 'application/json' },
    })

    const response = await POST(request as any)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.error).toBe('Unauthorized')
  })

  it('should reject non-admin users with 403', async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { email: 'user@example.com', name: 'Regular User' },
      expires: '2099-01-01',
    } as any)

    vi.mocked(db.user.findUnique).mockResolvedValue({
      id: 'user-2',
      email: 'user@example.com',
      role: 'USER',
    } as any)

    const request = new Request('http://localhost:3000/api/blog', {
      method: 'POST',
      body: JSON.stringify({
        title: 'Test Post',
        content: 'Some content here.',
      }),
      headers: { 'Content-Type': 'application/json' },
    })

    const response = await POST(request as any)
    const data = await response.json()

    expect(response.status).toBe(403)
    expect(data.error).toBe('Unauthorized - Admin only')
  })

  it('should reject posts missing title or content with 400', async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { email: 'admin@avfy.org', name: 'Admin' },
      expires: '2099-01-01',
    } as any)

    vi.mocked(db.user.findUnique).mockResolvedValue({
      id: 'user-1',
      email: 'admin@avfy.org',
      role: 'ADMIN',
    } as any)

    // No slug collision
    vi.mocked(db.blogPost.findUnique).mockResolvedValue(null)

    const request = new Request('http://localhost:3000/api/blog', {
      method: 'POST',
      body: JSON.stringify({
        title: '',
        content: '',
      }),
      headers: { 'Content-Type': 'application/json' },
    })

    const response = await POST(request as any)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Title and content are required')
  })

  it('should successfully create a blog post as admin', async () => {
    const mockCreatedPost = {
      id: 'post-new',
      title: 'Community Update: Spring 2024',
      slug: 'community-update-spring-2024',
      content: 'We are excited to share several updates about our community programs and upcoming events this spring season.',
      excerpt: 'We are excited to share several updates...',
      authorId: 'user-1',
      status: 'PUBLISHED',
      category: 'community',
      tags: '["update","spring"]',
      imageUrl: null,
      readTimeMinutes: 1,
      publishedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
      author: { id: 'user-1', name: 'Admin', email: 'admin@avfy.org' },
    }

    vi.mocked(getServerSession).mockResolvedValue({
      user: { email: 'admin@avfy.org', name: 'Admin' },
      expires: '2099-01-01',
    } as any)

    vi.mocked(db.user.findUnique).mockResolvedValue({
      id: 'user-1',
      email: 'admin@avfy.org',
      role: 'ADMIN',
    } as any)

    // No slug collision
    vi.mocked(db.blogPost.findUnique).mockResolvedValue(null)

    vi.mocked(db.blogPost.create).mockResolvedValue(mockCreatedPost as any)

    const request = new Request('http://localhost:3000/api/blog', {
      method: 'POST',
      body: JSON.stringify({
        title: 'Community Update: Spring 2024',
        content: 'We are excited to share several updates about our community programs and upcoming events this spring season.',
        excerpt: 'We are excited to share several updates...',
        status: 'PUBLISHED',
        category: 'community',
        tags: ['update', 'spring'],
      }),
      headers: { 'Content-Type': 'application/json' },
    })

    const response = await POST(request as any)
    const data = await response.json()

    expect(response.status).toBe(201)
    expect(data.id).toBe('post-new')
    expect(data.title).toBe('Community Update: Spring 2024')
    expect(data.slug).toBe('community-update-spring-2024')
    expect(data.author.name).toBe('Admin')

    // Verify DB was called with correct data
    expect(db.blogPost.create).toHaveBeenCalledOnce()
    expect(db.blogPost.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        title: 'Community Update: Spring 2024',
        slug: 'community-update-spring-2024',
        content: expect.any(String),
        authorId: 'user-1',
        status: 'PUBLISHED',
        category: 'community',
        publishedAt: expect.any(Date),
      }),
      include: {
        author: {
          select: { id: true, name: true, email: true },
        },
      },
    })
  })

  it('should generate a slug from the title', async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { email: 'admin@avfy.org', name: 'Admin' },
      expires: '2099-01-01',
    } as any)

    vi.mocked(db.user.findUnique).mockResolvedValue({
      id: 'user-1',
      email: 'admin@avfy.org',
      role: 'ADMIN',
    } as any)

    // No slug collision
    vi.mocked(db.blogPost.findUnique).mockResolvedValue(null)

    vi.mocked(db.blogPost.create).mockResolvedValue({
      id: 'post-slug',
      title: 'Hello World! This Is A Test',
      slug: 'hello-world-this-is-a-test',
      content: 'Test content for slug generation.',
      author: { id: 'user-1', name: 'Admin', email: 'admin@avfy.org' },
    } as any)

    const request = new Request('http://localhost:3000/api/blog', {
      method: 'POST',
      body: JSON.stringify({
        title: 'Hello World! This Is A Test',
        content: 'Test content for slug generation.',
      }),
      headers: { 'Content-Type': 'application/json' },
    })

    const response = await POST(request as any)

    expect(response.status).toBe(201)

    // Verify the slug was generated correctly
    expect(db.blogPost.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          slug: 'hello-world-this-is-a-test',
        }),
      })
    )
  })
})
