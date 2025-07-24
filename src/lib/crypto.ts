import crypto from 'crypto';
import bcrypt from 'bcryptjs';

/**
 * Crypto utilities for securely handling sensitive configuration data
 * Uses AES-256-GCM encryption for maximum security
 */

const ALGORITHM = 'aes-256-gcm';
const SALT_LENGTH = 64; // 64 bytes
const TAG_LENGTH = 16; // 16 bytes
const KEY_LENGTH = 32; // 256 bits

/**
 * Derive a key from the encryption key using PBKDF2
 */
function deriveKey(encryptionKey: string, salt: Buffer): Buffer {
  return crypto.pbkdf2Sync(encryptionKey, salt, 100000, KEY_LENGTH, 'sha512');
}

/**
 * Encrypt sensitive data
 */
export function encrypt(text: string, encryptionKey: string): string {
  try {
    const salt = crypto.randomBytes(SALT_LENGTH);
    const key = deriveKey(encryptionKey, salt);
    
    const cipher = crypto.createCipher(ALGORITHM, key);
    cipher.setAAD(salt); // Additional authenticated data
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const tag = cipher.getAuthTag();
    
    // Combine salt + tag + encrypted data
    const combined = Buffer.concat([salt, tag, Buffer.from(encrypted, 'hex')]);
    
    return combined.toString('base64');
  } catch (error) {
    throw new Error(`Encryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Decrypt sensitive data
 */
export function decrypt(encryptedData: string, encryptionKey: string): string {
  try {
    const combined = Buffer.from(encryptedData, 'base64');
    
    // Extract components
    const salt = combined.subarray(0, SALT_LENGTH);
    const tag = combined.subarray(SALT_LENGTH, SALT_LENGTH + TAG_LENGTH);
    const encrypted = combined.subarray(SALT_LENGTH + TAG_LENGTH);
    
    const key = deriveKey(encryptionKey, salt);
    
    const decipher = crypto.createDecipher(ALGORITHM, key);
    decipher.setAAD(salt);
    decipher.setAuthTag(tag);
    
    let decrypted = decipher.update(encrypted, undefined, 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    throw new Error(`Decryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Hash a password using bcrypt-compatible method
 */
export function hashPassword(password: string): string {
  return bcrypt.hashSync(password, 12);
}

/**
 * Verify a password against a hash
 */
export function verifyPassword(password: string, hash: string): boolean {
  return bcrypt.compareSync(password, hash);
}

/**
 * Generate a secure random key
 */
export function generateSecureKey(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * Generate a JWT secret
 */
export function generateJWTSecret(): string {
  return generateSecureKey(64);
}

/**
 * Generate an encryption key
 */
export function generateEncryptionKey(): string {
  return generateSecureKey(32);
}

/**
 * Create a secure hash of sensitive data for comparison purposes
 */
export function createHash(data: string): string {
  return crypto.createHash('sha256').update(data).digest('hex');
}

/**
 * Securely compare two strings to prevent timing attacks
 */
export function secureCompare(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }
  
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  
  return result === 0;
}

/**
 * Validate encryption key format and length
 */
export function validateEncryptionKey(key: string): boolean {
  return typeof key === 'string' && key.length >= 32;
}

/**
 * Mask sensitive data for logging (shows only first 4 and last 4 characters)
 */
export function maskSensitiveData(data: string): string {
  if (data.length <= 8) {
    return '***';
  }
  
  return `${data.substring(0, 4)}***${data.substring(data.length - 4)}`;
} 