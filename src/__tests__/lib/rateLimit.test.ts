import { describe, it, expect } from 'vitest'
import { checkRateLimit } from '@/lib/rateLimit'

describe('checkRateLimit (in-memory)', () => {
  it('allows first request', () => {
    const result = checkRateLimit('test-key-1', 5, 60)
    expect(result.allowed).toBe(true)
  })

  it('allows requests within limit', () => {
    const key = 'test-key-2'
    for (let i = 0; i < 4; i++) {
      expect(checkRateLimit(key, 5, 60).allowed).toBe(true)
    }
  })

  it('blocks requests over limit', () => {
    const key = 'test-key-3'
    for (let i = 0; i < 5; i++) {
      checkRateLimit(key, 5, 60)
    }
    const result = checkRateLimit(key, 5, 60)
    expect(result.allowed).toBe(false)
    expect(result.retryAfter).toBeGreaterThan(0)
  })
})
