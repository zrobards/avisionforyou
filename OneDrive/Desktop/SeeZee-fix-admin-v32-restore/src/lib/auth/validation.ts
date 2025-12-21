import { z } from "zod";

// Username validation regex (alphanumeric + underscore/dash)
const usernameRegex = /^[a-zA-Z0-9_-]+$/;

/**
 * Email schema
 */
export const emailSchema = z.string()
  .email("Invalid email address")
  .min(1, "Email is required")
  .max(255, "Email must be less than 255 characters");

/**
 * Password schema - simple validation for better UX
 * Just requires minimum 8 characters
 */
export const passwordSchema = z.string()
  .min(8, "Password must be at least 8 characters")
  .max(100, "Password must be less than 100 characters");

/**
 * Username schema
 */
export const usernameSchema = z.string()
  .min(3, "Username must be at least 3 characters")
  .max(20, "Username must be less than 20 characters")
  .regex(usernameRegex, "Username can only contain letters, numbers, underscores, and dashes");

/**
 * Sign up schema
 */
export const signupSchema = z.object({
  username: usernameSchema.optional(),
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string().min(1, "Please confirm your password"),
  tosAccepted: z.boolean().refine(val => val === true, {
    message: "You must accept the Terms of Service",
  }),
  recaptchaToken: z.string().optional(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

/**
 * Login schema
 */
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
  code: z.string().optional(), // 2FA code
});

/**
 * Change password schema
 */
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: passwordSchema,
  confirmPassword: z.string().min(1, "Please confirm your new password"),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
}).refine(data => data.currentPassword !== data.newPassword, {
  message: "New password must be different from current password",
  path: ["newPassword"],
});

/**
 * Change email schema
 */
export const changeEmailSchema = z.object({
  newEmail: emailSchema,
  password: z.string().min(1, "Password is required to change email"),
});

/**
 * Profile schema
 */
export const profileSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  bio: z.string().max(200).optional(),
  phone: z.string().optional(),
  location: z.string().max(100).optional(),
  timezone: z.string().optional(),
  // Business fields (for clients)
  company: z.string().max(100).optional(),
  organizationName: z.string().max(100).optional(),
  industry: z.string().optional(),
  organizationSize: z.string().optional(),
  websiteUrl: z.string().url().optional().or(z.literal("")),
  taxId: z.string().optional(),
  businessAddress: z.string().optional(),
  // Professional fields (for designers/admins)
  jobTitle: z.string().max(100).optional(),
  department: z.string().max(100).optional(),
  skills: z.array(z.string()).optional(),
  portfolioUrl: z.string().url().optional().or(z.literal("")),
  githubUrl: z.string().url().optional().or(z.literal("")),
  linkedinUrl: z.string().url().optional().or(z.literal("")),
  twitterUrl: z.string().url().optional().or(z.literal("")),
  yearsExperience: z.number().int().min(0).max(50).optional(),
  hourlyRate: z.number().positive().optional(),
  availabilityStatus: z.enum(["available", "busy", "away", "on_leave"]).optional(),
  // Privacy
  publicProfile: z.boolean().optional(),
});

/**
 * 2FA verify code schema
 */
export const twoFactorVerifySchema = z.object({
  code: z.string().length(6, "Code must be 6 digits").regex(/^\d+$/, "Code must be numeric"),
});

/**
 * Check password strength
 * Returns: weak, medium, or strong
 */
export function checkPasswordStrength(password: string): "weak" | "medium" | "strong" {
  if (password.length < 8) return "weak";
  
  let strength = 0;
  
  // Check length
  if (password.length >= 12) strength++;
  
  // Check for lowercase
  if (/[a-z]/.test(password)) strength++;
  
  // Check for uppercase
  if (/[A-Z]/.test(password)) strength++;
  
  // Check for numbers
  if (/\d/.test(password)) strength++;
  
  // Check for special characters
  if (/[@$!%*?&]/.test(password)) strength++;
  
  if (strength <= 2) return "weak";
  if (strength <= 4) return "medium";
  return "strong";
}

/**
 * Get password strength requirements status
 */
export function getPasswordRequirements(password: string) {
  return {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /\d/.test(password),
    hasSpecial: /[@$!%*?&]/.test(password),
  };
}

/**
 * Validate username format
 */
export function validateUsername(username: string): { valid: boolean; error?: string } {
  const result = usernameSchema.safeParse(username);
  if (result.success) {
    return { valid: true };
  }
  return { valid: false, error: result.error.errors[0]?.message };
}

/**
 * Validate email format
 */
export function validateEmail(email: string): { valid: boolean; error?: string } {
  const result = emailSchema.safeParse(email);
  if (result.success) {
    return { valid: true };
  }
  return { valid: false, error: result.error.errors[0]?.message };
}





