/**
 * Calendar Skeleton
 *
 * @file src/app/(dashboard)/calendar/admin/calendar-skeleton.tsx
 *
 * Loading skeleton for the calendar view.
 */

import { Skeleton } from '@/components/ui/skeleton';

export function CalendarSkeleton() {
  return (
    <div className="bg-white border border-zinc-200 rounded-lg p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-9" />
          <Skeleton className="h-9 w-9" />
          <Skeleton className="h-9 w-20" />
        </div>
        <Skeleton className="h-8 w-48" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-16" />
          <Skeleton className="h-9 w-16" />
          <Skeleton className="h-9 w-16" />
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="space-y-1">
        {/* Day headers */}
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: 7 }).map((_, i) => (
            <Skeleton key={i} className="h-8" />
          ))}
        </div>

        {/* Calendar cells */}
        {Array.from({ length: 6 }).map((_, weekIndex) => (
          <div key={weekIndex} className="grid grid-cols-7 gap-1">
            {Array.from({ length: 7 }).map((_, dayIndex) => (
              <Skeleton key={dayIndex} className="h-24" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
