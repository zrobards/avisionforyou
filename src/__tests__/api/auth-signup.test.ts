import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock dependencies before importing the route handler
vi.mock('@/lib/db', () => ({
  db: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
  },
}))

vi.mock('bcryptjs', () => ({
  default: {
    genSalt: vi.fn().mockResolvedValue('mock-salt'),
    hash: vi.fn().mockResolvedValue('hashed-password-abc123'),
  },
}))

vi.mock('@/lib/rateLimit', () => ({
  rateLimit: vi.fn().mockResolvedValue({
    success: true,
    remaining: 4,
  }),
  authLimiter: null,
  getClientIp: vi.fn().mockReturnValue('127.0.0.1'),
}))

vi.mock('@/lib/sanitize', () => ({
  sanitizeString: vi.fn().mockImplementation((input: string) => input.trim()),
  sanitizeEmail: vi.fn().mockImplementation((input: string) => input.trim().toLowerCase()),
}))

import { POST } from '@/app/api/auth/signup/route'
import { db } from '@/lib/db'
import { rateLimit } from '@/lib/rateLimit'

describe('POST /api/auth/signup', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    // Default: rate limiting allows the request
    vi.mocked(rateLimit).mockResolvedValue({
      success: true,
      remaining: 4,
    })

    // Default: no existing user
    vi.mocked(db.user.findUnique).mockResolvedValue(null)

    // Default: user creation succeeds
    vi.mocked(db.user.create).mockResolvedValue({
      id: 'user-new-1',
      email: 'newuser@example.com',
      name: 'New User',
      role: 'USER',
      passwordHash: 'hashed-password-abc123',
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any)
  })

  it('should successfully create a new user account (201)', async () => {
    const request = new Request('http://localhost:3000/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({
        email: 'newuser@example.com',
        name: 'New User',
        password: 'SecurePass1!',
      }),
      headers: { 'Content-Type': 'application/json' },
    })

    const response = await POST(request as any)
    const data = await response.json()

    expect(response.status).toBe(201)
    expect(data.success).toBe(true)
    expect(data.message).toBe('Account created successfully')
    expect(data.user.id).toBe('user-new-1')
    expect(data.user.email).toBe('newuser@example.com')
    expect(data.user.name).toBe('New User')

    // Verify DB calls
    expect(db.user.findUnique).toHaveBeenCalledWith({
      where: { email: 'newuser@example.com' },
    })
    expect(db.user.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        email: 'newuser@example.com',
        name: 'New User',
        passwordHash: 'hashed-password-abc123',
        role: 'USER',
      }),
    })
  })

  it('should reject duplicate email with 409', async () => {
    // Simulate existing user
    vi.mocked(db.user.findUnique).mockResolvedValue({
      id: 'user-existing',
      email: 'existing@example.com',
      name: 'Existing User',
      role: 'USER',
    } as any)

    const request = new Request('http://localhost:3000/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({
        email: 'existing@example.com',
        name: 'Another User',
        password: 'SecurePass1!',
      }),
      headers: { 'Content-Type': 'application/json' },
    })

    const response = await POST(request as any)
    const data = await response.json()

    expect(response.status).toBe(409)
    expect(data.error).toBe('Email already in use')

    // User should NOT have been created
    expect(db.user.create).not.toHaveBeenCalled()
  })

  it('should reject weak password (too short) with 400', async () => {
    const request = new Request('http://localhost:3000/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({
        email: 'user@example.com',
        name: 'Test User',
        password: 'Ab1!',  // Only 4 characters, less than 8
      }),
      headers: { 'Content-Type': 'application/json' },
    })

    const response = await POST(request as any)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Password must be at least 8 characters')

    // User should NOT have been created
    expect(db.user.create).not.toHaveBeenCalled()
  })

  it('should reject password without number or special character with 400', async () => {
    const request = new Request('http://localhost:3000/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({
        email: 'user@example.com',
        name: 'Test User',
        password: 'abcdefghij',  // 10 chars but no number or special char
      }),
      headers: { 'Content-Type': 'application/json' },
    })

    const response = await POST(request as any)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Password must include at least 1 number and 1 special character')

    // User should NOT have been created
    expect(db.user.create).not.toHaveBeenCalled()
  })

  it('should reject missing required fields with 400', async () => {
    const request = new Request('http://localhost:3000/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({
        email: 'user@example.com',
        // missing name and password
      }),
      headers: { 'Content-Type': 'application/json' },
    })

    const response = await POST(request as any)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Missing required fields')
  })

  it('should reject when email is missing with 400', async () => {
    const request = new Request('http://localhost:3000/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Test User',
        password: 'SecurePass1!',
        // missing email
      }),
      headers: { 'Content-Type': 'application/json' },
    })

    const response = await POST(request as any)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Missing required fields')
  })

  it('should return 429 when rate limit is exceeded', async () => {
    vi.mocked(rateLimit).mockResolvedValue({
      success: false,
      remaining: 0,
    })

    const request = new Request('http://localhost:3000/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({
        email: 'user@example.com',
        name: 'Test User',
        password: 'SecurePass1!',
      }),
      headers: { 'Content-Type': 'application/json' },
    })

    const response = await POST(request as any)
    const data = await response.json()

    expect(response.status).toBe(429)
    expect(data.error).toContain('Too many signup attempts')

    // DB should NOT have been called
    expect(db.user.findUnique).not.toHaveBeenCalled()
    expect(db.user.create).not.toHaveBeenCalled()
  })

  it('should not expose password hash in the response', async () => {
    const request = new Request('http://localhost:3000/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({
        email: 'secure@example.com',
        name: 'Secure User',
        password: 'SecurePass1!',
      }),
      headers: { 'Content-Type': 'application/json' },
    })

    const response = await POST(request as any)
    const data = await response.json()

    expect(response.status).toBe(201)
    // The response should NOT contain the password hash
    expect(data.user).not.toHaveProperty('passwordHash')
    expect(JSON.stringify(data)).not.toContain('hashed-password')
  })
})
