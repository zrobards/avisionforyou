/**
 * PHASE 1 RATE LIMITING
 * 
 * Simple in-memory rate limiting for MVP
 * Can be upgraded to Redis/Upstash in Phase 2
 */

interface RateLimitEntry {
  count: number
  resetAt: number
}

// In-memory store: key -> { count, resetAt }
const rateLimitStore = new Map<string, RateLimitEntry>()

/**
 * Clean up expired entries every 5 minutes
 */
setInterval(() => {
  const now = Date.now()
  const expired: string[] = []

  rateLimitStore.forEach((entry, key) => {
    if (entry.resetAt < now) {
      expired.push(key)
    }
  })

  expired.forEach(key => rateLimitStore.delete(key))
}, 5 * 60 * 1000)

/**
 * Rate limit result
 */
export interface RateLimitResult {
  allowed: boolean
  limit: number
  remaining: number
  resetAt: Date
  retryAfter?: number // seconds
}

/**
 * Check rate limit
 * 
 * @param key - Unique identifier (e.g., "ip:192.168.1.1", "user:123")
 * @param limit - Max requests allowed
 * @param windowSeconds - Time window in seconds
 * @returns Rate limit result
 * 
 * Usage:
 * const result = checkRateLimit('ip:192.168.1.1', 5, 3600)
 * if (!result.allowed) {
 *   return rateLimitResponse(result.retryAfter || 60)
 * }
 */
export function checkRateLimit(
  key: string,
  limit: number,
  windowSeconds: number
): RateLimitResult {
  const now = Date.now()
  const entry = rateLimitStore.get(key)

  // First request in window
  if (!entry || entry.resetAt < now) {
    rateLimitStore.set(key, {
      count: 1,
      resetAt: now + windowSeconds * 1000
    })

    return {
      allowed: true,
      limit,
      remaining: limit - 1,
      resetAt: new Date(now + windowSeconds * 1000)
    }
  }

  // Within window
  const remaining = Math.max(0, limit - entry.count - 1)
  const allowed = entry.count < limit
  const retryAfter = Math.ceil((entry.resetAt - now) / 1000)

  if (allowed) {
    entry.count++
  }

  return {
    allowed,
    limit,
    remaining,
    resetAt: new Date(entry.resetAt),
    retryAfter
  }
}

/**
 * Get client IP from request
 * 
 * Handles:
 * - Direct connections
 * - Cloudflare proxy
 * - AWS ALB
 * - Vercel
 */
export function getClientIp(req: Request): string {
  const forwardedFor = req.headers.get('x-forwarded-for')
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim()
  }

  const realIp = req.headers.get('x-real-ip')
  if (realIp) {
    return realIp
  }

  // Fallback (should not happen in production)
  return 'unknown'
}

/**
 * Predefined rate limits for common scenarios
 */
export const RATE_LIMITS = {
  // Donation endpoint: 5 per IP per hour
  DONATION: { limit: 5, windowSeconds: 3600 },

  // Admission applications: 10 per IP per day, 1 per email per 24hrs
  ADMISSION: { limit: 10, windowSeconds: 86400 },
  ADMISSION_EMAIL: { limit: 1, windowSeconds: 86400 },

  // Contact form: 5 per IP per day
  CONTACT: { limit: 5, windowSeconds: 86400 },

  // Admin endpoints: 100 per user per minute (logging only, not enforcing)
  ADMIN: { limit: 100, windowSeconds: 60 },

  // RSVP actions: 10 per IP per minute
  RSVP: { limit: 10, windowSeconds: 60 },

  // Media uploads: 5 per user per minute
  MEDIA_UPLOAD: { limit: 5, windowSeconds: 60 },

  // Admin mutations: 20 per user per minute
  ADMIN_MUTATION: { limit: 20, windowSeconds: 60 },
} as const
