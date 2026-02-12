/**
 * Estimates List Loading State
 *
 * Shown while the estimates list page is loading.
 */

import { EstimatesListSkeleton } from '@/components/estimates/estimates-list-skeleton';

export default function EstimatesLoading() {
  return (
    <div className="space-y-6">
      {/* Page Header Skeleton */}
      <div className="flex items-center justify-between">
        <div>
          <div className="h-8 w-32 bg-zinc-200 rounded animate-pulse" />
          <div className="h-4 w-48 bg-zinc-200 rounded animate-pulse mt-2" />
        </div>
        <div className="h-9 w-32 bg-zinc-200 rounded-md animate-pulse" />
      </div>

      {/* Filters Skeleton */}
      <div className="flex items-center gap-1 p-1 bg-zinc-100 rounded-lg w-fit">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-8 w-16 bg-zinc-200 rounded-md animate-pulse" />
        ))}
      </div>

      {/* Table Skeleton */}
      <EstimatesListSkeleton />
    </div>
  );
}
