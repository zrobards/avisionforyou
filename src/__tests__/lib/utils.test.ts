import { describe, it, expect, vi, beforeEach } from 'vitest'
import { z, ZodError } from 'zod'

// ─── sanitize.ts ────────────────────────────────────────────────────────────
import { escapeHtml, sanitizeString, sanitizeEmail } from '@/lib/sanitize'

// ─── validation.ts ──────────────────────────────────────────────────────────
import {
  ContactSchema,
  DonationSchema,
  validateRequest,
} from '@/lib/validation'

// ─── apiErrors.ts ───────────────────────────────────────────────────────────
// Mock Sentry and logger before importing apiErrors, since handleApiError
// calls Sentry.captureException and logger.error at the module level.
vi.mock('@sentry/nextjs', () => ({
  captureException: vi.fn(),
}))

vi.mock('@/lib/logger', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  },
}))

import {
  ApiError,
  generateRequestId,
  handleValidationError,
  handleApiError,
} from '@/lib/apiErrors'

// ═══════════════════════════════════════════════════════════════════════════
// 1. sanitize.ts
// ═══════════════════════════════════════════════════════════════════════════

describe('sanitize', () => {
  // ── escapeHtml ──────────────────────────────────────────────────────────

  describe('escapeHtml', () => {
    it('escapes ampersand', () => {
      expect(escapeHtml('Tom & Jerry')).toBe('Tom &amp; Jerry')
    })

    it('escapes less-than sign', () => {
      expect(escapeHtml('a < b')).toBe('a &lt; b')
    })

    it('escapes greater-than sign', () => {
      expect(escapeHtml('a > b')).toBe('a &gt; b')
    })

    it('escapes double quotes', () => {
      expect(escapeHtml('say "hello"')).toBe('say &quot;hello&quot;')
    })

    it('escapes single quotes', () => {
      expect(escapeHtml("it's")).toBe('it&#x27;s')
    })

    it('escapes a full HTML tag', () => {
      expect(escapeHtml('<script>alert("xss")</script>')).toBe(
        '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;'
      )
    })

    it('escapes multiple special characters in one string', () => {
      expect(escapeHtml('a & b < c > d "e" \'f\'')).toBe(
        'a &amp; b &lt; c &gt; d &quot;e&quot; &#x27;f&#x27;'
      )
    })

    it('returns empty string for null', () => {
      expect(escapeHtml(null)).toBe('')
    })

    it('returns empty string for undefined', () => {
      expect(escapeHtml(undefined)).toBe('')
    })

    it('returns empty string for empty string', () => {
      expect(escapeHtml('')).toBe('')
    })

    it('returns a normal string unchanged', () => {
      expect(escapeHtml('Hello World 123')).toBe('Hello World 123')
    })

    it('handles strings that are only special characters', () => {
      expect(escapeHtml('<>&"\'')).toBe('&lt;&gt;&amp;&quot;&#x27;')
    })
  })

  // ── sanitizeString ──────────────────────────────────────────────────────

  describe('sanitizeString', () => {
    it('strips HTML tags', () => {
      expect(sanitizeString('<b>bold</b> text')).toBe('bold text')
    })

    it('strips nested HTML tags', () => {
      expect(sanitizeString('<div><p>hello</p></div>')).toBe('hello')
    })

    it('strips a script tag', () => {
      expect(sanitizeString('<script>alert(1)</script>safe')).toBe(
        'alert(1)safe'
      )
    })

    it('trims leading and trailing whitespace', () => {
      expect(sanitizeString('  hello  ')).toBe('hello')
    })

    it('truncates to the default max length of 255', () => {
      const long = 'a'.repeat(300)
      const result = sanitizeString(long)
      expect(result.length).toBe(255)
    })

    it('truncates to a custom max length', () => {
      const result = sanitizeString('abcdefghij', 5)
      expect(result).toBe('abcde')
    })

    it('returns empty string for null', () => {
      expect(sanitizeString(null)).toBe('')
    })

    it('returns empty string for undefined', () => {
      expect(sanitizeString(undefined)).toBe('')
    })

    it('returns empty string for empty string', () => {
      expect(sanitizeString('')).toBe('')
    })

    it('leaves a normal string without HTML unchanged', () => {
      expect(sanitizeString('Hello World')).toBe('Hello World')
    })

    it('handles a string that is exactly 255 characters', () => {
      const exact = 'x'.repeat(255)
      expect(sanitizeString(exact)).toBe(exact)
    })

    it('handles a string with only HTML tags (produces empty after strip)', () => {
      expect(sanitizeString('<br/><hr/>')).toBe('')
    })
  })

  // ── sanitizeEmail ───────────────────────────────────────────────────────

  describe('sanitizeEmail', () => {
    it('returns a valid email unchanged (lowercase)', () => {
      expect(sanitizeEmail('user@example.com')).toBe('user@example.com')
    })

    it('normalizes uppercase to lowercase', () => {
      expect(sanitizeEmail('User@Example.COM')).toBe('user@example.com')
    })

    it('trims whitespace around the email', () => {
      expect(sanitizeEmail('  user@example.com  ')).toBe('user@example.com')
    })

    it('returns null for null', () => {
      expect(sanitizeEmail(null)).toBeNull()
    })

    it('returns null for undefined', () => {
      expect(sanitizeEmail(undefined)).toBeNull()
    })

    it('returns null for empty string', () => {
      expect(sanitizeEmail('')).toBeNull()
    })

    it('returns null for a string without @', () => {
      expect(sanitizeEmail('userexample.com')).toBeNull()
    })

    it('returns null for a string without a domain extension', () => {
      expect(sanitizeEmail('user@example')).toBeNull()
    })

    it('returns null for an email with spaces in the middle', () => {
      expect(sanitizeEmail('user @example.com')).toBeNull()
    })

    it('returns null for a string that is just @', () => {
      expect(sanitizeEmail('@')).toBeNull()
    })

    it('returns null for an email exceeding 254 characters', () => {
      // local part + @ + domain must be > 254 total
      const longLocal = 'a'.repeat(245)
      const longEmail = `${longLocal}@example.com` // 245 + 1 + 11 = 257
      expect(sanitizeEmail(longEmail)).toBeNull()
    })

    it('returns the email when it is exactly 254 characters', () => {
      const localPart = 'a'.repeat(241) // 241 + 1 + 11 = 253 which is < 254
      const email = `${localPart}@example.com`
      expect(email.length).toBeLessThanOrEqual(254)
      expect(sanitizeEmail(email)).toBe(email)
    })

    it('accepts plus-tagged emails', () => {
      expect(sanitizeEmail('user+tag@example.com')).toBe(
        'user+tag@example.com'
      )
    })

    it('accepts emails with dots in local part', () => {
      expect(sanitizeEmail('first.last@example.com')).toBe(
        'first.last@example.com'
      )
    })

    it('accepts subdomains', () => {
      expect(sanitizeEmail('user@mail.example.com')).toBe(
        'user@mail.example.com'
      )
    })
  })
})

