/**
 * Estimate Types
 *
 * TypeScript types for estimate-related entities and operations.
 */

import type { EstimateStatus, LineItem } from '@/lib/validations/estimate';

// ============================================================================
// Base Types
// ============================================================================

/**
 * Base Estimate type matching database schema
 */
export interface Estimate {
  id: string;
  estimate_number: string;
  customer_id: string;
  pool_id: string | null;
  status: EstimateStatus;
  line_items: LineItem[];
  subtotal_cents: number;
  tax_rate: number;
  tax_amount_cents: number;
  total_cents: number;
  notes: string | null;
  valid_until: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

/**
 * Customer summary for estimate display
 */
export interface EstimateCustomer {
  id: string;
  name: string;
  phone: string;
  phone_normalized: string;
  email: string | null;
}

/**
 * Property summary for estimate display
 */
export interface EstimateProperty {
  id: string;
  address_line1: string;
  address_line2: string | null;
  city: string;
  state: string;
  zip_code: string;
}

/**
 * Pool summary for estimate display
 */
export interface EstimatePool {
  id: string;
  property_id: string;
  type: 'inground' | 'above_ground' | 'spa' | 'other';
  surface_type: 'plaster' | 'pebble' | 'tile' | 'vinyl' | 'fiberglass' | null;
  volume_gallons: number | null;
  property?: EstimateProperty;
}

/**
 * Admin who created the estimate
 */
export interface EstimateCreator {
  id: string;
  full_name: string;
  email: string;
}

// ============================================================================
// Extended Types
// ============================================================================

/**
 * Estimate with all related entities for detail view
 */
export interface EstimateWithDetails extends Estimate {
  customer: EstimateCustomer;
  pool: EstimatePool | null;
  created_by_admin: EstimateCreator | null;
}

/**
 * Estimate summary for list views
 */
export interface EstimateSummary {
  id: string;
  estimate_number: string;
  customer_id: string;
  status: EstimateStatus;
  total_cents: number;
  valid_until: string | null;
  created_at: string;
  customer: {
    id: string;
    name: string;
    phone: string;
  };
}

// ============================================================================
// List and Pagination Types
// ============================================================================

/**
 * Options for listing estimates
 */
export interface EstimateListOptions {
  limit?: number;
  offset?: number;
  customerId?: string;
  status?: EstimateStatus | EstimateStatus[];
  sortBy?: 'created_at' | 'estimate_number' | 'total_cents' | 'valid_until';
  sortOrder?: 'asc' | 'desc';
}

/**
 * Result of listing estimates
 */
export interface EstimateListResult {
  estimates: EstimateSummary[];
  total: number;
  hasMore: boolean;
}

// ============================================================================
// Operation Result Types
// ============================================================================

/**
 * Result of creating an estimate
 */
export interface CreateEstimateResult {
  estimate: Estimate;
}

/**
 * Result of updating an estimate
 */
export interface UpdateEstimateResult {
  estimate: Estimate;
}

/**
 * Result of duplicating an estimate
 */
export interface DuplicateEstimateResult {
  estimate: Estimate;
}
