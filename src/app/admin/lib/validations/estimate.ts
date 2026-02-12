/**
 * Estimate Validation Schemas
 *
 * Zod schemas for estimate input validation.
 * These are the source of truth for both runtime validation and TypeScript types.
 */

import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';

/**
 * Estimate status options
 */
export const ESTIMATE_STATUSES = [
  { value: 'draft', label: 'Draft', color: 'bg-zinc-100 text-zinc-700' },
  { value: 'sent', label: 'Sent', color: 'bg-blue-50 text-blue-700' },
  { value: 'internal_final', label: 'Final', color: 'bg-amber-50 text-amber-700' },
  { value: 'converted', label: 'Converted', color: 'bg-emerald-50 text-emerald-700' },
  { value: 'declined', label: 'Declined', color: 'bg-red-50 text-red-700' },
] as const;

export type EstimateStatus = (typeof ESTIMATE_STATUSES)[number]['value'];
export type EstimateStatusValue = (typeof ESTIMATE_STATUSES)[number]['value'];

/**
 * Valid status transitions for the estimate workflow
 */
export const STATUS_TRANSITIONS: Record<EstimateStatus, EstimateStatus[]> = {
  draft: ['sent'],
  sent: ['internal_final', 'converted', 'declined'],
  internal_final: ['converted', 'declined'],
  converted: [],
  declined: ['draft'], // Can reopen a declined estimate
};


/**
 * Schema for a single line item in an estimate.
 * Matches the JSONB structure in the database.
 */
export const lineItemSchema = z.object({
  id: z.string().uuid(),

  description: z.string().min(1).max(500),

  quantity: z.number().positive().max(9999),

  unitPriceCents: z
    .number()
    .int()
    .min(0)
    .max(99999999),
});

export type LineItem = z.infer<typeof lineItemSchema>;

/**
 * Schema for creating a new line item (id is optional, will be generated)
 */
export const createLineItemSchema = lineItemSchema.omit({ id: true, total_cents: true }).extend({
  id: z.string().uuid().optional(),
});

export type CreateLineItemInput = z.infer<typeof createLineItemSchema>;

/**
 * Create estimate schema
 */
export const createEstimateSchema = z.object({
  customerId: z.string().uuid('Invalid customer ID'),
  pool_id: z
    .string()
    .uuid('Invalid pool ID')
    .nullable()
    .optional()
    .transform((val) => val || null),
  lineItems: z
    .array(lineItemSchema)
    .min(1, 'At least one line item is required'),
  taxRate: z
    .number()
    .min(0, 'Tax rate cannot be negative')
    .max(1, 'Tax rate cannot exceed 100%')
    .default(0),
  notes: z
    .string()
    .max(5000, 'Notes must be 5000 characters or less')
    .trim()
    .optional()
    .or(z.literal(''))
    .transform((val) => val || null),
  validUntil: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format')
    .optional()
    .or(z.literal(''))
    .transform((val) => val || null)
       .refine(
      (val) => !val || !isNaN(Date.parse(val)),
      'Invalid date format'
    )
});


/**
 * Update estimate schema
 */
export const updateEstimateSchema = z.object({
  poolId: z.string().uuid('Invalid pool ID').nullable().optional(),
  lineItems: z
    .array(lineItemSchema)
    .min(1, 'At least one line item is required')
    .optional(),
  taxRate: z
    .number()
    .min(0, 'Tax rate cannot be negative')
    .max(1, 'Tax rate cannot exceed 100%')
    .optional(),
  notes: z
    .string()
    .max(5000, 'Notes must be 5000 characters or less')
    .trim()
    .optional()
    .or(z.literal(''))
    .transform((val) => val || null),
  validUntil: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format')
    .optional()
    .or(z.literal(''))
    .transform((val) => val || null)
        .refine(
      (val) => val === undefined || val === null || !isNaN(Date.parse(val)),
      'Invalid date format'
    ),
});

/**
 * Update estimate status schema
 */
export const updateEstimateStatusSchema = z.object({
  status: z.enum(['draft', 'sent', 'internal_final', 'converted', 'declined']),
});

/**
 * TypeScript types inferred from schemas
 */
