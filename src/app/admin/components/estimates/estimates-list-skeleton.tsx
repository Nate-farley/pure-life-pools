/**
 * Estimates List Skeleton
 *
 * Loading state for the estimates list page.
 */

// ============================================================================
// Skeleton Helper
// ============================================================================

function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-zinc-200 rounded ${className}`} />
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function EstimatesListSkeleton() {
  return (
    <div className="bg-white border border-zinc-200 rounded-lg overflow-hidden">
      <table className="w-full">
        <thead className="bg-zinc-50 border-b border-zinc-200">
          <tr>
            <th className="px-4 py-3 text-left">
              <Skeleton className="h-3 w-16" />
            </th>
            <th className="px-4 py-3 text-left">
              <Skeleton className="h-3 w-20" />
            </th>
            <th className="px-4 py-3 text-left">
              <Skeleton className="h-3 w-14" />
            </th>
            <th className="px-4 py-3 text-right">
              <Skeleton className="h-3 w-12 ml-auto" />
            </th>
            <th className="px-4 py-3 text-left">
              <Skeleton className="h-3 w-16" />
            </th>
            <th className="px-4 py-3 text-left">
              <Skeleton className="h-3 w-20" />
            </th>
            <th className="px-4 py-3 w-12"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-200">
          {Array.from({ length: 10 }).map((_, i) => (
            <tr key={i}>
              <td className="px-4 py-3">
                <Skeleton className="h-4 w-24" />
              </td>
              <td className="px-4 py-3">
                <Skeleton className="h-4 w-32 mb-1" />
                <Skeleton className="h-3 w-28" />
              </td>
              <td className="px-4 py-3">
                <Skeleton className="h-5 w-16 rounded-full" />
              </td>
              <td className="px-4 py-3">
                <Skeleton className="h-4 w-20 ml-auto" />
              </td>
              <td className="px-4 py-3">
                <Skeleton className="h-4 w-24" />
              </td>
              <td className="px-4 py-3">
                <Skeleton className="h-4 w-24" />
              </td>
              <td className="px-4 py-3">
                <Skeleton className="h-8 w-8 rounded-md" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