// ═══════════════════════════════════════════════════════════════════════════
// 2. validation.ts
// ═══════════════════════════════════════════════════════════════════════════

describe('validation', () => {
  // ── ContactSchema ───────────────────────────────────────────────────────

  describe('ContactSchema', () => {
    const validContact = {
      name: 'Jane Doe',
      email: 'jane@example.com',
      subject: 'Hello there',
      message: 'I would like to learn more about your programs please.',
    }

    it('parses a fully valid contact with only required fields', () => {
      const result = ContactSchema.parse(validContact)
      expect(result.name).toBe('Jane Doe')
      expect(result.email).toBe('jane@example.com')
      expect(result.subject).toBe('Hello there')
      expect(result.message).toBe(validContact.message)
    })

    it('parses a valid contact with all optional fields', () => {
      const result = ContactSchema.parse({
        ...validContact,
        phone: '1234567890',
        department: 'programs',
      })
      expect(result.phone).toBe('1234567890')
      expect(result.department).toBe('programs')
    })

    it('allows phone to be an empty string', () => {
      const result = ContactSchema.parse({
        ...validContact,
        phone: '',
      })
      expect(result.phone).toBe('')
    })

    it('allows department to be omitted', () => {
      const result = ContactSchema.parse(validContact)
      expect(result.department).toBeUndefined()
    })

    it('rejects when name is missing', () => {
      const { name, ...rest } = validContact
      expect(() => ContactSchema.parse(rest)).toThrow(ZodError)
    })

    it('rejects when email is missing', () => {
      const { email, ...rest } = validContact
      expect(() => ContactSchema.parse(rest)).toThrow(ZodError)
    })

    it('rejects when subject is missing', () => {
      const { subject, ...rest } = validContact
      expect(() => ContactSchema.parse(rest)).toThrow(ZodError)
    })

    it('rejects when message is missing', () => {
      const { message, ...rest } = validContact
      expect(() => ContactSchema.parse(rest)).toThrow(ZodError)
    })

    it('rejects an invalid email format', () => {
      expect(() =>
        ContactSchema.parse({ ...validContact, email: 'not-an-email' })
      ).toThrow(ZodError)
    })

    it('rejects a message shorter than 10 characters', () => {
      expect(() =>
        ContactSchema.parse({ ...validContact, message: 'short' })
      ).toThrow(ZodError)
    })

    it('rejects a name longer than 200 characters', () => {
      expect(() =>
        ContactSchema.parse({ ...validContact, name: 'a'.repeat(201) })
      ).toThrow(ZodError)
    })

    it('rejects a subject longer than 200 characters', () => {
      expect(() =>
        ContactSchema.parse({ ...validContact, subject: 'a'.repeat(201) })
      ).toThrow(ZodError)
    })

    it('rejects a message longer than 5000 characters', () => {
      expect(() =>
        ContactSchema.parse({ ...validContact, message: 'a'.repeat(5001) })
      ).toThrow(ZodError)
    })

    it('rejects an invalid department value', () => {
      expect(() =>
        ContactSchema.parse({ ...validContact, department: 'marketing' })
      ).toThrow(ZodError)
    })

    it('accepts all valid department values', () => {
      const departments = [
        'general',
        'programs',
        'donate',
        'volunteer',
        'press',
        'careers',
      ] as const
      for (const dept of departments) {
        const result = ContactSchema.parse({
          ...validContact,
          department: dept,
        })
        expect(result.department).toBe(dept)
      }
    })

    it('rejects an empty name', () => {
      expect(() =>
        ContactSchema.parse({ ...validContact, name: '' })
      ).toThrow(ZodError)
    })

    it('rejects an empty subject', () => {
      expect(() =>
        ContactSchema.parse({ ...validContact, subject: '' })
      ).toThrow(ZodError)
    })
  })

  // ── DonationSchema ─────────────────────────────────────────────────────

  describe('DonationSchema', () => {
    const validDonation = {
      amount: 50,
      email: 'donor@example.com',
      name: 'John Doe',
      frequency: 'ONE_TIME' as const,
    }

    it('parses a valid one-time donation', () => {
      const result = DonationSchema.parse(validDonation)
      expect(result.amount).toBe(50)
      expect(result.email).toBe('donor@example.com')
      expect(result.name).toBe('John Doe')
      expect(result.frequency).toBe('ONE_TIME')
    })

    it('parses a valid monthly donation', () => {
      const result = DonationSchema.parse({
        ...validDonation,
        frequency: 'MONTHLY',
      })
      expect(result.frequency).toBe('MONTHLY')
    })

    it('parses a valid yearly donation', () => {
      const result = DonationSchema.parse({
        ...validDonation,
        frequency: 'YEARLY',
      })
      expect(result.frequency).toBe('YEARLY')
    })

    it('coerces a string amount to a number', () => {
      const result = DonationSchema.parse({
        ...validDonation,
        amount: '100',
      })
      expect(result.amount).toBe(100)
    })

    it('accepts the minimum amount of 1', () => {
      const result = DonationSchema.parse({ ...validDonation, amount: 1 })
      expect(result.amount).toBe(1)
    })

    it('accepts the maximum amount of 1000000', () => {
      const result = DonationSchema.parse({
        ...validDonation,
        amount: 1000000,
      })
      expect(result.amount).toBe(1000000)
    })

    it('rejects an amount of 0 (below minimum)', () => {
      expect(() =>
        DonationSchema.parse({ ...validDonation, amount: 0 })
      ).toThrow(ZodError)
    })

    it('rejects a negative amount', () => {
      expect(() =>
        DonationSchema.parse({ ...validDonation, amount: -10 })
      ).toThrow(ZodError)
    })

    it('rejects an amount exceeding 1000000', () => {
      expect(() =>
        DonationSchema.parse({ ...validDonation, amount: 1000001 })
      ).toThrow(ZodError)
    })

    it('rejects an invalid frequency', () => {
      expect(() =>
        DonationSchema.parse({ ...validDonation, frequency: 'WEEKLY' })
      ).toThrow(ZodError)
    })

    it('rejects an invalid email', () => {
      expect(() =>
        DonationSchema.parse({ ...validDonation, email: 'bad-email' })
      ).toThrow(ZodError)
    })

    it('rejects a missing name', () => {
      const { name, ...rest } = validDonation
      expect(() => DonationSchema.parse(rest)).toThrow(ZodError)
    })

    it('rejects an empty name', () => {
      expect(() =>
        DonationSchema.parse({ ...validDonation, name: '' })
      ).toThrow(ZodError)
    })

    it('rejects a name longer than 200 characters', () => {
      expect(() =>
        DonationSchema.parse({ ...validDonation, name: 'a'.repeat(201) })
      ).toThrow(ZodError)
    })

    it('rejects a missing email', () => {
      const { email, ...rest } = validDonation
      expect(() => DonationSchema.parse(rest)).toThrow(ZodError)
    })

    it('rejects a missing amount', () => {
      const { amount, ...rest } = validDonation
      expect(() => DonationSchema.parse(rest)).toThrow(ZodError)
    })

    it('rejects a missing frequency', () => {
      const { frequency, ...rest } = validDonation
      expect(() => DonationSchema.parse(rest)).toThrow(ZodError)
    })

    it('accepts a fractional dollar amount within bounds', () => {
      const result = DonationSchema.parse({
        ...validDonation,
        amount: 19.99,
      })
      expect(result.amount).toBeCloseTo(19.99)
    })
  })

  // ── validateRequest ────────────────────────────────────────────────────

  describe('validateRequest', () => {
    const TestSchema = z.object({
      name: z.string().min(1),
      age: z.number().int().min(0),
    })

    it('parses a valid request body', async () => {
      const request = new Request('http://localhost/api/test', {
        method: 'POST',
        body: JSON.stringify({ name: 'Alice', age: 30 }),
        headers: { 'Content-Type': 'application/json' },
      })

      const result = await validateRequest(request, TestSchema)
      expect(result).toEqual({ name: 'Alice', age: 30 })
    })

    it('throws ZodError for invalid request body', async () => {
      const request = new Request('http://localhost/api/test', {
        method: 'POST',
        body: JSON.stringify({ name: '', age: -1 }),
        headers: { 'Content-Type': 'application/json' },
      })

      await expect(validateRequest(request, TestSchema)).rejects.toThrow(
        ZodError
      )
    })

    it('throws ZodError when required fields are missing', async () => {
      const request = new Request('http://localhost/api/test', {
        method: 'POST',
        body: JSON.stringify({}),
        headers: { 'Content-Type': 'application/json' },
      })

      await expect(validateRequest(request, TestSchema)).rejects.toThrow(
        ZodError
      )
    })

    it('throws when body is not valid JSON', async () => {
      const request = new Request('http://localhost/api/test', {
        method: 'POST',
        body: 'not json',
        headers: { 'Content-Type': 'application/json' },
      })

      await expect(validateRequest(request, TestSchema)).rejects.toThrow()
    })

    it('throws ZodError when types are wrong', async () => {
      const request = new Request('http://localhost/api/test', {
        method: 'POST',
        body: JSON.stringify({ name: 123, age: 'not-a-number' }),
        headers: { 'Content-Type': 'application/json' },
      })

      await expect(validateRequest(request, TestSchema)).rejects.toThrow(
        ZodError
      )
    })
  })
})

