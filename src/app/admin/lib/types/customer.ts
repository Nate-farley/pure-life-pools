/**
 * Customer Type Definitions
 *
 * Extended customer types that include related entities for detail views.
 * These types extend the base database types with joined data.
 */

import type {
  Customer,
  CustomerTag,
  Property,
  Pool,
  Communication,
  Estimate,
  CustomerNote,
  CustomerAttachment,
} from '@/lib/types/database';

/**
 * Tag type for customer tags (subset of CustomerTag)
 */
export interface CustomerTagInfo {
  id: string;
  name: string;
  color: string;
}

/**
 * Property with associated pool data
 */
export interface PropertyWithPool extends Property {
  pool: Pool | null;
}

/**
 * Note with author information
 */
export interface NoteWithAuthor extends CustomerNote {
  author: {
    id: string;
    full_name: string;
    email: string;
  } | null;
}

/**
 * Note with author information
 */
export interface NoteWithAuthor extends CustomerNote {
  author: {
    id: string;
    full_name: string;
    email: string;
  } | null;
}

/**
 * Pool info for estimates
 */
export interface EstimatePoolInfo {
  id: string;
  type: string;
  property: {
    id: string;
    address_line1: string;
    city: string;
    state: string;
  };
}

/**
 * Customer info for estimates
 */
export interface EstimateCustomerInfo {
  id: string;
  name: string;
  phone: string;
  email: string | null;
}

/**
 * Estimate with customer and pool info
 */
export interface EstimateWithDetails extends Estimate {
  customer: EstimateCustomerInfo;
  pool?: EstimatePoolInfo | null;
}


/**
 * Customer with all related entities
 *
 * Used for detail page views where we need full customer context.
 */
export interface CustomerWithDetails extends Customer {
  /** Tags assigned to this customer */
  tags?: CustomerTagInfo[];

  /** Properties owned by this customer */
  properties?: PropertyWithPool[];

  /** Communications log for this customer */
  communications?: Communication[];

  /** Estimates created for this customer */
  estimates?: Estimate[];

  /** Notes about this customer with author info */
  notes?: NoteWithAuthor[];

  /** File attachments for this customer */
  attachments?: CustomerAttachment[];
}

/**
 * Customer summary for list views
 *
 * Lighter weight type with only essential fields for display in lists.
 */
export interface CustomerSummary {
  id: string;
  name: string;
  phone: string;
  phone_normalized: string;
  email: string | null;
  source: string | null;
  created_at: string;
  tags?: CustomerTagInfo[];
}

/**
 * Duplicate customer result for phone number checks
 */
export interface DuplicateCustomerResult {
  id: string;
  name: string;
  phone: string;
  email: string | null;
}

/**
 * Customer list result with pagination metadata
 */
export interface CustomerListResult {
  customers: CustomerSummary[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

/**
 * Options for listing customers
 */
export interface CustomerListOptions {
  limit?: number;
  offset?: number;
  search?: string;
  tags?: string[];
  source?: string;
  sortBy?: 'name' | 'created_at' | 'updated_at';
  sortOrder?: 'asc' | 'desc';
  includeDeleted?: boolean;
}
