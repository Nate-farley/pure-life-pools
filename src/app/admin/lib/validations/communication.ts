/**
 * Communication Validation Schemas
 *
 * @file src/lib/validations/communication.ts
 *
 * Zod schemas for communication logging operations.
 * These are the source of truth for both runtime validation and TypeScript types.
 *
 * Validation rules from specification:
 * - type: Required, one of 'call', 'text', 'email'
 * - direction: Required, one of 'inbound', 'outbound'
 * - summary: Required, 1-5000 characters
 * - occurredAt: Required, valid ISO datetime
 */

import { z } from 'zod';

// =============================================================================
// Constants
// =============================================================================

/**
 * Communication type options for UI dropdowns
 */
export const communicationTypeOptions = [
  { value: 'call', label: 'Phone Call' },
  { value: 'text', label: 'Text Message' },
  { value: 'email', label: 'Email' },
] as const;

/**
 * Communication direction options for UI dropdowns
 */
export const communicationDirectionOptions = [
  { value: 'inbound', label: 'Inbound' },
  { value: 'outbound', label: 'Outbound' },
] as const;

/**
 * Valid communication types
 */
export const COMMUNICATION_TYPES = ['call', 'text', 'email'] as const;
export type CommunicationType = (typeof COMMUNICATION_TYPES)[number];

/**
 * Valid communication directions
 */
export const COMMUNICATION_DIRECTIONS = ['inbound', 'outbound'] as const;
export type CommunicationDirection = (typeof COMMUNICATION_DIRECTIONS)[number];

// =============================================================================
// Base Schemas
// =============================================================================

/**
 * Communication type enum schema
 */
const communicationTypeSchema = z.enum(COMMUNICATION_TYPES, {
  errorMap: () => ({ message: 'Please select a communication type' }),
});

/**
 * Communication direction enum schema
 */
const communicationDirectionSchema = z.enum(COMMUNICATION_DIRECTIONS, {
  errorMap: () => ({ message: 'Please select a direction' }),
});

/**
 * Summary validation schema
 * Required, 1-5000 characters, trimmed
 */
const summarySchema = z
  .string()
  .min(1, 'Summary is required')
  .max(5000, 'Summary must be 5000 characters or less')
  .transform((val) => val.trim());

/**
 * Occurred at datetime schema
 * Must be a valid ISO datetime string
 */
const occurredAtSchema = z
  .string()
  .datetime({ message: 'Please enter a valid date and time' })
  .refine(
    (val) => {
      const date = new Date(val);
      return !isNaN(date.getTime());
    },
    { message: 'Please enter a valid date and time' }
  );

// =============================================================================
// Create Communication Schema
// =============================================================================

/**
 * Schema for logging a new communication
 */
export const createCommunicationSchema = z.object({
  customerId: z.string().uuid('Invalid customer ID'),
  type: communicationTypeSchema,
  direction: communicationDirectionSchema,
  summary: summarySchema,
  occurredAt: occurredAtSchema,
});

export type CreateCommunicationInput = z.infer<typeof createCommunicationSchema>;

// =============================================================================
// Update Communication Schema
// =============================================================================

/**
 * Schema for updating an existing communication
 * All fields except id are optional - only provided fields are updated
 */
export const updateCommunicationSchema = z.object({
  id: z.string().uuid('Invalid communication ID'),
  type: communicationTypeSchema.optional(),
  direction: communicationDirectionSchema.optional(),
  summary: summarySchema.optional(),
  occurredAt: occurredAtSchema.optional(),
});

export type UpdateCommunicationInput = z.infer<typeof updateCommunicationSchema>;

// =============================================================================
// Delete Communication Schema
// =============================================================================

/**
 * Schema for deleting a communication
 */
export const deleteCommunicationSchema = z.object({
  id: z.string().uuid('Invalid communication ID'),
});

export type DeleteCommunicationInput = z.infer<typeof deleteCommunicationSchema>;

// =============================================================================
// List Communications Schema
// =============================================================================

/**
 * Schema for listing communications with filters and pagination
 */
export const listCommunicationsSchema = z.object({
  customerId: z.string().uuid('Invalid customer ID'),
  limit: z.number().min(1).max(100).optional().default(25),
  cursor: z.string().nullable().optional(),
  type: communicationTypeSchema.optional(),
  direction: communicationDirectionSchema.optional(),
  search: z.string().max(200).optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
});

export type ListCommunicationsInput = z.infer<typeof listCommunicationsSchema>;

// =============================================================================
// Search Communications Schema
// =============================================================================

/**
 * Schema for full-text search on communications
 */
export const searchCommunicationsSchema = z.object({
  customerId: z.string().uuid('Invalid customer ID').optional(),
  query: z
    .string()
    .min(1, 'Search query is required')
    .max(200, 'Search query is too long'),
  limit: z.number().min(1).max(50).optional().default(10),
});

export type SearchCommunicationsInput = z.infer<typeof searchCommunicationsSchema>;

// =============================================================================
// Communication ID Schema
// =============================================================================

/**
 * Schema for operations requiring just a communication ID
 */
export const communicationIdSchema = z.object({
  id: z.string().uuid('Invalid communication ID'),
});

export type CommunicationIdInput = z.infer<typeof communicationIdSchema>;
