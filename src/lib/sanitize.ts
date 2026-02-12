/**
 * HTML escape utility to prevent XSS in email templates and HTML responses.
 */

const ESCAPE_MAP: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
}

/**
 * Escape HTML special characters to prevent XSS injection.
 */
export function escapeHtml(str: string | null | undefined): string {
  if (!str) return ''
  return String(str).replace(/[&<>"']/g, (ch) => ESCAPE_MAP[ch] || ch)
}

/**
 * Strip HTML tags and trim a string to a maximum length.
 */
export function sanitizeString(str: string | null | undefined, maxLength = 255): string {
  if (!str) return ''
  return String(str).replace(/<[^>]*>/g, '').trim().slice(0, maxLength)
}

/**
 * Sanitize and validate an email address.
 * Returns the trimmed, lowercased email or null if invalid.
 */
export function sanitizeEmail(email: string | null | undefined): string | null {
  if (!email) return null
  const trimmed = String(email).trim().toLowerCase()
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(trimmed) || trimmed.length > 254) return null
  return trimmed
}
