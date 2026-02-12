import {
  parsePhoneNumberFromString,
  type CountryCode,
  type PhoneNumber,
} from 'libphonenumber-js';


/**
 * Default country for phone parsing.
 * Used when phone number doesn't include country code.
 */
const DEFAULT_COUNTRY: CountryCode = 'US';


/**
 * Phone Number Utilities
 *
 * Handles phone number parsing, validation, and normalization.
 * Primary identifier for customers in the Pure Life Pools CRM system.
 *
 * Normalization rules from specification:
 * - All US phone numbers normalized to E.164 format (+1XXXXXXXXXX)
 * - Invalid numbers stored as-is (raw format) with warning
 * - Supports various input formats: (555) 123-4567, 555-123-4567, 5551234567
 */

export interface PhoneValidationResult {
  isValid: boolean;
  normalized: string;
  formatted: string;
  raw: string;
  countryCode: string | null;
  nationalNumber: string | null;
  error: string | null;
}

/**
 * Normalizes a phone number to E.164 format.
 *
 * @param phone - The raw phone number input
 * @param defaultCountry - The default country code (defaults to 'US')
 * @returns E.164 formatted number or the original input if invalid
 *
 * @example
 * normalizePhone('5551234567') // '+15551234567'
 * normalizePhone('(555) 123-4567') // '+15551234567'
 * normalizePhone('555-123-4567') // '+15551234567'
 * normalizePhone('+1 555 123 4567') // '+15551234567'
 * normalizePhone('123') // '123' (invalid, stored raw)
 */
export function normalizePhone(
  phone: string,
  defaultCountry: CountryCode = 'US'
): string {
  if (!phone || typeof phone !== 'string') {
    return phone ?? '';
  }

  const trimmed = phone.trim();
  if (!trimmed) {
    return '';
  }

  try {
    const parsed = parsePhoneNumberFromString(trimmed, defaultCountry);

    if (parsed?.isValid()) {
      return parsed.format('E.164');
    }

    // Fallback: if we have exactly 10 digits, assume US number
    const digitsOnly = trimmed.replace(/\D/g, '');
    if (digitsOnly.length === 10) {
      return `+1${digitsOnly}`;
    }

    // If it's 11 digits starting with 1, treat as US with country code
    if (digitsOnly.length === 11 && digitsOnly.startsWith('1')) {
      return `+${digitsOnly}`;
    }

    // Return raw input if we can't normalize
    return trimmed;
  } catch {
    // Return raw input on any parsing error
    return trimmed;
  }
}

/**
 * Validates a phone number and returns detailed information.
 *
 * @param phone - The phone number to validate
 * @param defaultCountry - The default country code (defaults to 'US')
 * @returns PhoneValidationResult with validation status and formatted versions
 */
export function validatePhone(
  phone: string,
  defaultCountry: CountryCode = 'US'
): PhoneValidationResult {
  const raw = phone?.trim() ?? '';

  if (!raw) {
    return {
      isValid: false,
      normalized: '',
      formatted: '',
      raw: '',
      countryCode: null,
      nationalNumber: null,
      error: 'Phone number is required',
    };
  }

  try {
    const parsed = parsePhoneNumberFromString(raw, defaultCountry);

    if (parsed?.isValid()) {
      return {
        isValid: true,
        normalized: parsed.format('E.164'),
        formatted: parsed.formatNational(),
        raw,
        countryCode: parsed.countryCallingCode ?? null,
        nationalNumber: parsed.nationalNumber ?? null,
        error: null,
      };
    }

    // Check for 10-digit US number pattern
    const digitsOnly = raw.replace(/\D/g, '');
    if (digitsOnly.length === 10) {
      // Try parsing again with explicit +1 prefix
      const withCountry = `+1${digitsOnly}`;
      const reparsed = parsePhoneNumberFromString(withCountry, defaultCountry);

      if (reparsed?.isValid()) {
        return {
          isValid: true,
          normalized: reparsed.format('E.164'),
          formatted: reparsed.formatNational(),
          raw,
          countryCode: reparsed.countryCallingCode ?? null,
          nationalNumber: reparsed.nationalNumber ?? null,
          error: null,
        };
      }
    }

    // Invalid phone number
    return {
      isValid: false,
      normalized: raw,
      formatted: raw,
      raw,
      countryCode: null,
      nationalNumber: null,
      error: 'Please enter a valid phone number',
    };
  } catch {
    return {
      isValid: false,
      normalized: raw,
      formatted: raw,
      raw,
      countryCode: null,
      nationalNumber: null,
      error: 'Unable to parse phone number',
    };
  }
}

/**
 * Formats a phone number for display (national format for US numbers).
 *
 * @param phone - The phone number (can be any format)
 * @param defaultCountry - The default country code (defaults to 'US')
 * @returns Formatted phone number string
 *
 * @example
 * formatPhone('+15551234567') // '(555) 123-4567'
 */
export function formatPhone(
  phone: string,
  defaultCountry: CountryCode = 'US'
): string {
  if (!phone) return '';

  try {
    const parsed = parsePhoneNumberFromString(phone, defaultCountry);

    if (parsed?.isValid()) {
      // Use national format for US numbers, international for others
      return parsed.country === 'US'
        ? parsed.formatNational()
        : parsed.formatInternational();
    }

    // Return raw input if parsing fails
    return phone;
  } catch {
    return phone;
  }
}

/**
 * Extracts just the digits from a phone number.
 * Useful for comparison and deduplication.
 *
 * @param phone - The phone number
 * @returns String containing only digits
 */
export function extractDigits(phone: string): string {
  return (phone ?? '').replace(/\D/g, '');
}

/**
 * Checks if two phone numbers are equivalent.
 * Normalizes both before comparison.
 *
 * @param phone1 - First phone number
 * @param phone2 - Second phone number
 * @returns true if the numbers are equivalent
 */
export function phonesMatch(phone1: string, phone2: string): boolean {
  if (!phone1 || !phone2) return false;

  const normalized1 = normalizePhone(phone1);
  const normalized2 = normalizePhone(phone2);

  return normalized1 === normalized2;
}

/**
 * Formats phone for search - strips to digits and removes leading 1.
 * Used for consistent search matching.
 *
 * @param phone - The phone number
 * @returns Digits suitable for search
 */
export function formatForSearch(phone: string): string {
  const digits = extractDigits(phone);

  // Remove leading 1 for US numbers
  if (digits.length === 11 && digits.startsWith('1')) {
    return digits.slice(1);
  }

  return digits;
}
