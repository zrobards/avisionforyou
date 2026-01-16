import { z } from 'zod'

/**
 * PHASE 1 VALIDATION SCHEMAS
 * 
 * All input validation schemas for API endpoints.
 * Used to ensure data integrity, type safety, and security.
 * 
 * Validation flow:
 * 1. Request body parsed as JSON
 * 2. Schema validates and coerces types
 * 3. Error returned if invalid (400 response)
 * 4. Data passed to database layer
 */

// Social Media Statistics Schema
export const SocialStatsSchema = z.object({
  facebook: z.coerce.number().int().min(0).max(10000000),
  instagram: z.coerce.number().int().min(0).max(10000000),
  twitter: z.coerce.number().int().min(0).max(10000000),
  linkedin: z.coerce.number().int().min(0).max(10000000),
  tiktok: z.coerce.number().int().min(0).max(10000000),
})

export type SocialStats = z.infer<typeof SocialStatsSchema>

// Newsletter Schema
export const NewsletterSchema = z.object({
  title: z.string().min(1).max(500),
  excerpt: z.string().max(500).optional().or(z.literal('')),
  content: z.string().min(10).max(50000),
  imageUrl: z.string().url().optional(),
  status: z.enum(['DRAFT', 'PUBLISHED']),
})

export type Newsletter = z.infer<typeof NewsletterSchema>

// Meeting/Program Session Schema
export const MeetingSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(1000),
  program: z.string().min(1).max(200).optional(),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  format: z.enum(['ONLINE', 'IN_PERSON']),
  location: z.string().min(1).max(500).optional(),
  link: z.string().url().optional(),
}).refine(
  (data) => new Date(data.endTime) > new Date(data.startTime),
  { message: "End time must be after start time", path: ["endTime"] }
).refine(
  (data) => data.format === 'IN_PERSON' ? !!data.location : true,
  { message: "Location required for in-person meetings", path: ["location"] }
).refine(
  (data) => data.format === 'ONLINE' ? !!data.link : true,
  { message: "Meeting link required for online meetings", path: ["link"] }
)

export type Meeting = z.infer<typeof MeetingSchema>

// Donation Schema
export const DonationSchema = z.object({
  amount: z.coerce.number().int().min(100).max(100000000), // cents: $1 to $1,000,000
  email: z.string().email(),
  name: z.string().min(1).max(200),
  frequency: z.enum(['ONE_TIME', 'MONTHLY', 'YEARLY']),
})

export type Donation = z.infer<typeof DonationSchema>

// Admission Application Schema
export const AdmissionSchema = z.object({
  name: z.string().min(1).max(200),
  email: z.string().email(),
  phone: z.string().min(10).max(20).optional(),
  program: z.string().min(1).max(200),
  message: z.string().min(10).max(5000),
})

export type Admission = z.infer<typeof AdmissionSchema>

// Contact Form Schema
export const ContactSchema = z.object({
  name: z.string().min(1).max(200),
  email: z.string().email(),
  subject: z.string().min(1).max(200),
  message: z.string().min(10).max(5000),
})

export type Contact = z.infer<typeof ContactSchema>

/**
 * Validation Helper
 * 
 * Usage in API routes:
 * try {
 *   const data = await validateRequest(req, SocialStatsSchema)
 *   // data is now typed and validated
 * } catch (error) {
 *   return handleValidationError(error)
 * }
 */
export async function validateRequest<T>(
  req: Request,
  schema: z.ZodSchema<T>
): Promise<T> {
  const body = await req.json()
  return schema.parse(body)
}

/**
 * Get validation errors in user-friendly format
 */
export function getValidationErrors(error: z.ZodError): string[] {
  return error.errors.map(err => {
    const path = err.path.join('.')
    return `${path}: ${err.message}`
  })
}
