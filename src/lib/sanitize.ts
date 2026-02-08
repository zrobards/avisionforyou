/**
 * Shared input sanitization utilities.
 * No external dependencies -- uses regex for HTML stripping.
 */

/**
 * Removes all HTML tags from a string.
 */
export function stripHtml(input: string): string {
  return input.replace(/<[^>]*>/g, "");
}

/**
 * Trims whitespace, removes HTML tags, and limits length.
 * @param input  - Raw string input.
 * @param maxLength - Maximum allowed length (default 1000).
 * @returns The sanitized string.
 */
export function sanitizeString(input: string, maxLength: number = 1000): string {
  const stripped = stripHtml(input).trim();
  return stripped.slice(0, maxLength);
}

/**
 * Lowercases, trims, and validates an email address.
 * Returns an empty string if the format is invalid.
 */
export function sanitizeEmail(input: string): string {
  const trimmed = input.trim().toLowerCase();
  // Basic RFC-style email check: local@domain.tld
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(trimmed) ? trimmed : "";
}

/**
 * Strips all characters except digits and a leading +, then limits
 * the digit portion to 15 characters (per E.164).
 */
export function sanitizePhone(input: string): string {
  // Preserve a leading '+' if present.
  const hasPlus = input.trimStart().startsWith("+");
  const digitsOnly = input.replace(/[^\d]/g, "").slice(0, 15);
  return hasPlus ? `+${digitsOnly}` : digitsOnly;
}

/**
 * Validates that a URL starts with http:// or https://.
 * Returns an empty string if the format is invalid.
 */
export function sanitizeUrl(input: string): string {
  const trimmed = input.trim();
  try {
    const url = new URL(trimmed);
    if (url.protocol === "http:" || url.protocol === "https:") {
      return trimmed;
    }
    return "";
  } catch {
    return "";
  }
}
