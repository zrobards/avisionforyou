import { parsePhoneNumber, isValidPhoneNumber, CountryCode } from "libphonenumber-js";

/**
 * Format a phone number for display
 */
export function formatPhoneNumber(phone: string, country: CountryCode = "US"): string {
  try {
    if (!phone) return "";
    
    const phoneNumber = parsePhoneNumber(phone, country);
    return phoneNumber.formatInternational();
  } catch (error) {
    // If parsing fails, return original
    return phone;
  }
}

/**
 * Format phone number for storage (E.164 format)
 */
export function formatPhoneForStorage(phone: string, country: CountryCode = "US"): string {
  try {
    if (!phone) return "";
    
    const phoneNumber = parsePhoneNumber(phone, country);
    return phoneNumber.format("E.164");
  } catch (error) {
    // If parsing fails, return original
    return phone;
  }
}

/**
 * Validate a phone number
 */
export function validatePhoneNumber(phone: string, country: CountryCode = "US"): {
  valid: boolean;
  error?: string;
  formatted?: string;
} {
  try {
    if (!phone) {
      return { valid: false, error: "Phone number is required" };
    }
    
    const valid = isValidPhoneNumber(phone, country);
    
    if (!valid) {
      return { valid: false, error: "Invalid phone number" };
    }
    
    const phoneNumber = parsePhoneNumber(phone, country);
    return {
      valid: true,
      formatted: phoneNumber.formatInternational(),
    };
  } catch (error) {
    return { valid: false, error: "Invalid phone number format" };
  }
}

/**
 * Get country code from phone number
 */
export function getCountryFromPhone(phone: string): CountryCode | undefined {
  try {
    const phoneNumber = parsePhoneNumber(phone);
    return phoneNumber.country;
  } catch {
    return undefined;
  }
}

/**
 * Mask phone number for display (show last 4 digits)
 */
export function maskPhoneNumber(phone: string): string {
  try {
    if (!phone) return "";
    
    const phoneNumber = parsePhoneNumber(phone);
    const national = phoneNumber.formatNational();
    const digits = national.replace(/\D/g, "");
    
    if (digits.length <= 4) return phone;
    
    const lastFour = digits.slice(-4);
    return `****-****-${lastFour}`;
  } catch {
    return phone;
  }
}










