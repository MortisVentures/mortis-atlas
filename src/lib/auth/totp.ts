/**
 * Time-based One-Time Password (TOTP) Utilities
 *
 * Implements RFC 6238 TOTP for Two-Factor Authentication
 * Uses the otpauth library for secure TOTP generation/verification
 *
 * Required package: pnpm add otpauth qrcode
 */

import { randomBytes, createHmac } from "crypto";

// ============================================
// Configuration
// ============================================

const TOTP_CONFIG = {
  issuer: "Mortis Atlas",
  algorithm: "SHA1" as const,
  digits: 6,
  period: 30, // seconds
  secretLength: 20, // bytes (160 bits)
};

// ============================================
// Secret Generation & Encoding
// ============================================

/**
 * Generate a cryptographically secure random secret
 */
export function generateSecret(): string {
  const buffer = randomBytes(TOTP_CONFIG.secretLength);
  return base32Encode(buffer);
}

/**
 * Base32 encoding (RFC 4648)
 */
function base32Encode(buffer: Buffer): string {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  let result = "";
  let bits = 0;
  let value = 0;

  for (let i = 0; i < buffer.length; i++) {
    const byte = buffer[i];
    value = (value << 8) | byte;
    bits += 8;

    while (bits >= 5) {
      result += alphabet[(value >>> (bits - 5)) & 0x1f];
      bits -= 5;
    }
  }

  if (bits > 0) {
    result += alphabet[(value << (5 - bits)) & 0x1f];
  }

  return result;
}

/**
 * Base32 decoding (RFC 4648)
 */
function base32Decode(encoded: string): Buffer {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  const cleanedInput = encoded.toUpperCase().replace(/[^A-Z2-7]/g, "");

  let bits = 0;
  let value = 0;
  const output: number[] = [];

  for (const char of cleanedInput) {
    const index = alphabet.indexOf(char);
    if (index === -1) continue;

    value = (value << 5) | index;
    bits += 5;

    if (bits >= 8) {
      output.push((value >>> (bits - 8)) & 0xff);
      bits -= 8;
    }
  }

  return Buffer.from(output);
}

// ============================================
// TOTP Generation & Verification
// ============================================

/**
 * Generate TOTP code for a given secret and time
 */
export function generateTOTP(secret: string, time?: number): string {
  const now = time ?? Math.floor(Date.now() / 1000);
  const counter = Math.floor(now / TOTP_CONFIG.period);

  const secretBuffer = base32Decode(secret);
  const counterBuffer = Buffer.alloc(8);
  counterBuffer.writeBigInt64BE(BigInt(counter));

  const hmac = createHmac("sha1", secretBuffer);
  hmac.update(counterBuffer);
  const hash = hmac.digest();

  // Dynamic truncation
  const offset = hash[hash.length - 1] & 0x0f;
  const code =
    ((hash[offset] & 0x7f) << 24) |
    ((hash[offset + 1] & 0xff) << 16) |
    ((hash[offset + 2] & 0xff) << 8) |
    (hash[offset + 3] & 0xff);

  const otp = code % Math.pow(10, TOTP_CONFIG.digits);
  return otp.toString().padStart(TOTP_CONFIG.digits, "0");
}

/**
 * Verify a TOTP code with a time window tolerance
 * Allows for clock drift by checking adjacent time windows
 */
export function verifyTOTP(
  secret: string,
  token: string,
  window: number = 1
): boolean {
  if (!token || token.length !== TOTP_CONFIG.digits) {
    return false;
  }

  const now = Math.floor(Date.now() / 1000);

  // Check current and adjacent time windows
  for (let i = -window; i <= window; i++) {
    const time = now + i * TOTP_CONFIG.period;
    const expectedToken = generateTOTP(secret, time);

    if (timingSafeEqual(token, expectedToken)) {
      return true;
    }
  }

  return false;
}

/**
 * Timing-safe string comparison to prevent timing attacks
 */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;

  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

// ============================================
// QR Code & URI Generation
// ============================================

/**
 * Generate otpauth:// URI for authenticator apps
 */
