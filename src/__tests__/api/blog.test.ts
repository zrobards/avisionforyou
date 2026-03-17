import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock Prisma
vi.mock('@/lib/db', () => ({
  db: {
    blogPost: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    user: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
    },
  },
}))

// Mock auth
vi.mock('@/lib/apiAuth', () => ({
  getSession: vi.fn(),
  rateLimitResponse: vi.fn(() => new Response(JSON.stringify({ error: 'Rate limited' }), { status: 429 })),
}))

// Mock rate limit
vi.mock('@/lib/rateLimit', () => ({
  checkRateLimit: vi.fn(() => ({ allowed: true })),
}))

// Mock DOMPurify
vi.mock('isomorphic-dompurify', () => ({
  default: { sanitize: (html: string) => html },
}))

import { db } from '@/lib/db'
import { getSession } from '@/lib/apiAuth'

describe('Blog API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('GET /api/blog', () => {
    it('returns published posts for unauthenticated users', async () => {
      vi.mocked(getSession).mockResolvedValue(null)
      vi.mocked(db.blogPost.findMany).mockResolvedValue([
        { id: '1', title: 'Test Post', slug: 'test', status: 'PUBLISHED', content: 'content', author: { name: 'Admin' } },
      ] as any)

      const { GET } = await import('@/app/api/blog/route')
      const request = new Request('http://localhost/api/blog')
      const response = await GET(request as any)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toHaveLength(1)
      expect(db.blogPost.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { status: 'PUBLISHED' },
        })
      )
    })

    it('returns all posts including drafts for admin', async () => {
      vi.mocked(getSession).mockResolvedValue({
        user: { id: '1', email: 'admin@test.com', role: 'ADMIN', name: 'Admin' },
        expires: '2099-01-01',
      })
      vi.mocked(db.user.findUnique).mockResolvedValue({ id: '1', role: 'ADMIN' } as any)
      vi.mocked(db.blogPost.findMany).mockResolvedValue([])

      const { GET } = await import('@/app/api/blog/route')
      const request = new Request('http://localhost/api/blog?drafts=true')
      const response = await GET(request as any)

      expect(response.status).toBe(200)
      expect(db.blogPost.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: {} })
      )
    })
  })

  describe('POST /api/blog', () => {
    it('rejects unauthenticated users', async () => {
      vi.mocked(getSession).mockResolvedValue(null)

      const { POST } = await import('@/app/api/blog/route')
      const request = new Request('http://localhost/api/blog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Test', content: 'Content' }),
      })
      const response = await POST(request as any)

      expect(response.status).toBe(401)
    })

    it('rejects non-admin users', async () => {
      vi.mocked(getSession).mockResolvedValue({
        user: { id: '2', email: 'user@test.com', role: 'USER', name: 'User' },
        expires: '2099-01-01',
      })
      vi.mocked(db.user.findUnique).mockResolvedValue({ id: '2', role: 'USER' } as any)

      const { POST } = await import('@/app/api/blog/route')
      const request = new Request('http://localhost/api/blog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Test', content: 'Content' }),
      })
      const response = await POST(request as any)

      expect(response.status).toBe(403)
    })

    it('creates a blog post for admin', async () => {
      vi.mocked(getSession).mockResolvedValue({
        user: { id: '1', email: 'admin@test.com', role: 'ADMIN', name: 'Admin' },
        expires: '2099-01-01',
      })
      vi.mocked(db.user.findUnique).mockResolvedValue({ id: '1', role: 'ADMIN' } as any)
      vi.mocked(db.blogPost.findUnique).mockResolvedValue(null)
      vi.mocked(db.blogPost.create).mockResolvedValue({
        id: 'new1', title: 'Test Post', slug: 'test-post', content: '<p>Content</p>',
        status: 'DRAFT', authorId: '1', author: { id: '1', name: 'Admin', email: 'admin@test.com' },
      } as any)

      const { POST } = await import('@/app/api/blog/route')
      const request = new Request('http://localhost/api/blog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Test Post', content: '<p>Content</p>', status: 'DRAFT', category: 'Recovery' }),
      })
      const response = await POST(request as any)

      expect(response.status).toBe(201)
      expect(db.blogPost.create).toHaveBeenCalled()
    })

    it('rejects posts without title', async () => {
      vi.mocked(getSession).mockResolvedValue({
        user: { id: '1', email: 'admin@test.com', role: 'ADMIN', name: 'Admin' },
        expires: '2099-01-01',
      })
      vi.mocked(db.user.findUnique).mockResolvedValue({ id: '1', role: 'ADMIN' } as any)

      const { POST } = await import('@/app/api/blog/route')
      const request = new Request('http://localhost/api/blog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: 'Content' }),
      })
      const response = await POST(request as any)

      expect(response.status).toBe(400)
    })
  })
})
