import { Skeleton } from '@/components/ui/skeleton';

/**
 * Customer Detail Skeleton
 *
 * Loading state for the customer detail page.
 * Shows placeholder content while data is being fetched.
 */

export function CustomerDetailSkeleton() {
  return (
    <div className="space-y-6">
      {/* Breadcrumb Skeleton */}
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-4" />
        <Skeleton className="h-4 w-32" />
      </div>

      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        {/* Left: Avatar and Contact Info */}
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <Skeleton className="w-14 h-14 rounded-full flex-shrink-0" />

          {/* Contact Details */}
          <div className="space-y-2">
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-44" />
            <div className="flex items-center gap-2 pt-1">
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-5 w-20 rounded-full" />
            </div>
          </div>
        </div>

        {/* Right: Action Buttons */}
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-20" />
          <Skeleton className="h-9 w-9" />
        </div>
      </div>

      {/* Quick Actions Skeleton */}
      <div className="flex items-center gap-2 flex-wrap">
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-8 w-28" />
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-8 w-36" />
      </div>

      {/* Tabs Skeleton */}
      <div className="space-y-6">
        {/* Tab List */}
        <div className="flex items-center gap-4 border-b border-zinc-200 pb-0">
          <Skeleton className="h-10 w-28" />
          <Skeleton className="h-10 w-36" />
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-20" />
        </div>

        {/* Tab Content */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-32 rounded-lg" />
          <Skeleton className="h-32 rounded-lg" />
          <Skeleton className="h-32 rounded-lg" />
        </div>
      </div>
    </div>
  );
}