export function generateTOTPUri(
  secret: string,
  email: string,
  issuer: string = TOTP_CONFIG.issuer
): string {
  const encodedIssuer = encodeURIComponent(issuer);
  const encodedEmail = encodeURIComponent(email);

  return `otpauth://totp/${encodedIssuer}:${encodedEmail}?secret=${secret}&issuer=${encodedIssuer}&algorithm=${TOTP_CONFIG.algorithm}&digits=${TOTP_CONFIG.digits}&period=${TOTP_CONFIG.period}`;
}

/**
 * Generate QR code as data URL
 * Returns undefined if qrcode package is not available
 * Frontend can use a client-side QR generator as fallback
 */
export async function generateQRCode(_uri: string): Promise<string | undefined> {
  // QR code generation is optional - frontend can use a client-side library
  // To enable server-side QR generation: pnpm add qrcode @types/qrcode
  // For now, return undefined and let the frontend handle it
  return undefined;
}

// ============================================
// Backup Codes
// ============================================

/**
 * Generate backup codes for account recovery
 * Returns array of 10 unique 8-character codes
 */
export function generateBackupCodes(count: number = 10): string[] {
  const codes: string[] = [];

  for (let i = 0; i < count; i++) {
    // Generate 8-character alphanumeric codes
    const code = randomBytes(4)
      .toString("hex")
      .toUpperCase()
      .slice(0, 8);
    codes.push(`${code.slice(0, 4)}-${code.slice(4)}`);
  }

  return codes;
}

/**
 * Verify a backup code
 * Returns the index of the matched code, or -1 if not found
 */
export function verifyBackupCode(
  code: string,
  backupCodes: string[]
): number {
  const normalizedCode = code.toUpperCase().replace(/[^A-Z0-9]/g, "");

  for (let i = 0; i < backupCodes.length; i++) {
    const normalizedBackup = backupCodes[i].toUpperCase().replace(/[^A-Z0-9]/g, "");
    if (timingSafeEqual(normalizedCode, normalizedBackup)) {
      return i;
    }
  }

  return -1;
}

// ============================================
// Secret Encryption (for database storage)
// ============================================

/**
 * Simple encryption for storing secrets
 * In production, use a proper encryption service (e.g., AWS KMS)
 */
export function encryptSecret(secret: string): string {
  const key = process.env.TOTP_ENCRYPTION_KEY || process.env.NEXTAUTH_SECRET;
  if (!key) {
    throw new Error("No encryption key available");
  }

  // Simple XOR-based obfuscation + base64
  // For production, use AES-256-GCM
  const keyBuffer = Buffer.from(key);
  const secretBuffer = Buffer.from(secret);
  const encrypted = Buffer.alloc(secretBuffer.length);

  for (let i = 0; i < secretBuffer.length; i++) {
    encrypted[i] = secretBuffer[i] ^ keyBuffer[i % keyBuffer.length];
  }

  return encrypted.toString("base64");
}

/**
 * Decrypt a stored secret
 */
export function decryptSecret(encryptedSecret: string): string {
  const key = process.env.TOTP_ENCRYPTION_KEY || process.env.NEXTAUTH_SECRET;
  if (!key) {
    throw new Error("No encryption key available");
  }

  const keyBuffer = Buffer.from(key);
  const encrypted = Buffer.from(encryptedSecret, "base64");
  const decrypted = Buffer.alloc(encrypted.length);

  for (let i = 0; i < encrypted.length; i++) {
    decrypted[i] = encrypted[i] ^ keyBuffer[i % keyBuffer.length];
  }

  return decrypted.toString();
}

// ============================================
// Types
// ============================================

export interface TOTPSetupData {
  secret: string;
  uri: string;
  qrCode?: string;
  backupCodes: string[];
}

/**
 * Generate complete 2FA setup data for a user
 */
export async function createTOTPSetup(email: string): Promise<TOTPSetupData> {
  const secret = generateSecret();
  const uri = generateTOTPUri(secret, email);
  const backupCodes = generateBackupCodes();

  let qrCode: string | undefined;
  try {
    qrCode = await generateQRCode(uri);
  } catch {
    // QR code generation optional
  }

  return {
    secret,
    uri,
    qrCode,
    backupCodes,
  };
}
