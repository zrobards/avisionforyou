import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock dependencies before importing the route handler
vi.mock('@/lib/db', () => ({
  db: {
    newsletterSubscriber: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
  },
}))

vi.mock('@/lib/rateLimit', () => ({
  rateLimit: vi.fn().mockResolvedValue({
    success: true,
    remaining: 2,
  }),
  newsletterLimiter: null,
  getClientIp: vi.fn().mockReturnValue('127.0.0.1'),
}))

vi.mock('@/lib/sanitize', () => ({
  sanitizeEmail: vi.fn().mockImplementation((input: string) => {
    const trimmed = input.trim().toLowerCase()
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(trimmed) ? trimmed : ''
  }),
}))

vi.mock('resend', () => ({
  Resend: vi.fn().mockImplementation(() => ({
    emails: {
      send: vi.fn().mockResolvedValue({ id: 'email-123' }),
    },
  })),
}))

import { POST } from '@/app/api/newsletter/subscribe/route'
import { db } from '@/lib/db'
import { rateLimit } from '@/lib/rateLimit'

describe('POST /api/newsletter/subscribe', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    // Default: rate limiting allows the request
    vi.mocked(rateLimit).mockResolvedValue({
      success: true,
      remaining: 2,
    })

    // Default: no existing subscriber
    vi.mocked(db.newsletterSubscriber.findUnique).mockResolvedValue(null)

    // Default: subscriber creation succeeds
    vi.mocked(db.newsletterSubscriber.create).mockResolvedValue({
      id: 'sub-1',
      email: 'subscriber@example.com',
      subscribed: true,
      subscribedAt: new Date(),
    } as any)
  })

  it('should successfully subscribe a new email', async () => {
    const request = new Request('http://localhost:3000/api/newsletter/subscribe', {
      method: 'POST',
      body: JSON.stringify({
        email: 'subscriber@example.com',
      }),
      headers: { 'Content-Type': 'application/json' },
    })

    const response = await POST(request as any)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.message).toBe('Successfully subscribed to newsletter')
    expect(data.subscribed).toBe(true)

    // Verify DB was called
    expect(db.newsletterSubscriber.findUnique).toHaveBeenCalledWith({
      where: { email: 'subscriber@example.com' },
    })
    expect(db.newsletterSubscriber.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        email: 'subscriber@example.com',
        subscribed: true,
      }),
    })
  })

  it('should reject already-subscribed email with 400', async () => {
    // Simulate existing active subscriber
    vi.mocked(db.newsletterSubscriber.findUnique).mockResolvedValue({
      id: 'sub-existing',
      email: 'already@example.com',
      subscribed: true,
      subscribedAt: new Date(),
    } as any)

    const request = new Request('http://localhost:3000/api/newsletter/subscribe', {
      method: 'POST',
      body: JSON.stringify({
        email: 'already@example.com',
      }),
      headers: { 'Content-Type': 'application/json' },
    })

    const response = await POST(request as any)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('You are already subscribed to our newsletter')

    // Should NOT create a new subscriber
    expect(db.newsletterSubscriber.create).not.toHaveBeenCalled()
  })

  it('should re-subscribe a previously unsubscribed email', async () => {
    // Simulate previously unsubscribed user
    vi.mocked(db.newsletterSubscriber.findUnique).mockResolvedValue({
      id: 'sub-old',
      email: 'resubscribe@example.com',
      subscribed: false,
      subscribedAt: new Date('2023-01-01'),
    } as any)

    vi.mocked(db.newsletterSubscriber.update).mockResolvedValue({
      id: 'sub-old',
      email: 'resubscribe@example.com',
      subscribed: true,
      subscribedAt: new Date(),
    } as any)

    const request = new Request('http://localhost:3000/api/newsletter/subscribe', {
      method: 'POST',
      body: JSON.stringify({
        email: 'resubscribe@example.com',
      }),
      headers: { 'Content-Type': 'application/json' },
    })

    const response = await POST(request as any)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.message).toBe('Successfully subscribed to newsletter')
    expect(data.subscribed).toBe(true)

    // Should update existing, not create new
    expect(db.newsletterSubscriber.update).toHaveBeenCalledWith({
      where: { email: 'resubscribe@example.com' },
      data: expect.objectContaining({
        subscribed: true,
      }),
    })
    expect(db.newsletterSubscriber.create).not.toHaveBeenCalled()
  })

  it('should reject honeypot submissions (company field filled)', async () => {
    const request = new Request('http://localhost:3000/api/newsletter/subscribe', {
      method: 'POST',
      body: JSON.stringify({
        email: 'bot@spammer.com',
        company: 'Spam Corp',  // honeypot field
      }),
      headers: { 'Content-Type': 'application/json' },
    })

    const response = await POST(request as any)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Invalid submission')

    // DB should NOT have been called at all
    expect(db.newsletterSubscriber.findUnique).not.toHaveBeenCalled()
    expect(db.newsletterSubscriber.create).not.toHaveBeenCalled()
  })

  it('should reject invalid email addresses with 400', async () => {
    const request = new Request('http://localhost:3000/api/newsletter/subscribe', {
      method: 'POST',
      body: JSON.stringify({
        email: 'not-an-email',
      }),
      headers: { 'Content-Type': 'application/json' },
    })

    const response = await POST(request as any)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Valid email is required')
  })

  it('should return 429 when rate limit is exceeded', async () => {
    vi.mocked(rateLimit).mockResolvedValue({
      success: false,
      remaining: 0,
    })

    const request = new Request('http://localhost:3000/api/newsletter/subscribe', {
      method: 'POST',
      body: JSON.stringify({
        email: 'subscriber@example.com',
      }),
      headers: { 'Content-Type': 'application/json' },
    })

    const response = await POST(request as any)
    const data = await response.json()

    expect(response.status).toBe(429)
    expect(data.error).toContain('Too many requests')

    // DB should NOT have been called
    expect(db.newsletterSubscriber.findUnique).not.toHaveBeenCalled()
    expect(db.newsletterSubscriber.create).not.toHaveBeenCalled()
  })

  it('should reject empty email with 400', async () => {
    const request = new Request('http://localhost:3000/api/newsletter/subscribe', {
      method: 'POST',
      body: JSON.stringify({
        email: '',
      }),
      headers: { 'Content-Type': 'application/json' },
    })

    const response = await POST(request as any)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Valid email is required')
  })
})
