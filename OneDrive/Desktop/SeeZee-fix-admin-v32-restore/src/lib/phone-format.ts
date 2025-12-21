/**
 * Format a phone number as (XXX) XXX-XXXX
 * @param value - The phone number string to format
 * @returns Formatted phone number string
 */
export function formatPhoneNumber(value: string): string {
  // Remove all non-numeric characters
  const numbers = value.replace(/\D/g, '');
  
  // Limit to 10 digits for US numbers
  const limitedNumbers = numbers.substring(0, 10);
  
  // Format based on length
  if (limitedNumbers.length <= 3) {
    return limitedNumbers;
  } else if (limitedNumbers.length <= 6) {
    return `(${limitedNumbers.slice(0, 3)}) ${limitedNumbers.slice(3)}`;
  } else {
    return `(${limitedNumbers.slice(0, 3)}) ${limitedNumbers.slice(3, 6)}-${limitedNumbers.slice(6)}`;
  }
}

/**
 * Extract only numeric digits from a phone number
 * @param value - The phone number string
 * @returns String with only numeric digits
 */
export function getPhoneDigits(value: string): string {
  return value.replace(/\D/g, '');
}

/**
 * Validate a US phone number (10 digits)
 * @param value - The phone number string to validate
 * @returns True if valid, false otherwise
 */
export function isValidPhoneNumber(value: string): boolean {
  const digits = getPhoneDigits(value);
  return digits.length === 10;
}

/**
 * Format phone number for display (handles international format too)
 * @param value - The phone number string
 * @returns Formatted phone number or original if not standard US format
 */
export function formatPhoneForDisplay(value: string | null | undefined): string {
  if (!value) return '';
  
  const digits = getPhoneDigits(value);
  
  // If exactly 10 digits, format as US number
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  
  // If 11 digits starting with 1, format as +1 (XXX) XXX-XXXX
  if (digits.length === 11 && digits[0] === '1') {
    return `+1 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
  }
  
  // Otherwise return as-is
  return value;
}




