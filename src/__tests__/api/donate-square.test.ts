import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock dependencies before importing the route handler
vi.mock('@/lib/db', () => ({
  db: {
    donation: {
      create: vi.fn(),
      update: vi.fn(),
    },
  },
}))

vi.mock('@/lib/email', () => ({
  sendDonationConfirmationEmail: vi.fn().mockResolvedValue(true),
}))

vi.mock('@/lib/rateLimit', () => ({
  rateLimit: vi.fn().mockResolvedValue({
    success: true,
    remaining: 4,
  }),
  donateLimiter: null,
  getClientIp: vi.fn().mockReturnValue('127.0.0.1'),
}))

vi.mock('@/lib/apiErrors', () => ({
  generateRequestId: vi.fn().mockReturnValue('req_test_456'),
  logApiRequest: vi.fn(),
  handleApiError: vi.fn().mockReturnValue({
    statusCode: 500,
    code: 'SERVER_ERROR',
    message: 'An error occurred. Please try again.',
  }),
}))

vi.mock('@/lib/apiAuth', () => ({
  rateLimitResponse: vi.fn().mockImplementation((retryAfter: number) => {
    const response = new Response(
      JSON.stringify({
        success: false,
        error: 'Too many requests. Please try again later.',
        code: 'RATE_LIMIT_EXCEEDED',
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': retryAfter.toString(),
        },
      }
    )
    return response
  }),
  errorResponse: vi.fn(),
}))

vi.mock('@/lib/notifications', () => ({
  logActivity: vi.fn(),
  notifyByRole: vi.fn(),
}))

vi.mock('uuid', () => ({
  v4: vi.fn().mockReturnValue('mock-uuid-1234'),
}))

// Mock global fetch for Square API calls
const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

import { POST } from '@/app/api/donate/square/route'
import { db } from '@/lib/db'
import { rateLimit } from '@/lib/rateLimit'
import { sendDonationConfirmationEmail } from '@/lib/email'

