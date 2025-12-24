import crypto from "crypto";

// Encryption algorithm
const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16;
const SALT_LENGTH = 64;
const TAG_LENGTH = 16;
const KEY_LENGTH = 32;

/**
 * Get encryption key from environment variable
 * In production, this should be a secure random string (32+ characters)
 */
function getEncryptionKey(): Buffer {
  const key = process.env.ENCRYPTION_KEY || process.env.AUTH_SECRET;
  
  if (!key) {
    throw new Error("ENCRYPTION_KEY or AUTH_SECRET environment variable is required for encryption");
  }
  
  // Derive a 32-byte key using PBKDF2
  return crypto.pbkdf2Sync(key, "salt", 100000, KEY_LENGTH, "sha512");
}

/**
 * Encrypt a string
 * Returns encrypted string in format: salt:iv:encrypted:tag (all base64 encoded)
 */
export function encrypt(text: string): string {
  try {
    const key = getEncryptionKey();
    
    // Generate random IV
    const iv = crypto.randomBytes(IV_LENGTH);
    
    // Create cipher
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    
    // Encrypt
    let encrypted = cipher.update(text, "utf8", "base64");
    encrypted += cipher.final("base64");
    
    // Get auth tag
    const tag = cipher.getAuthTag();
    
    // Return concatenated string
    return `${iv.toString("base64")}:${encrypted}:${tag.toString("base64")}`;
  } catch (error) {
    console.error("Encryption error:", error);
    throw new Error("Failed to encrypt data");
  }
}

/**
 * Decrypt an encrypted string
 */
export function decrypt(encryptedData: string): string {
  try {
    const key = getEncryptionKey();
    
    // Split the encrypted data
    const parts = encryptedData.split(":");
    if (parts.length !== 3) {
      throw new Error("Invalid encrypted data format");
    }
    
    const iv = Buffer.from(parts[0], "base64");
    const encrypted = parts[1];
    const tag = Buffer.from(parts[2], "base64");
    
    // Create decipher
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(tag);
    
    // Decrypt
    let decrypted = decipher.update(encrypted, "base64", "utf8");
    decrypted += decipher.final("utf8");
    
    return decrypted;
  } catch (error) {
    console.error("Decryption error:", error);
    throw new Error("Failed to decrypt data");
  }
}

/**
 * Hash a string using SHA-256
 * Useful for non-reversible hashing
 */
export function hash(text: string): string {
  return crypto.createHash("sha256").update(text).digest("hex");
}

/**
 * Generate a random token
 */
export function generateToken(length: number = 32): string {
  return crypto.randomBytes(length).toString("hex");
}

/**
 * Generate a cryptographically secure random string
 */
export function generateSecureRandom(length: number = 32): string {
  return crypto.randomBytes(Math.ceil(length / 2)).toString("hex").slice(0, length);
}

/**
 * Compare two strings in constant time to prevent timing attacks
 */
export function secureCompare(a: string, b: string): boolean {
  try {
    return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
  } catch {
    // If lengths don't match, timingSafeEqual throws an error
    return false;
  }
}