export type LineItemInput = z.infer<typeof lineItemSchema>;
export type CreateEstimateInput = z.infer<typeof createEstimateSchema>;
export type UpdateEstimateInput = z.infer<typeof updateEstimateSchema>;
export type UpdateEstimateStatusInput = z.infer<typeof updateEstimateStatusSchema>;

/**
 * Calculate line item total in cents
 */
export function calculateLineItemTotal(quantity: number, unitPriceCents: number): number {
  return Math.round(quantity * unitPriceCents);
}

/**
 * Calculate estimate totals from line items
 */
export function calculateEstimateTotals(
  lineItems: { quantity: number; unitPriceCents: number }[],
  taxRate: number = 0
): {
  subtotalCents: number;
  taxAmountCents: number;
  totalCents: number;
} {
  const subtotalCents = lineItems.reduce(
    (sum, item) => sum + calculateLineItemTotal(item.quantity, item.unitPriceCents),
    0
  );
  const taxAmountCents = Math.round(subtotalCents * taxRate);
  const totalCents = subtotalCents + taxAmountCents;

  return {
    subtotalCents,
    taxAmountCents,
    totalCents,
  };
}

/**
 * Format cents as currency string
 */
export function formatCurrency(cents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(cents / 100);
}

/**
 * Parse currency string to cents
 * Handles formats like "$1,234.56", "1234.56", "1,234"
 */
export function parseCurrencyToCents(value: string): number | null {
  // Remove currency symbol and commas
  const cleaned = value.replace(/[$,]/g, '').trim();

  if (!cleaned) return null;

  const num = parseFloat(cleaned);
  if (isNaN(num)) return null;

  // Convert to cents
  return Math.round(num * 100);
}

/**
 * Format tax rate as percentage string
 */
export function formatTaxRate(rate: number): string {
  return `${(rate * 100).toFixed(2)}%`;
}

/**
 * Parse percentage string to decimal rate
 * Handles formats like "7%", "7.5", "0.07"
 */
export function parsePercentageToRate(value: string): number | null {
  const cleaned = value.replace(/%/g, '').trim();

  if (!cleaned) return null;

  const num = parseFloat(cleaned);
  if (isNaN(num)) return null;

  // If > 1, assume it's a percentage (e.g., "7" means 7%)
  return num > 1 ? num / 100 : num;
}

/**
 * Generate next estimate number
 * Format: EST-XXXX where XXXX is a sequential number padded to 4 digits
 */
export function generateEstimateNumber(sequenceNumber: number): string {
  return `EST-${String(sequenceNumber).padStart(4, '0')}`;
}

/**
 * Get status configuration for display
 */
export function getStatusConfig(status: EstimateStatusValue) {
  return ESTIMATE_STATUSES.find((s) => s.value === status) ?? ESTIMATE_STATUSES[0];
}

/**
 * Check if status transition is valid
 */
export function isValidStatusTransition(
  currentStatus: EstimateStatusValue,
  newStatus: EstimateStatusValue
): boolean {
  const validTransitions: Record<EstimateStatusValue, EstimateStatusValue[]> = {
    draft: ['sent'],
    sent: ['internal_final', 'converted', 'declined'],
    internal_final: ['converted', 'declined'],
    converted: [],
    declined: ['draft'],
  };

  return validTransitions[currentStatus]?.includes(newStatus) ?? false;
}

/**
 * Format date for display
 */
export function formatDate(dateString: string | null): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Format date for input value (YYYY-MM-DD)
 */
export function formatDateForInput(dateString: string | null): string {
  if (!dateString) return '';
  return dateString.slice(0, 10);
}

/**
 * Get default valid until date (30 days from now)
 */
export function getDefaultValidUntil(): string {
  const date = new Date();
  date.setDate(date.getDate() + 30);
  return date.toISOString().slice(0, 10);
}


// ============================================================================
// Utility Functions
// ============================================================================


/**
 * Gets the allowed next statuses for a given status.
 */
export function getAllowedNextStatuses(currentStatus: EstimateStatus): EstimateStatus[] {
  return STATUS_TRANSITIONS[currentStatus];
}
