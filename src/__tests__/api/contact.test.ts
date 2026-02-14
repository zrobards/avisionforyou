import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock dependencies before importing the route handler
vi.mock('@/lib/db', () => ({
  db: {
    contactInquiry: {
      create: vi.fn(),
    },
  },
}))

vi.mock('@/lib/email', () => ({
  sendEmail: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('@/lib/rateLimit', () => ({
  rateLimit: vi.fn().mockResolvedValue({
    success: true,
    remaining: 4,
  }),
  contactLimiter: null,
  getClientIp: vi.fn().mockReturnValue('127.0.0.1'),
}))

vi.mock('@/lib/apiErrors', () => ({
  generateRequestId: vi.fn().mockReturnValue('req_test_123'),
  logApiRequest: vi.fn(),
  handleApiError: vi.fn().mockReturnValue({
    statusCode: 500,
    code: 'SERVER_ERROR',
    message: 'An error occurred. Please try again.',
  }),
}))

import { POST } from '@/app/api/contact/route'
import { db } from '@/lib/db'
import { rateLimit } from '@/lib/rateLimit'
import { sendEmail } from '@/lib/email'

describe('POST /api/contact', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Default: rate limiting allows the request
    vi.mocked(rateLimit).mockResolvedValue({
      success: true,
      remaining: 4,
    })
    // Default: DB create returns a mock inquiry
    vi.mocked(db.contactInquiry.create).mockResolvedValue({
      id: 'inquiry-1',
      name: 'Test User',
      email: 'test@example.com',
      phone: null,
      department: 'general',
      subject: 'Test Subject',
      message: 'This is a test message with enough length.',
      status: 'NEW',
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any)
  })

  it('should reject requests with missing required fields', async () => {
    const request = new Request('http://localhost:3000/api/contact', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Test User',
        // missing email, subject, message
      }),
      headers: { 'Content-Type': 'application/json' },
    })

    const response = await POST(request as any)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.success).toBe(false)
    expect(data.code).toBe('VALIDATION_ERROR')
  })

  it('should reject requests with invalid email', async () => {
    const request = new Request('http://localhost:3000/api/contact', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Test User',
        email: 'not-an-email',
        subject: 'Test Subject',
        message: 'This is a test message with enough characters for validation.',
      }),
      headers: { 'Content-Type': 'application/json' },
    })

    const response = await POST(request as any)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.success).toBe(false)
    expect(data.code).toBe('VALIDATION_ERROR')
  })

  it('should successfully create a contact inquiry', async () => {
    const request = new Request('http://localhost:3000/api/contact', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Jane Doe',
        email: 'jane@example.com',
        subject: 'Question about programs',
        message: 'I would like to learn more about the Surrender Program and how to enroll.',
        department: 'programs',
      }),
      headers: { 'Content-Type': 'application/json' },
    })

    const response = await POST(request as any)
    const data = await response.json()

    expect(response.status).toBe(201)
    expect(data.success).toBe(true)
    expect(data.inquiryId).toBe('inquiry-1')
    expect(data.message).toContain('received')

    // Verify DB was called
    expect(db.contactInquiry.create).toHaveBeenCalledOnce()
    expect(db.contactInquiry.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        name: 'Jane Doe',
        email: 'jane@example.com',
        subject: 'Question about programs',
        department: 'programs',
        status: 'NEW',
      }),
    })

    // Verify emails were sent (staff + confirmation)
    expect(sendEmail).toHaveBeenCalledTimes(2)
  })

  it('should return 429 when rate limit is exceeded', async () => {
    vi.mocked(rateLimit).mockResolvedValue({
      success: false,
      remaining: 0,
    })

    const request = new Request('http://localhost:3000/api/contact', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Spammer',
        email: 'spam@example.com',
        subject: 'Spam Message',
        message: 'This request should be rate limited by the server.',
      }),
      headers: { 'Content-Type': 'application/json' },
    })

    const response = await POST(request as any)
    const data = await response.json()

    expect(response.status).toBe(429)
    expect(data.success).toBe(false)
    expect(data.code).toBe('RATE_LIMIT_EXCEEDED')
    expect(response.headers.get('Retry-After')).toBe('60')

    // DB should NOT have been called
    expect(db.contactInquiry.create).not.toHaveBeenCalled()
  })

  it('should still succeed if email sending fails', async () => {
    vi.mocked(sendEmail).mockRejectedValue(new Error('Email service down'))

    const request = new Request('http://localhost:3000/api/contact', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Jane Doe',
        email: 'jane@example.com',
        subject: 'Inquiry about volunteering',
        message: 'I am interested in volunteering with your organization this summer.',
        department: 'volunteer',
      }),
      headers: { 'Content-Type': 'application/json' },
    })

    const response = await POST(request as any)
    const data = await response.json()

    // Should still return 201 because the inquiry was saved
    expect(response.status).toBe(201)
    expect(data.success).toBe(true)
    expect(data.inquiryId).toBe('inquiry-1')
  })
})
