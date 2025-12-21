/**
 * Simple in-memory rate limiter
 * For production with multiple instances, consider using Redis
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

// Store rate limit data in memory
const rateLimitStore = new Map<string, RateLimitEntry>();

// Clean up expired entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetAt < now) {
      rateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

export interface RateLimitConfig {
  /** Maximum number of requests */
  max: number;
  /** Time window in milliseconds */
  window: number;
}

export interface RateLimitResult {
  /** Whether the request is allowed */
  allowed: boolean;
  /** Number of requests remaining */
  remaining: number;
  /** Time until reset in milliseconds */
  resetIn: number;
  /** Total limit */
  limit: number;
}

/**
 * Check rate limit for a key
 */
export function checkRateLimit(
  key: string,
  config: RateLimitConfig
): RateLimitResult {
  const now = Date.now();
  const entry = rateLimitStore.get(key);
  
  // If no entry exists or it's expired, create a new one
  if (!entry || entry.resetAt < now) {
    const newEntry: RateLimitEntry = {
      count: 1,
      resetAt: now + config.window,
    };
    rateLimitStore.set(key, newEntry);
    
    return {
      allowed: true,
      remaining: config.max - 1,
      resetIn: config.window,
      limit: config.max,
    };
  }
  
  // Check if limit is exceeded
  if (entry.count >= config.max) {
    return {
      allowed: false,
      remaining: 0,
      resetIn: entry.resetAt - now,
      limit: config.max,
    };
  }
  
  // Increment count
  entry.count++;
  rateLimitStore.set(key, entry);
  
  return {
    allowed: true,
    remaining: config.max - entry.count,
    resetIn: entry.resetAt - now,
    limit: config.max,
  };
}

/**
 * Rate limit by IP address
 */
export function rateLimitByIP(
  ip: string,
  action: string,
  config: RateLimitConfig
): RateLimitResult {
  const key = `ip:${ip}:${action}`;
  return checkRateLimit(key, config);
}

/**
 * Rate limit by user ID
 */
export function rateLimitByUser(
  userId: string,
  action: string,
  config: RateLimitConfig
): RateLimitResult {
  const key = `user:${userId}:${action}`;
  return checkRateLimit(key, config);
}

/**
 * Rate limit by email
 */
export function rateLimitByEmail(
  email: string,
  action: string,
  config: RateLimitConfig
): RateLimitResult {
  const key = `email:${email.toLowerCase()}:${action}`;
  return checkRateLimit(key, config);
}

/**
 * Reset rate limit for a key
 */
export function resetRateLimit(key: string): void {
  rateLimitStore.delete(key);
}

/**
 * Common rate limit configurations
 * More lenient in development for testing
 */
const isDevelopment = process.env.NODE_ENV === "development";

export const RateLimits = {
  /** Sign up: 3 attempts per hour per IP (production), 20 per hour (development) */
  SIGNUP: isDevelopment 
    ? { max: 20, window: 60 * 60 * 1000 }
    : { max: 3, window: 60 * 60 * 1000 },
  
  /** Login: 5 attempts per 15 minutes per IP (production), 20 per 15 minutes (development) */
  LOGIN: isDevelopment
    ? { max: 20, window: 15 * 60 * 1000 }
    : { max: 5, window: 15 * 60 * 1000 },
  
  /** Email verification resend: 3 per hour per email (production), 10 per hour (development) */
  EMAIL_VERIFY: isDevelopment
    ? { max: 10, window: 60 * 60 * 1000 }
    : { max: 3, window: 60 * 60 * 1000 },
  
  /** Password reset: 3 per hour per email (production), 10 per hour (development) */
  PASSWORD_RESET: isDevelopment
    ? { max: 10, window: 60 * 60 * 1000 }
    : { max: 3, window: 60 * 60 * 1000 },
  
  /** 2FA attempts: 5 per 5 minutes per user */
  TWO_FACTOR: { max: 5, window: 5 * 60 * 1000 },
  
  /** API calls: 100 per minute per user */
  API: { max: 100, window: 60 * 1000 },
  
  /** File upload: 10 per hour per user */
  FILE_UPLOAD: { max: 10, window: 60 * 60 * 1000 },
  
  /** Profile update: 10 per hour per user */
  PROFILE_UPDATE: { max: 10, window: 60 * 60 * 1000 },
};

/**
 * Middleware helper to check rate limit and return response if exceeded
 */
export function createRateLimitResponse(result: RateLimitResult): Response | null {
  if (!result.allowed) {
    return new Response(
      JSON.stringify({
        error: "Too many requests",
        message: `Rate limit exceeded. Try again in ${Math.ceil(result.resetIn / 1000)} seconds.`,
        retryAfter: Math.ceil(result.resetIn / 1000),
      }),
      {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          "X-RateLimit-Limit": result.limit.toString(),
          "X-RateLimit-Remaining": result.remaining.toString(),
          "X-RateLimit-Reset": new Date(Date.now() + result.resetIn).toISOString(),
          "Retry-After": Math.ceil(result.resetIn / 1000).toString(),
        },
      }
    );
  }
  
  return null;
}

/**
 * Add rate limit headers to a response
 */
export function addRateLimitHeaders(response: Response, result: RateLimitResult): Response {
  const headers = new Headers(response.headers);
  headers.set("X-RateLimit-Limit", result.limit.toString());
  headers.set("X-RateLimit-Remaining", result.remaining.toString());
  headers.set("X-RateLimit-Reset", new Date(Date.now() + result.resetIn).toISOString());
  
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}





