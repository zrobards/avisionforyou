import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('next-auth', () => ({
  getServerSession: vi.fn(),
}))

vi.mock('@/lib/auth', () => ({
  authOptions: {},
}))

vi.mock('@/lib/db', () => ({
  db: {
    user: { findFirst: vi.fn() },
  },
}))

describe('API Auth helpers', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('hasRole', () => {
    it('returns true when user role is in allowed list', async () => {
      const { hasRole } = await import('@/lib/apiAuth')
      expect(hasRole('ADMIN', ['ADMIN', 'USER'])).toBe(true)
    })

    it('returns false when user role is not in allowed list', async () => {
      const { hasRole } = await import('@/lib/apiAuth')
      expect(hasRole('USER', ['ADMIN'])).toBe(false)
    })

    it('returns false for undefined role', async () => {
      const { hasRole } = await import('@/lib/apiAuth')
      expect(hasRole(undefined, ['ADMIN'])).toBe(false)
    })

    it('returns false for empty string role', async () => {
      const { hasRole } = await import('@/lib/apiAuth')
      expect(hasRole('', ['ADMIN'])).toBe(false)
    })
  })

  describe('response helpers', () => {
    it('unauthorizedResponse returns 401', async () => {
      const { unauthorizedResponse } = await import('@/lib/apiAuth')
      const res = unauthorizedResponse()
      expect(res.status).toBe(401)
    })

    it('forbiddenResponse returns 403', async () => {
      const { forbiddenResponse } = await import('@/lib/apiAuth')
      const res = forbiddenResponse()
      expect(res.status).toBe(403)
    })

    it('successResponse wraps data', async () => {
      const { successResponse } = await import('@/lib/apiAuth')
      const res = successResponse({ hello: 'world' })
      const body = await res.json()
      expect(body.success).toBe(true)
      expect(body.data.hello).toBe('world')
    })

    it('rateLimitResponse returns 429 with Retry-After', async () => {
      const { rateLimitResponse } = await import('@/lib/apiAuth')
      const res = rateLimitResponse(60)
      expect(res.status).toBe(429)
      expect(res.headers.get('Retry-After')).toBe('60')
    })
  })
})
