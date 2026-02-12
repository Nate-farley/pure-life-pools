/**
 * Estimate Detail Loading State
 *
 * Shown while the estimate detail page is loading.
 * Uses the EstimateDetailSkeleton component for consistent loading UI.
 */

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { EstimateDetailSkeleton } from '@/components/estimates/estimate-detail-skeleton';

export default function EstimateDetailLoading() {
  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm">
        <Link
          href="/admin/estimates"
          className="text-zinc-500 hover:text-zinc-900 transition-colors"
        >
          Estimates
        </Link>
        <ChevronRight className="w-4 h-4 text-zinc-400" />
        <span className="text-zinc-900">View Estimate</span>
      </nav>

      {/* Skeleton */}
      <EstimateDetailSkeleton />
    </div>
  );
}
