/**
 * Estimate Detail Skeleton
 *
 * Loading state for the estimate detail page.
 * Shows placeholder content while data is being fetched.
 */

// ============================================================================
// Skeleton Component
// ============================================================================

function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-zinc-200 rounded ${className}`} />
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function EstimateDetailSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
          <Skeleton className="h-4 w-48 mt-2" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-20" />
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-16" />
          <Skeleton className="h-9 w-20" />
        </div>
      </div>

      {/* Status Actions */}
      <div className="flex items-center gap-3">
        <Skeleton className="h-9 w-32" />
        <Skeleton className="h-9 w-36" />
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-1 space-y-6">
          {/* Customer Card */}
          <div className="bg-white border border-zinc-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-4 w-20" />
            </div>
            <div className="space-y-3">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-4 w-44" />
            </div>
          </div>

          {/* Pool Card */}
          <div className="bg-white border border-zinc-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-4 w-12" />
            </div>
            <div className="space-y-3">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-4 w-28" />
              <div className="pt-2 border-t border-zinc-100">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4 mt-1" />
              </div>
            </div>
          </div>

          {/* Details Card */}
          <div className="bg-white border border-zinc-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-4 w-16" />
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
              <div className="flex justify-between">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-28" />
              </div>
              <div className="flex justify-between">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-28" />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Line Items Table */}
          <div className="bg-white border border-zinc-200 rounded-lg p-4">
            <Skeleton className="h-4 w-24 mb-4" />
            <div className="border border-zinc-200 rounded-lg overflow-hidden">
              {/* Table Header */}
              <div className="bg-zinc-50 border-b border-zinc-200 px-4 py-3 flex gap-4">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-3 w-12 ml-auto" />
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-3 w-20" />
              </div>
              {/* Table Rows */}
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="px-4 py-3 border-b border-zinc-200 flex gap-4 items-center"
                >
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-4 w-8 ml-auto" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-20" />
                </div>
              ))}
              {/* Footer */}
              <div className="bg-zinc-50 px-4 py-3 space-y-2">
                <div className="flex justify-end gap-4">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <div className="flex justify-end gap-4">
                  <Skeleton className="h-4 w-12" />
                  <Skeleton className="h-4 w-20" />
                </div>
                <div className="flex justify-end gap-4 pt-2 border-t border-zinc-300">
                  <Skeleton className="h-5 w-12" />
                  <Skeleton className="h-5 w-24" />
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="bg-white border border-zinc-200 rounded-lg p-4">
            <Skeleton className="h-4 w-16 mb-3" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4 mt-2" />
            <Skeleton className="h-4 w-1/2 mt-2" />
          </div>
        </div>
      </div>

      {/* Quick Navigation */}
      <div className="flex items-center gap-2 pt-4 border-t border-zinc-200">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-4 w-px bg-zinc-300" />
        <Skeleton className="h-4 w-28" />
      </div>
    </div>
  );
}
