/**
 * Pool Validation Schemas
 *
 * Zod schemas for pool input validation.
 * These are the source of truth for both runtime validation and TypeScript types.
 */

import { z } from 'zod';

/**
 * Pool type options
 */
export const POOL_TYPES = [
  { value: 'inground', label: 'Inground' },
  { value: 'above_ground', label: 'Above Ground' },
  { value: 'spa', label: 'Spa' },
  { value: 'other', label: 'Other' },
] as const;

export type PoolType = (typeof POOL_TYPES)[number]['value'];

/**
 * Pool surface type options
 */
export const POOL_SURFACE_TYPES = [
  { value: 'plaster', label: 'Plaster' },
  { value: 'pebble', label: 'Pebble' },
  { value: 'tile', label: 'Tile' },
  { value: 'vinyl', label: 'Vinyl' },
  { value: 'fiberglass', label: 'Fiberglass' },
] as const;

export type PoolSurfaceType = (typeof POOL_SURFACE_TYPES)[number]['value'];

/**
 * Pool type schema
 */
const poolTypeSchema = z.enum(['inground', 'above_ground', 'spa', 'other'], {
  required_error: 'Pool type is required',
  invalid_type_error: 'Please select a valid pool type',
});

/**
 * Pool surface type schema (optional)
 */
const poolSurfaceTypeSchema = z
  .enum(['plaster', 'pebble', 'tile', 'vinyl', 'fiberglass'])
  .nullable()
  .optional()
  .transform((val) => val || null);

/**
 * Dimension schema - positive number with reasonable limits
 */
const dimensionSchema = z
  .union([z.string(), z.number()])
  .transform((val) => {
    if (val === '' || val === null || val === undefined) return null;
    const num = typeof val === 'string' ? parseFloat(val) : val;
    return isNaN(num) ? null : num;
  })
  .pipe(
    z
      .number()
      .positive('Must be a positive number')
      .max(999.99, 'Value is too large')
      .nullable()
  )
  .optional();

/**
 * Volume schema - positive integer with reasonable limits
 */
const volumeSchema = z
  .union([z.string(), z.number()])
  .transform((val) => {
    if (val === '' || val === null || val === undefined) return null;
    const num = typeof val === 'string' ? parseInt(val, 10) : Math.round(val);
    return isNaN(num) ? null : num;
  })
  .pipe(
    z
      .number()
      .int('Volume must be a whole number')
      .positive('Must be a positive number')
      .max(9999999, 'Value is too large')
      .nullable()
  )
  .optional();

/**
 * Equipment notes schema (optional)
 */
const equipmentNotesSchema = z
  .string()
  .max(1000, 'Equipment notes must be 1000 characters or less')
  .trim()
  .optional()
  .or(z.literal(''))
  .transform((val) => val || null);

/**
 * Create Pool Schema
 *
 * Validates input for creating a new pool.
 * Property ID is required since each pool belongs to exactly one property.
 */
export const createPoolSchema = z.object({
  propertyId: z.string().uuid('Invalid property ID'),
  type: poolTypeSchema,
  surfaceType: poolSurfaceTypeSchema,
  lengthFt: dimensionSchema,
  widthFt: dimensionSchema,
  depthShallowFt: dimensionSchema,
  depthDeepFt: dimensionSchema,
  volumeGallons: volumeSchema,
  equipmentNotes: equipmentNotesSchema,
});

/**
 * Update Pool Schema
 *
 * Validates input for updating an existing pool.
 * All fields are optional except type which must be provided if updating.
 */
export const updatePoolSchema = z.object({
  type: poolTypeSchema.optional(),
  surfaceType: poolSurfaceTypeSchema,
  lengthFt: dimensionSchema,
  widthFt: dimensionSchema,
  depthShallowFt: dimensionSchema,
  depthDeepFt: dimensionSchema,
  volumeGallons: volumeSchema,
  equipmentNotes: equipmentNotesSchema,
});

/**
 * TypeScript types inferred from schemas
 */
export type CreatePoolInput = z.infer<typeof createPoolSchema>;
export type UpdatePoolInput = z.infer<typeof updatePoolSchema>;

/**
 * Calculate estimated pool volume in gallons
 *
 * Uses the formula for a rectangular pool with varying depth:
 * Volume = Length × Width × Average Depth × 7.5 (gallons per cubic foot)
 *
 * @param lengthFt - Pool length in feet
 * @param widthFt - Pool width in feet
 * @param depthShallowFt - Shallow end depth in feet
 * @param depthDeepFt - Deep end depth in feet
 * @returns Estimated volume in gallons, or null if insufficient data
 */
export function calculatePoolVolume(
  lengthFt: number | null | undefined,
  widthFt: number | null | undefined,
  depthShallowFt: number | null | undefined,
  depthDeepFt: number | null | undefined
): number | null {
  if (!lengthFt || !widthFt) {
    return null;
  }

  // Calculate average depth
  let avgDepth: number;
  if (depthShallowFt && depthDeepFt) {
    avgDepth = (depthShallowFt + depthDeepFt) / 2;
  } else if (depthShallowFt) {
    avgDepth = depthShallowFt;
  } else if (depthDeepFt) {
    avgDepth = depthDeepFt;
  } else {
    // Default average depth if none provided
    return null;
  }

  // 7.5 gallons per cubic foot
  const volume = lengthFt * widthFt * avgDepth * 7.5;
  return Math.round(volume);
}

/**
 * Format pool dimensions for display
 *
 * @param pool - Pool with dimension fields
 * @returns Formatted string like "32' × 16' × 3.5'-9'"
 */
export function formatPoolDimensions(pool: {
  length_ft?: number | null;
  width_ft?: number | null;
  depth_shallow_ft?: number | null;
  depth_deep_ft?: number | null;
}): string | null {
  const parts: string[] = [];

  if (pool.length_ft && pool.width_ft) {
    parts.push(`${pool.length_ft}' × ${pool.width_ft}'`);
  } else if (pool.length_ft) {
    parts.push(`${pool.length_ft}' long`);
  } else if (pool.width_ft) {
    parts.push(`${pool.width_ft}' wide`);
  }

  if (pool.depth_shallow_ft && pool.depth_deep_ft) {
    parts.push(`${pool.depth_shallow_ft}'-${pool.depth_deep_ft}' deep`);
  } else if (pool.depth_shallow_ft || pool.depth_deep_ft) {
    const depth = pool.depth_shallow_ft || pool.depth_deep_ft;
    parts.push(`${depth}' deep`);
  }

  return parts.length > 0 ? parts.join(' × ') : null;
}

/**
 * Format pool volume for display
 *
 * @param volumeGallons - Volume in gallons
 * @returns Formatted string like "25,000 gal"
 */
export function formatPoolVolume(volumeGallons: number | null | undefined): string | null {
  if (!volumeGallons) return null;
  return `${volumeGallons.toLocaleString()} gal`;
}

/**
 * Get pool type label for display
 */
export function getPoolTypeLabel(type: string): string {
  const found = POOL_TYPES.find((t) => t.value === type);
  return found?.label ?? type;
}

/**
 * Get pool surface type label for display
 */
export function getSurfaceTypeLabel(surfaceType: string | null): string {
  if (!surfaceType) return 'Unknown';
  const found = POOL_SURFACE_TYPES.find((t) => t.value === surfaceType);
  return found?.label ?? surfaceType;
}
