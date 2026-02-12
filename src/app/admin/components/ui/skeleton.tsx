import { cn } from '@/lib/utils';

/**
 * Skeleton Component
 *
 * Loading placeholder with pulse animation.
 */

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md bg-zinc-200',
        className
      )}
    />
  );
}

/**
 * Table Row Skeleton
 *
 * Skeleton for a table row with multiple columns.
 */
interface TableRowSkeletonProps {
  columns?: number;
  className?: string;
}

export function TableRowSkeleton({ columns = 4, className }: TableRowSkeletonProps) {
  return (
    <tr className={cn('border-b border-zinc-200', className)}>
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <Skeleton className="h-4 w-full max-w-[120px]" />
        </td>
      ))}
    </tr>
  );
}

/**
 * Card Skeleton
 *
 * Skeleton for a card component.
 */
export function CardSkeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'bg-white border border-zinc-200 rounded-lg p-4 space-y-3',
        className
      )}
    >
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="h-4 w-2/3" />
      <Skeleton className="h-4 w-1/2" />
    </div>
  );
}
