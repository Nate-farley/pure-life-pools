/**
 * Communication Types
 *
 * @file src/lib/types/communication.ts
 *
 * Extended TypeScript types for communication-related operations.
 * These types extend the base database types with related data.
 */

import type { Communication, Admin } from './database';

// =============================================================================
// Communication with Relations
// =============================================================================

/**
 * Communication with the admin who logged it
 */
export interface CommunicationWithLogger extends Communication {
  logged_by_admin: Pick<Admin, 'id' | 'email' | 'full_name'> | null;
}

/**
 * Communication with customer info (for global search results)
 */
export interface CommunicationWithCustomer extends Communication {
  customer: {
    id: string;
    name: string;
    phone: string;
  };
  logged_by_admin: Pick<Admin, 'id' | 'email' | 'full_name'> | null;
}

// =============================================================================
// List Result Types
// =============================================================================

/**
 * Paginated list result for communications
 */
export interface CommunicationListResult {
  items: CommunicationWithLogger[];
  hasMore: boolean;
  nextCursor: string | null;
  total?: number;
}

/**
 * Search result for communications
 */
export interface CommunicationSearchResult {
  items: CommunicationWithCustomer[];
  total: number;
}

// =============================================================================
// Filter Types
// =============================================================================

/**
 * Filter options for communication list
 */
export interface CommunicationFilters {
  type?: Communication['type'];
  direction?: Communication['direction'];
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}

// =============================================================================
// UI Helper Types
// =============================================================================

/**
 * Communication display data for UI components
 */
export interface CommunicationDisplay {
  id: string;
  type: Communication['type'];
  typeLabel: string;
  direction: Communication['direction'];
  directionLabel: string;
  summary: string;
  occurredAt: string;
  occurredAtFormatted: string;
  loggedBy: string;
  createdAt: string;
}

/**
 * Icon name map for communication types
 */
export const communicationTypeIcons: Record<Communication['type'], string> = {
  call: 'Phone',
  text: 'MessageSquare',
  email: 'Mail',
};

/**
 * Color map for communication types (Tailwind classes)
 */
export const communicationTypeColors: Record<Communication['type'], {
  bg: string;
  text: string;
  border: string;
}> = {
  call: {
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
  },
  text: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
  },
  email: {
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
  },
};

/**
 * Color map for communication directions (Tailwind classes)
 */
export const communicationDirectionColors: Record<Communication['direction'], {
  bg: string;
  text: string;
}> = {
  inbound: {
    bg: 'bg-zinc-100',
    text: 'text-zinc-700',
  },
  outbound: {
    bg: 'bg-zinc-100',
    text: 'text-zinc-600',
  },
};
