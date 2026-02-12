/**
 * Currency Utilities
 *
 * Helper functions for formatting and converting currency values.
 * All monetary values in the database are stored in cents (integers)
 * to avoid floating-point precision issues.
 */

// ============================================================================
// Constants
// ============================================================================

/**
 * Default currency configuration
 */
export const CURRENCY_CONFIG = {
  currency: 'USD',
  locale: 'en-US',
  symbol: '$',
} as const;

// ============================================================================
// Formatting Functions
// ============================================================================

/**
 * Formats cents as a currency string (e.g., 15000 -> "$150.00")
 *
 * @param cents - Amount in cents
 * @param options - Formatting options
 * @returns Formatted currency string
 */
export function formatCents(
  cents: number,
  options: {
    showSymbol?: boolean;
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
  } = {}
): string {
  const {
    showSymbol = true,
    minimumFractionDigits = 2,
    maximumFractionDigits = 2,
  } = options;

  const dollars = cents / 100;

  if (showSymbol) {
    return new Intl.NumberFormat(CURRENCY_CONFIG.locale, {
      style: 'currency',
      currency: CURRENCY_CONFIG.currency,
      minimumFractionDigits,
      maximumFractionDigits,
    }).format(dollars);
  }

  return new Intl.NumberFormat(CURRENCY_CONFIG.locale, {
    style: 'decimal',
    minimumFractionDigits,
    maximumFractionDigits,
  }).format(dollars);
}

/**
 * Formats cents as a compact currency string for display (e.g., 150000 -> "$1.5K")
 *
 * @param cents - Amount in cents
 * @returns Compact formatted string
 */
export function formatCentsCompact(cents: number): string {
  const dollars = cents / 100;

  if (dollars >= 1000000) {
    return `$${(dollars / 1000000).toFixed(1)}M`;
  }
  if (dollars >= 1000) {
    return `$${(dollars / 1000).toFixed(1)}K`;
  }
  return formatCents(cents);
}

/**
 * Formats a number as currency without cents suffix (for input display)
 *
 * @param value - Amount (can be in dollars or cents depending on context)
 * @returns Formatted string
 */
export function formatCurrencyInput(value: number): string {
  return new Intl.NumberFormat(CURRENCY_CONFIG.locale, {
    style: 'decimal',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

// ============================================================================
// Conversion Functions
// ============================================================================

/**
 * Converts dollars to cents
 *
 * @param dollars - Amount in dollars
 * @returns Amount in cents (rounded to nearest integer)
 */
export function dollarsToCents(dollars: number): number {
  return Math.round(dollars * 100);
}

/**
 * Converts cents to dollars
 *
 * @param cents - Amount in cents
 * @returns Amount in dollars
 */
export function centsToDollars(cents: number): number {
  return cents / 100;
}

/**
 * Parses a currency string into cents.
 * Handles formats like "$1,234.56", "1234.56", "1,234"
 *
 * @param value - Currency string to parse
 * @returns Amount in cents, or null if parsing fails
 */
export function parseCurrencyToCents(value: string): number | null {
  // Remove currency symbols, commas, and whitespace
  const cleaned = value.replace(/[$,\s]/g, '').trim();

  if (!cleaned) {
    return null;
  }

  const parsed = parseFloat(cleaned);

  if (isNaN(parsed)) {
    return null;
  }

  return dollarsToCents(parsed);
}

// ============================================================================
// Tax Calculations
// ============================================================================

/**
 * Formats a tax rate for display (e.g., 0.07 -> "7%")
 *
 * @param rate - Tax rate as decimal (e.g., 0.07 for 7%)
 * @returns Formatted percentage string
 */
export function formatTaxRate(rate: number): string {
  return `${(rate * 100).toFixed(rate * 100 % 1 === 0 ? 0 : 2)}%`;
}

/**
 * Parses a percentage string into a decimal rate.
 * Handles formats like "7%", "7.5%", "7", "0.07"
 *
 * @param value - Percentage string to parse
 * @returns Tax rate as decimal, or null if parsing fails
 */
export function parseTaxRate(value: string): number | null {
  const cleaned = value.replace(/[%\s]/g, '').trim();

  if (!cleaned) {
    return null;
  }

  const parsed = parseFloat(cleaned);

  if (isNaN(parsed)) {
    return null;
  }

  // If value appears to be a percentage (> 1), convert to decimal
  if (parsed > 1) {
    return parsed / 100;
  }

  return parsed;
}

/**
 * Calculates tax amount from subtotal and rate
 *
 * @param subtotalCents - Subtotal in cents
 * @param taxRate - Tax rate as decimal
 * @returns Tax amount in cents
 */
export function calculateTax(subtotalCents: number, taxRate: number): number {
  return Math.round(subtotalCents * taxRate);
}

// ============================================================================
// Validation
// ============================================================================

/**
 * Validates that a value is a valid positive currency amount in cents
 *
 * @param cents - Amount to validate
 * @returns true if valid
 */
export function isValidCentsAmount(cents: number): boolean {
  return Number.isInteger(cents) && cents >= 0 && cents <= Number.MAX_SAFE_INTEGER;
}

/**
 * Validates that a value is a valid tax rate (0-1)
 *
 * @param rate - Tax rate to validate
 * @returns true if valid
 */
export function isValidTaxRate(rate: number): boolean {
  return typeof rate === 'number' && rate >= 0 && rate <= 1;
}
