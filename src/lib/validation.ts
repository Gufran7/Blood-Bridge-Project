/**
 * Validation utilities for Blood Bridge
 * Enforces strict Indian mobile number standards and healthcare platform safety.
 */

// Strict 10-digit Indian mobile number format (starts with 6, 7, 8, or 9)
export const INDIAN_MOBILE_REGEX = /^[6-9]\d{9}$/;

/**
 * Validates whether a phone string contains exactly 10 digits
 * and follows the Indian mobile numbering format (starts with 6, 7, 8, or 9).
 * Rejects any alphabets, spaces, or special characters.
 */
export function isValidIndianMobile(value: string): boolean {
  if (typeof value !== 'string') return false;
  const trimmed = value.trim();
  return INDIAN_MOBILE_REGEX.test(trimmed);
}

/**
 * Detailed error message explaining why a mobile number is invalid.
 * Returns null if the number is perfectly valid.
 */
export function getIndianMobileError(value: string): string | null {
  if (!value || !value.trim()) {
    return 'Enter a 10-digit mobile number.';
  }

  const trimmed = value.trim();

  // Check for any non-digit characters (alphabets, symbols, spaces)
  if (/\D/.test(trimmed)) {
    return 'Only numeric digits (0–9) are allowed. Remove alphabets, spaces, dashes, or special characters.';
  }

  if (trimmed.length < 10) {
    return `Mobile number has only ${trimmed.length} digits. Exactly 10 digits are required.`;
  }

  if (trimmed.length > 10) {
    return `Mobile number has ${trimmed.length} digits. Please enter exactly 10 digits (without +91 or leading 0).`;
  }

  if (!/^[6-9]/.test(trimmed)) {
    return 'Indian mobile numbers must begin with 6, 7, 8, or 9.';
  }

  return null;
}

/**
 * Legacy wrapper: enforces strict 10-digit Indian mobile number validation.
 */
export function isValidPhone(value: string): boolean {
  return isValidIndianMobile(value);
}

export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function isWithinLength(value: string, min: number, max: number): boolean {
  const length = value.trim().length;
  return length >= min && length <= max;
}

/**
 * Strips non-digit characters for processing when necessary.
 */
export function sanitizePhoneDigits(value: string): string {
  return value.replace(/\D/g, '').slice(0, 10);
}
