/**
 * Property Validation Schemas
 *
 * Zod schemas for property input validation.
 * These are the source of truth for both runtime validation and TypeScript types.
 */

import { z } from 'zod';

/**
 * US State codes for validation
 */
export const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY',
  'DC', 'PR', 'VI', 'GU', 'AS', 'MP',
] as const;

export type USState = typeof US_STATES[number];

/**
 * State options for select dropdowns
 */
export const stateOptions = US_STATES.map((code) => ({
  value: code,
  label: code,
}));

/**
 * Address line 1 validation
 */
const addressLine1Schema = z
  .string()
  .min(1, 'Street address is required')
  .max(200, 'Street address must be 200 characters or less')
  .trim();

/**
 * Address line 2 validation (optional)
 */
const addressLine2Schema = z
  .string()
  .max(100, 'Address line 2 must be 100 characters or less')
  .trim()
  .optional()
  .or(z.literal(''))
  .transform((val) => val || null);

/**
 * City validation
 */
const citySchema = z
  .string()
  .min(1, 'City is required')
  .max(100, 'City must be 100 characters or less')
  .trim();

/**
 * State validation (2-letter code)
 */
const stateSchema = z
  .string()
  .length(2, 'Please select a state')
  .toUpperCase()
  .refine((val) => US_STATES.includes(val as USState), {
    message: 'Please select a valid US state',
  });

/**
 * ZIP code validation
 * Accepts: 12345 or 12345-6789
 */
const zipCodeSchema = z
  .string()
  .min(5, 'ZIP code must be at least 5 digits')
  .max(10, 'ZIP code must be 10 characters or less')
  .regex(
    /^\d{5}(-\d{4})?$/,
    'ZIP code must be 5 digits (e.g., 12345) or 9 digits (e.g., 12345-6789)'
  );

/**
 * Gate code validation (optional)
 */
const gateCodeSchema = z
  .string()
  .max(20, 'Gate code must be 20 characters or less')
  .trim()
  .optional()
  .or(z.literal(''))
  .transform((val) => val || null);

/**
 * Access notes validation (optional)
 */
const accessNotesSchema = z
  .string()
  .max(500, 'Access notes must be 500 characters or less')
  .trim()
  .optional()
  .or(z.literal(''))
  .transform((val) => val || null);

/**
 * Create Property Schema
 *
 * Validates input for creating a new property.
 */
export const createPropertySchema = z.object({
  customerId: z.string().uuid('Invalid customer ID'),
  addressLine1: addressLine1Schema,
  addressLine2: addressLine2Schema,
  city: citySchema,
  state: stateSchema,
  zipCode: zipCodeSchema,
  gateCode: gateCodeSchema,
  accessNotes: accessNotesSchema,
});

/**
 * Update Property Schema
 *
 * Validates input for updating an existing property.
 * All fields except customerId are optional.
 */
export const updatePropertySchema = z.object({
  addressLine1: addressLine1Schema.optional(),
  addressLine2: addressLine2Schema,
  city: citySchema.optional(),
  state: stateSchema.optional(),
  zipCode: zipCodeSchema.optional(),
  gateCode: gateCodeSchema,
  accessNotes: accessNotesSchema,
});

/**
 * TypeScript types inferred from schemas
 */
export type CreatePropertyInput = z.infer<typeof createPropertySchema>;
export type UpdatePropertyInput = z.infer<typeof updatePropertySchema>;

/**
 * Format a full address for display
 */
export function formatAddress(property: {
  addressLine1: string;
  addressLine2?: string | null;
  city: string;
  state: string;
  zipCode: string;
}): string {
  const line1 = property.addressLine1;
  const line2 = property.addressLine2 ? `, ${property.addressLine2}` : '';
  return `${line1}${line2}, ${property.city}, ${property.state} ${property.zipCode}`;
}

/**
 * Format address as multiple lines
 */
export function formatAddressLines(property: {
  addressLine1: string;
  addressLine2?: string | null;
  city: string;
  state: string;
  zipCode: string;
}): string[] {
  const lines = [property.addressLine1];
  if (property.addressLine2) {
    lines.push(property.addressLine2);
  }
  lines.push(`${property.city}, ${property.state} ${property.zipCode}`);
  return lines;
}
