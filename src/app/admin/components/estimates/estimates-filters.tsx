'use client';

/**
 * Estimates Filters
 *
 * Filter bar for the estimates list page.
 * Allows filtering by status with tab-style buttons.
 */

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ESTIMATE_STATUSES, type EstimateStatus } from '@/lib/validations/estimate';

// ============================================================================
// Types
// ============================================================================

interface EstimatesFiltersProps {
  currentStatus?: EstimateStatus;
}

// ============================================================================
// Component
// ============================================================================

export function EstimatesFilters({ currentStatus }: EstimatesFiltersProps) {
  const searchParams = useSearchParams();

  // Build URL with status filter
  const buildUrl = (status?: EstimateStatus) => {
    const params = new URLSearchParams(searchParams.toString());
    if (status) {
      params.set('status', status);
    } else {
      params.delete('status');
    }
    params.delete('page'); // Reset to page 1 when changing filters
    const queryString = params.toString();
    return `/admin/estimates${queryString ? `?${queryString}` : ''}`;
  };

  return (
    <div className="flex items-center gap-1 p-1 bg-zinc-100 rounded-lg w-fit">
      {/* All tab */}
      <Link
        href={buildUrl()}
        className={`
          px-3 py-1.5 text-sm font-medium rounded-md transition-colors
          ${
            !currentStatus
              ? 'bg-white text-zinc-900 shadow-sm'
              : 'text-zinc-600 hover:text-zinc-900'
          }
        `}
      >
        All
      </Link>

      {/* Status tabs */}
      {ESTIMATE_STATUSES.map(({ value, label }) => (
        <Link
          key={value}
          href={buildUrl(value)}
          className={`
            px-3 py-1.5 text-sm font-medium rounded-md transition-colors
            ${
              currentStatus === value
                ? 'bg-white text-zinc-900 shadow-sm'
                : 'text-zinc-600 hover:text-zinc-900'
            }
          `}
        >
          {label}
        </Link>
      ))}
    </div>
  );
}