// ═══════════════════════════════════════════════════════════════════════════
// 3. apiErrors.ts
// ═══════════════════════════════════════════════════════════════════════════

describe('apiErrors', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // ── ApiError ───────────────────────────────────────────────────────────

  describe('ApiError', () => {
    it('sets statusCode, code, message, and details', () => {
      const err = new ApiError(404, 'NOT_FOUND', 'Resource not found', [
        'Item with id 123 not found',
      ])
      expect(err.statusCode).toBe(404)
      expect(err.code).toBe('NOT_FOUND')
      expect(err.message).toBe('Resource not found')
      expect(err.details).toEqual(['Item with id 123 not found'])
    })

    it('sets name to "ApiError"', () => {
      const err = new ApiError(400, 'BAD_REQUEST', 'Bad request')
      expect(err.name).toBe('ApiError')
    })

    it('is an instance of Error', () => {
      const err = new ApiError(500, 'SERVER_ERROR', 'Internal error')
      expect(err).toBeInstanceOf(Error)
    })

    it('is an instance of ApiError', () => {
      const err = new ApiError(500, 'SERVER_ERROR', 'Internal error')
      expect(err).toBeInstanceOf(ApiError)
    })

    it('allows details to be undefined', () => {
      const err = new ApiError(403, 'FORBIDDEN', 'Access denied')
      expect(err.details).toBeUndefined()
    })

    it('allows an empty details array', () => {
      const err = new ApiError(422, 'UNPROCESSABLE', 'Invalid', [])
      expect(err.details).toEqual([])
    })
  })

  // ── generateRequestId ──────────────────────────────────────────────────

  describe('generateRequestId', () => {
    it('starts with "req_"', () => {
      const id = generateRequestId()
      expect(id).toMatch(/^req_/)
    })

    it('contains a timestamp portion', () => {
      const before = Date.now()
      const id = generateRequestId()
      const after = Date.now()

      // Extract the timestamp between first and second underscore
      const parts = id.split('_')
      const timestamp = Number(parts[1])
      expect(timestamp).toBeGreaterThanOrEqual(before)
      expect(timestamp).toBeLessThanOrEqual(after)
    })

    it('contains a random suffix', () => {
      const id = generateRequestId()
      const parts = id.split('_')
      // The random portion is the third part
      expect(parts[2]).toBeDefined()
      expect(parts[2].length).toBeGreaterThan(0)
    })

    it('generates unique IDs on successive calls', () => {
      const ids = new Set(Array.from({ length: 100 }, () => generateRequestId()))
      expect(ids.size).toBe(100)
    })

    it('returns a string', () => {
      expect(typeof generateRequestId()).toBe('string')
    })
  })

  // ── handleValidationError ──────────────────────────────────────────────

  describe('handleValidationError', () => {
    it('returns statusCode 400 and code VALIDATION_ERROR', () => {
      let zodError: ZodError
      try {
        z.object({ name: z.string() }).parse({ name: 123 })
        throw new Error('Should not reach')
      } catch (e) {
        zodError = e as ZodError
      }

      const result = handleValidationError(zodError!)
      expect(result.statusCode).toBe(400)
      expect(result.code).toBe('VALIDATION_ERROR')
      expect(result.message).toBe('Invalid request data')
    })

    it('includes formatted field paths in details', () => {
      let zodError: ZodError
      try {
        z.object({
          user: z.object({ email: z.string().email() }),
        }).parse({ user: { email: 'bad' } })
        throw new Error('Should not reach')
      } catch (e) {
        zodError = e as ZodError
      }

      const result = handleValidationError(zodError!)
      expect(result.details).toBeDefined()
      expect(result.details!.length).toBeGreaterThan(0)
      // Path should be "user.email: ..."
      expect(result.details![0]).toMatch(/^user\.email:/)
    })

    it('returns multiple errors for multiple invalid fields', () => {
      let zodError: ZodError
      try {
        z.object({
          name: z.string().min(1),
          age: z.number(),
        }).parse({ name: '', age: 'not-a-number' })
        throw new Error('Should not reach')
      } catch (e) {
        zodError = e as ZodError
      }

      const result = handleValidationError(zodError!)
      expect(result.details!.length).toBeGreaterThanOrEqual(2)
    })

    it('handles a missing required field', () => {
      let zodError: ZodError
      try {
        z.object({ email: z.string().email() }).parse({})
        throw new Error('Should not reach')
      } catch (e) {
        zodError = e as ZodError
      }

      const result = handleValidationError(zodError!)
      expect(result.details!.length).toBe(1)
      expect(result.details![0]).toContain('email')
    })
  })

  // ── handleApiError ─────────────────────────────────────────────────────

  describe('handleApiError', () => {
    const requestId = 'req_test_123'
    const context = 'test-endpoint'

    it('handles a ZodError and returns 400 validation response', () => {
      let zodError: ZodError
      try {
        z.object({ name: z.string() }).parse({})
        throw new Error('Should not reach')
      } catch (e) {
        zodError = e as ZodError
      }

      const result = handleApiError(zodError!, context, requestId)
      expect(result.statusCode).toBe(400)
      expect(result.code).toBe('VALIDATION_ERROR')
      expect(result.message).toBe('Invalid request data')
      expect(result.details).toBeDefined()
      expect(result.details!.length).toBeGreaterThan(0)
    })

    it('handles an ApiError and returns its status and code', () => {
      const apiError = new ApiError(
        409,
        'CONFLICT',
        'Duplicate entry',
        ['Email already in use']
      )

      const result = handleApiError(apiError, context, requestId)
      expect(result.statusCode).toBe(409)
      expect(result.code).toBe('CONFLICT')
      expect(result.message).toBe('Duplicate entry')
      expect(result.details).toEqual(['Email already in use'])
    })

    it('handles an ApiError without details', () => {
      const apiError = new ApiError(403, 'FORBIDDEN', 'Access denied')

      const result = handleApiError(apiError, context, requestId)
      expect(result.statusCode).toBe(403)
      expect(result.code).toBe('FORBIDDEN')
      expect(result.message).toBe('Access denied')
      expect(result.details).toBeUndefined()
    })

    it('handles a generic Error and returns 500', () => {
      const error = new Error('Something broke')

      const result = handleApiError(error, context, requestId)
      expect(result.statusCode).toBe(500)
      expect(result.code).toBe('SERVER_ERROR')
      expect(result.message).toBe('An error occurred. Please try again.')
      expect(result.details).toBeUndefined()
    })

    it('handles a database-related Error with a Prisma message', () => {
      const error = new Error('Prisma client query failed')

      const result = handleApiError(error, context, requestId)
      expect(result.statusCode).toBe(500)
      expect(result.code).toBe('SERVER_ERROR')
      expect(result.message).toBe(
        'Failed to save changes. Please try again.'
      )
    })

    it('handles a database-related Error with "database" in the message', () => {
      const error = new Error('database connection timeout')

      const result = handleApiError(error, context, requestId)
      expect(result.statusCode).toBe(500)
      expect(result.code).toBe('SERVER_ERROR')
      expect(result.message).toBe(
        'Failed to save changes. Please try again.'
      )
    })

    it('handles an unknown error type (e.g., string) and returns 500', () => {
      const result = handleApiError(
        'just a string',
        context,
        requestId
      )
      expect(result.statusCode).toBe(500)
      expect(result.code).toBe('SERVER_ERROR')
      expect(result.message).toBe(
        'An unexpected error occurred. Please contact support.'
      )
      expect(result.details).toBeUndefined()
    })

    it('handles null as an unknown error', () => {
      const result = handleApiError(null, context, requestId)
      expect(result.statusCode).toBe(500)
      expect(result.code).toBe('SERVER_ERROR')
      expect(result.message).toBe(
        'An unexpected error occurred. Please contact support.'
      )
    })

    it('handles a number as an unknown error', () => {
      const result = handleApiError(42, context, requestId)
      expect(result.statusCode).toBe(500)
      expect(result.code).toBe('SERVER_ERROR')
    })

    it('passes userId through when provided', () => {
      const error = new ApiError(400, 'BAD_REQUEST', 'Bad')
      const result = handleApiError(error, context, requestId, 'user-abc')
      expect(result.statusCode).toBe(400)
    })
  })
})
