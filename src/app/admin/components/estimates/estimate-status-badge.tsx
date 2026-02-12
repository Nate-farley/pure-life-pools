/**
 * Estimate Status Badge
 *
 * Color-coded badge component for displaying estimate status.
 * Follows the design system with semantic colors for each status.
 */

import type { EstimateStatus } from '@/lib/validations/estimate';

// ============================================================================
// Configuration
// ============================================================================

const statusConfig: Record<
  EstimateStatus,
  {
    label: string;
    className: string;
  }
> = {
  draft: {
    label: 'Draft',
    className: 'bg-zinc-100 text-zinc-700',
  },
  sent: {
    label: 'Sent',
    className: 'bg-blue-50 text-blue-700',
  },
  internal_final: {
    label: 'Final',
    className: 'bg-amber-50 text-amber-700',
  },
  converted: {
    label: 'Converted',
    className: 'bg-emerald-50 text-emerald-700',
  },
  declined: {
    label: 'Declined',
    className: 'bg-red-50 text-red-700',
  },
};

// ============================================================================
// Component
// ============================================================================

interface EstimateStatusBadgeProps {
  status: EstimateStatus;
  size?: 'sm' | 'md';
}

export function EstimateStatusBadge({
  status,
  size = 'sm',
}: EstimateStatusBadgeProps) {
  const config = statusConfig[status];

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
  };

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full ${config.className} ${sizeClasses[size]}`}
    >
      {config.label}
    </span>
  );
}
