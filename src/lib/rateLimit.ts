/**
 * RATE LIMITING WITH UPSTASH REDIS
 *
 * Uses @upstash/ratelimit with sliding window strategy.
 * Gracefully degrades to a no-op (always allow) when
 * UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN are not set.
 */

import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

// ---------------------------------------------------------------------------
// Redis client (nullable for graceful degradation)
// ---------------------------------------------------------------------------
const redis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      })
    : null

// ---------------------------------------------------------------------------
// Helper: build a limiter or null
// ---------------------------------------------------------------------------
function createLimiter(
  tokens: number,
  windowSeconds: number,
  prefix: string
): Ratelimit | null {
  if (!redis) return null

  // Upstash Ratelimit accepts a duration string like "10 s", "60 s", etc.
  const window = `${windowSeconds} s` as Parameters<typeof Ratelimit.slidingWindow>[1]

  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(tokens, window),
    prefix: `ratelimit:${prefix}`,
    analytics: true,
  })
}

// ---------------------------------------------------------------------------
// Pre-built limiter instances
// ---------------------------------------------------------------------------

/** General API limiter: 10 requests per 10 seconds */
export const generalLimiter = createLimiter(10, 10, 'general')

/** Auth endpoints (signup / login): 3 requests per 60 seconds */
export const authLimiter = createLimiter(3, 60, 'auth')

/** Contact form: 5 requests per 60 seconds */
export const contactLimiter = createLimiter(5, 60, 'contact')

/** Newsletter subscribe: 3 requests per 60 seconds */
export const newsletterLimiter = createLimiter(3, 60, 'newsletter')

/** Donation endpoint: 5 requests per 3600 seconds (1 hour) */
export const donateLimiter = createLimiter(5, 3600, 'donate')

/** Admission IP limiter: 10 requests per 86400 seconds (1 day) */
export const admissionIpLimiter = createLimiter(10, 86400, 'admission-ip')

/** Admission email limiter: 1 request per 86400 seconds (1 day) */
export const admissionEmailLimiter = createLimiter(1, 86400, 'admission-email')

/** RSVP actions: 10 requests per 60 seconds */
export const rsvpLimiter = createLimiter(10, 60, 'rsvp')

/** Media uploads: 5 requests per 60 seconds */
export const mediaUploadLimiter = createLimiter(5, 60, 'media-upload')

/** Admin mutations: 20 requests per 60 seconds */
export const adminMutationLimiter = createLimiter(20, 60, 'admin-mutation')

/** Assessment submissions: 5 requests per hour */
export const assessmentLimiter = createLimiter(5, 3600, 'assessment')

/** DUI class registrations: 5 requests per hour */
export const duiRegistrationLimiter = createLimiter(5, 3600, 'dui-registration')

// ---------------------------------------------------------------------------
// Rate limit result type (used by all consumers)
// ---------------------------------------------------------------------------
export interface RateLimitResult {
  success: boolean
  remaining: number
}

// ---------------------------------------------------------------------------
// Core rateLimit function
// ---------------------------------------------------------------------------

/**
 * Check rate limit for a given identifier against a specific limiter.
 *
 * If no Redis is configured (limiter is null), requests are always allowed.
 *
 * @param limiter  - One of the pre-built Ratelimit instances (or null)
 * @param identifier - Unique key, typically an IP address or user ID
 * @returns `{ success, remaining }`
 */
export async function rateLimit(
  limiter: Ratelimit | null,
  identifier: string
): Promise<RateLimitResult> {
  // Graceful degradation: always allow when Redis is not configured
  if (!limiter) {
    return { success: true, remaining: -1 }
  }

  const result = await limiter.limit(identifier)
  return {
    success: result.success,
    remaining: result.remaining,
  }
}

// ---------------------------------------------------------------------------
// IP extraction helper (unchanged from previous implementation)
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Simple in-memory rate limiter (for admin-only routes)
// ---------------------------------------------------------------------------

const rateLimitStore = new Map<string, { count: number; resetAt: number }>()

/**
 * Simple in-memory rate limit check.
 * Used by admin routes where Redis-level limiting is not needed.
 */
export function checkRateLimit(
  key: string,
  limit: number,
  windowSeconds: number
): { allowed: boolean; retryAfter?: number } {
  const now = Date.now()
  const entry = rateLimitStore.get(key)

  if (!entry || now > entry.resetAt) {
    rateLimitStore.set(key, { count: 1, resetAt: now + windowSeconds * 1000 })
    return { allowed: true }
  }

  if (entry.count >= limit) {
    const retryAfter = Math.ceil((entry.resetAt - now) / 1000)
    return { allowed: false, retryAfter }
  }

  entry.count++
  return { allowed: true }
}