describe('POST /api/donate/square', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    // Set required env vars
    process.env.SQUARE_ENVIRONMENT = 'sandbox'
    process.env.SQUARE_ACCESS_TOKEN = 'test-square-token'
    process.env.SQUARE_LOCATION_ID = 'test-location-id'
    process.env.NEXTAUTH_URL = 'http://localhost:3000'

    // Default: rate limiting allows the request
    vi.mocked(rateLimit).mockResolvedValue({
      success: true,
      remaining: 4,
    })

    // Default: DB create returns a mock donation
    vi.mocked(db.donation.create).mockResolvedValue({
      id: 'donation-1',
      amount: 50,
      frequency: 'ONE_TIME',
      email: 'donor@example.com',
      name: 'Test Donor',
      status: 'PENDING',
      squarePaymentId: 'mock-uuid-1234',
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any)
  })

  it('should reject requests with missing required fields', async () => {
    const request = new Request('http://localhost:3000/api/donate/square', {
      method: 'POST',
      body: JSON.stringify({
        amount: 50,
        // missing email, name, frequency
      }),
      headers: { 'Content-Type': 'application/json' },
    })

    const response = await POST(request as any)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.success).toBe(false)
    expect(data.code).toBe('VALIDATION_ERROR')
  })

  it('should reject invalid donation amount (below minimum)', async () => {
    const request = new Request('http://localhost:3000/api/donate/square', {
      method: 'POST',
      body: JSON.stringify({
        amount: 0, // Below minimum of $1
        email: 'donor@example.com',
        name: 'Test Donor',
        frequency: 'ONE_TIME',
      }),
      headers: { 'Content-Type': 'application/json' },
    })

    const response = await POST(request as any)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.success).toBe(false)
    expect(data.code).toBe('VALIDATION_ERROR')
  })

  it('should successfully create a donation and return checkout URL', async () => {
    // Mock Square Payment Links API (single call)
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        payment_link: {
          url: 'https://squareupsandbox.com/checkout/abc123',
        },
      }),
    })

    const request = new Request('http://localhost:3000/api/donate/square', {
      method: 'POST',
      body: JSON.stringify({
        amount: 50,
        email: 'donor@example.com',
        name: 'Generous Donor',
        frequency: 'ONE_TIME',
      }),
      headers: { 'Content-Type': 'application/json' },
    })

    const response = await POST(request as any)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.url).toBe('https://squareupsandbox.com/checkout/abc123')
    expect(data.donationId).toBe('donation-1')
    expect(data.isRecurring).toBe(false)

    // Verify DB was called
    expect(db.donation.create).toHaveBeenCalledOnce()
    expect(db.donation.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        amount: 50,
        email: 'donor@example.com',
        name: 'Generous Donor',
        frequency: 'ONE_TIME',
        status: 'PENDING',
      }),
    })

    // Verify Square Payment Links API was called once
    expect(mockFetch).toHaveBeenCalledTimes(1)

    // Verify confirmation email was sent
    expect(sendDonationConfirmationEmail).toHaveBeenCalledWith(
      'donation-1',
      'donor@example.com',
      'Generous Donor',
      50,
      'ONE_TIME'
    )
  })

  it('should handle Square API payment link creation failure', async () => {
    // Mock Square Payment Links API failure
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({ errors: [{ detail: 'Internal error' }] }),
    })

    const request = new Request('http://localhost:3000/api/donate/square', {
      method: 'POST',
      body: JSON.stringify({
        amount: 25,
        email: 'donor@example.com',
        name: 'Test Donor',
        frequency: 'MONTHLY',
      }),
      headers: { 'Content-Type': 'application/json' },
    })

    const response = await POST(request as any)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.success).toBe(false)
    expect(data.code).toBe('PAYMENT_ERROR')
    expect(data.error).toBe('Payment processing failed. Please check your details and try again.')
  })

  it('should handle Square API returning no payment link URL', async () => {
    // Payment link response missing URL
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        payment_link: {},
      }),
    })

    const request = new Request('http://localhost:3000/api/donate/square', {
      method: 'POST',
      body: JSON.stringify({
        amount: 100,
        email: 'donor@example.com',
        name: 'Test Donor',
        frequency: 'YEARLY',
      }),
      headers: { 'Content-Type': 'application/json' },
    })

    const response = await POST(request as any)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.success).toBe(false)
    expect(data.code).toBe('PAYMENT_ERROR')
  })

  it('should return 429 when rate limit is exceeded', async () => {
    vi.mocked(rateLimit).mockResolvedValue({
      success: false,
      remaining: 0,
    })

    const request = new Request('http://localhost:3000/api/donate/square', {
      method: 'POST',
      body: JSON.stringify({
        amount: 50,
        email: 'donor@example.com',
        name: 'Test Donor',
        frequency: 'ONE_TIME',
      }),
      headers: { 'Content-Type': 'application/json' },
    })

    const response = await POST(request as any)
    const data = await response.json()

    expect(response.status).toBe(429)
    expect(data.success).toBe(false)
    expect(data.code).toBe('RATE_LIMIT_EXCEEDED')

    // DB should NOT have been called
    expect(db.donation.create).not.toHaveBeenCalled()
  })

  it('should mark recurring donation correctly', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        payment_link: {
          url: 'https://squareupsandbox.com/checkout/monthly',
        },
      }),
    })

    const request = new Request('http://localhost:3000/api/donate/square', {
      method: 'POST',
      body: JSON.stringify({
        amount: 25,
        email: 'monthly@example.com',
        name: 'Monthly Donor',
        frequency: 'MONTHLY',
      }),
      headers: { 'Content-Type': 'application/json' },
    })

    const response = await POST(request as any)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.isRecurring).toBe(true)

    // Verify DB was called with recurring fields
    expect(db.donation.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        frequency: 'MONTHLY',
        nextRenewalDate: expect.any(Date),
        recurringStartDate: expect.any(Date),
        renewalSchedule: 'anniversary',
      }),
    })
  })
})
