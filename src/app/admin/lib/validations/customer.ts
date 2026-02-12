import { z } from 'zod';

/**
 * Customer Validation Schemas
 *
 * Zod schemas for customer-related operations.
 * These are the source of truth for both runtime validation and TypeScript types.
 */

// ============================================================================
// Lead Source Options
// ============================================================================

export const LEAD_SOURCES = [
  'referral',
  'website',
  'phone',
  'walk_in',
  'google',
  'facebook',
  'yelp',
  'other',
] as const;

export type LeadSource = (typeof LEAD_SOURCES)[number];

// ============================================================================
// Create Customer Schema
// ============================================================================

/**
 * Schema for creating a new customer.
 *
 * Validation rules from specification:
 * - phone: Required, 10-20 characters
 * - name: Required, 1-200 characters
 * - email: Optional, valid email format or empty string
 * - source: Optional, max 100 characters
 */
export const createCustomerSchema = z.object({
  phone: z
    .string()
    .min(10, 'Phone number must be at least 10 characters')
    .max(20, 'Phone number must be at most 20 characters')
    .refine(
      (val) => {
        // Allow digits, spaces, dashes, parentheses, dots, and plus sign
        const cleaned = val.replace(/[\s\-().+]/g, '');
        return /^\d{10,}$/.test(cleaned);
      },
      { message: 'Please enter a valid phone number' }
    ),
  name: z
    .string()
    .min(1, 'Name is required')
    .max(200, 'Name must be at most 200 characters')
    .transform((val) => val.trim()),
  email: z
    .union([
      z.string().email('Please enter a valid email address'),
      z.literal(''),
    ])
    .optional()
    .transform((val) => (val === '' ? null : val)),
  source: z
    .string()
    .max(100, 'Source must be at most 100 characters')
    .optional()
    .transform((val) => (val === '' ? null : val)),
});

export type CreateCustomerInput = z.infer<typeof createCustomerSchema>;

// ============================================================================
// Update Customer Schema
// ============================================================================

/**
 * Schema for updating an existing customer.
 * All fields are optional except id.
 */
export const updateCustomerSchema = z.object({
  id: z.string().uuid('Invalid customer ID'),
  phone: z
    .string()
    .min(10, 'Phone number must be at least 10 characters')
    .max(20, 'Phone number must be at most 20 characters')
    .refine(
      (val) => {
        const cleaned = val.replace(/[\s\-().+]/g, '');
        return /^\d{10,}$/.test(cleaned);
      },
      { message: 'Please enter a valid phone number' }
    )
    .optional(),
  name: z
    .string()
    .min(1, 'Name is required')
    .max(200, 'Name must be at most 200 characters')
    .transform((val) => val.trim())
    .optional(),
  email: z
    .union([
      z.string().email('Please enter a valid email address'),
      z.literal(''),
    ])
    .optional()
    .transform((val) => (val === '' ? null : val)),
  source: z
    .string()
    .max(100, 'Source must be at most 100 characters')
    .optional()
    .transform((val) => (val === '' ? null : val)),
});

export type UpdateCustomerInput = z.infer<typeof updateCustomerSchema>;

// ============================================================================
// Search Customer Schema
// ============================================================================

/**
 * Schema for customer search queries.
 */
export const searchCustomerSchema = z.object({
  query: z
    .string()
    .min(1, 'Search query is required')
    .max(100, 'Search query is too long'),
  limit: z.number().min(1).max(50).optional().default(10),
});

export type SearchCustomerInput = z.infer<typeof searchCustomerSchema>;

// ============================================================================
// List Customers Schema
// ============================================================================

/**
 * Schema for listing customers with filters and pagination.
 */
export const listCustomersSchema = z.object({
  limit: z.number().min(1).max(100).optional().default(25),
  cursor: z.string().nullable().optional(),
  search: z.string().max(100).optional(),
  tags: z.array(z.string().uuid()).optional(),
  source: z.string().max(100).optional(),
  includeDeleted: z.boolean().optional().default(false),
});

export type ListCustomersInput = z.infer<typeof listCustomersSchema>;

// ============================================================================
// Phone Check Schema (for duplicate detection)
// ============================================================================

/**
 * Schema for checking phone number uniqueness.
 */
export const phoneCheckSchema = z.object({
  phone: z.string().min(10).max(20),
  excludeCustomerId: z.string().uuid().optional(),
});

export type PhoneCheckInput = z.infer<typeof phoneCheckSchema>;

// ============================================================================
// Customer ID Schema
// ============================================================================

/**
 * Schema for operations requiring just a customer ID.
 */
export const customerIdSchema = z.object({
  id: z.string().uuid('Invalid customer ID'),
});

export type CustomerIdInput = z.infer<typeof customerIdSchema>;
