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
  linkedin: z.coerce.number().int().min(0).max(10000000),
  tiktok: z.coerce.number().int().min(0).max(10000000),
})

// Newsletter Schema
export const NewsletterSchema = z.object({
  title: z.string().min(1).max(500),
  excerpt: z.string().max(500).optional().or(z.literal('')),
  content: z.string().min(10).max(50000),
  imageUrl: z.string().url().optional().or(z.literal('')),
  status: z.enum(['DRAFT', 'PUBLISHED']),
})

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
  capacity: z.coerce.number().int().min(1).max(1000).optional(),
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

// Donation Schema (amount in dollars, not cents)
export const DonationSchema = z.object({
  amount: z.coerce.number().min(1).max(1000000),
  email: z.string().email(),
  name: z.string().min(1).max(200),
  frequency: z.enum(['ONE_TIME', 'MONTHLY', 'YEARLY']),
})

// Admission Application Schema
export const AdmissionSchema = z.object({
  name: z.string().min(1).max(200),
  email: z.string().email(),
  phone: z.string().min(10).max(20).optional(),
  program: z.string().min(1).max(200),
  message: z.string().min(10).max(5000),
})

// Contact Form Schema
export const ContactSchema = z.object({
  name: z.string().min(1).max(200),
  email: z.string().email(),
  phone: z.string().min(10).max(20).optional(),
  department: z.enum(['general', 'programs', 'donate', 'volunteer', 'press', 'careers']).optional(),
  subject: z.string().min(1).max(200),
  message: z.string().min(10).max(5000),
})

// DUI Class Schema (price in dollars, converted to cents in route)
export const DUIClassSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(5000).optional().or(z.literal('')),
  date: z.string().min(1, 'Date is required'),
  startTime: z.string().min(1, 'Start time is required').max(20),
  endTime: z.string().min(1, 'End time is required').max(20),
  location: z.string().min(1, 'Location is required').max(500),
  price: z.coerce.number().min(0).max(100000),
  capacity: z.coerce.number().int().min(1).max(1000),
  instructor: z.string().max(200).optional().or(z.literal('')),
  active: z.boolean().optional().default(true),
})

// Team Member Schema
export const TeamMemberSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  title: z.string().min(1, 'Title is required').max(200),
  bio: z.string().max(5000).optional().or(z.literal('')),
  email: z.string().email().optional().or(z.literal('')).or(z.literal(null)),
  phone: z.string().max(20).optional().or(z.literal('')).or(z.literal(null)),
  imageUrl: z.string().url().optional().or(z.literal('')).or(z.literal(null)),
})

// Community Announcement Schema
export const AnnouncementSchema = z.object({
  title: z.string().min(1, 'Title is required').max(500),
  content: z.string().min(1, 'Content is required').max(50000),
  published: z.boolean().optional().default(false),
})

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
