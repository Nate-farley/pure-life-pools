'use client';

import * as React from 'react';
import Link from 'next/link';
import { Plus, FileText, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { EstimateCard, EstimateCardSkeleton, CompactEstimateRow } from './estimate-card';
import {
  listEstimates,
  deleteEstimate,
  duplicateEstimate,
} from '@/app/actions/estimates';
import { formatCurrency } from '@/lib/validations/estimate';
import type { Estimate } from '@/lib/types/database';

/**
 * Estimate List Component
 *
 * Displays a list of estimates with:
 * - Estimate cards
 * - Pagination (load more)
 * - Delete confirmation
 * - Duplicate functionality
 */

interface CustomerInfo {
  id: string;
  name: string;
  phone: string;
  email: string | null;
}

interface PoolInfo {
  id: string;
  type: string;
  property: {
    id: string;
    address_line1: string;
    city: string;
    state: string;
  };
}

interface EstimateWithCustomer extends Estimate {
  customer: CustomerInfo;
  pool?: PoolInfo | null;
}

interface EstimateListProps {
  /** Customer ID to filter estimates */
  customerId?: string;
  /** Initial estimates (for server-side rendering) */
  initialEstimates?: EstimateWithCustomer[];
  /** Whether to show customer info in cards */
  showCustomer?: boolean;
  /** Variant: 'cards' for full cards, 'compact' for row format */
  variant?: 'cards' | 'compact';
  /** URL for new estimate button */
  newEstimateUrl?: string;
}

export function EstimateList({
  customerId,
  initialEstimates = [],
  showCustomer = true,
  variant = 'cards',
  newEstimateUrl,
}: EstimateListProps) {
  const [estimates, setEstimates] = React.useState<EstimateWithCustomer[]>(initialEstimates);
  const [deletingEstimate, setDeletingEstimate] = React.useState<EstimateWithCustomer | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [isDuplicating, setIsDuplicating] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  console.log(estimates)

  // Pagination state
  const [isLoadingMore, setIsLoadingMore] = React.useState(false);
  const [hasMore, setHasMore] = React.useState(initialEstimates.length >= 25);
  const [cursor, setCursor] = React.useState<string | null>(null);

  // Initialize cursor from initial estimates
  React.useEffect(() => {
    if (initialEstimates.length > 0 && initialEstimates.length >= 25) {
      const lastEstimate = initialEstimates[initialEstimates.length - 1];
      setCursor(
        Buffer.from(
          JSON.stringify({ createdAt: lastEstimate.created_at })
        ).toString('base64')
      );
    }
  }, []);

  // Handle duplicate
  const handleDuplicate = async (estimate: EstimateWithCustomer) => {
    setIsDuplicating(estimate.id);
    setError(null);

    try {
      const result = await duplicateEstimate(estimate.id);

      if (result.success && result.data) {
        // Add the new estimate to the list
        setEstimates((prev) => [result.data!, ...prev]);
      } else {
        setError(result.error ?? 'Failed to duplicate estimate');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setIsDuplicating(null);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!deletingEstimate) return;

    setIsDeleting(true);
    setError(null);

    try {
      const result = await deleteEstimate(deletingEstimate.id);

      if (result.success) {
        setEstimates((prev) => prev.filter((e) => e.id !== deletingEstimate.id));
        setDeletingEstimate(null);
      } else {
        setError(result.error ?? 'Failed to delete estimate');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setIsDeleting(false);
    }
  };

  // Load more estimates
  const handleLoadMore = async () => {
    if (isLoadingMore || !hasMore) return;

    setIsLoadingMore(true);
    setError(null);

    try {
      const result = await listEstimates({
        limit: 25,
        cursor: cursor ?? undefined,
        customerId,
      });

      if (result.success && result.data) {
        setEstimates((prev) => [...prev, ...result.data!.estimates]);
        setHasMore(result.data.hasMore);
        setCursor(result.data.nextCursor);
      } else {
        setError(result.error ?? 'Failed to load more estimates');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setIsLoadingMore(false);
    }
  };

  // Determine new estimate URL
  const createUrl = newEstimateUrl ?? (customerId
    ? `/admin/estimates/new?customerId=${customerId}`
    : '/admin/estimates/new');

  return (
    <div className="space-y-4">
      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-zinc-500">
          {estimates.length === 0
            ? 'No estimates yet'
            : `${estimates.length} ${estimates.length === 1 ? 'estimate' : 'estimates'}`}
        </p>
        <Button size="sm" asChild>
          <Link href={createUrl}>
            <Plus className="w-4 h-4 mr-2" />
            New Estimate
          </Link>
        </Button>
      </div>

      {/* Estimates List */}
      {estimates.length > 0 ? (
        <div className={variant === 'cards' ? 'grid gap-4 sm:grid-cols-2' : 'space-y-2'}>
          {estimates.map((estimate) =>
            variant === 'cards' ? (
              <div key={estimate.id} className="relative">
                {isDuplicating === estimate.id && (
                  <div className="absolute inset-0 bg-white/80 z-10 flex items-center justify-center rounded-lg">
                    <Loader2 className="w-6 h-6 animate-spin text-zinc-400" />
                  </div>
                )}
                <EstimateCard
                  estimate={estimate}
                  showCustomer={showCustomer}
                  onDuplicate={handleDuplicate}
                  onDelete={setDeletingEstimate}
                />
              </div>
            ) : (
              <CompactEstimateRow
                key={estimate.id}
                estimate={estimate}
                showCustomer={showCustomer}
              />
            )
          )}
        </div>
      ) : (
        <EmptyState createUrl={createUrl} />
      )}

      {/* Load More */}
      {hasMore && estimates.length > 0 && (
        <div className="flex justify-center pt-4">
          <Button
            variant="secondary"
            onClick={handleLoadMore}
            disabled={isLoadingMore}
          >
            {isLoadingMore ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Loading...
              </>
            ) : (
              'Load More Estimates'
            )}
          </Button>
        </div>
      )}

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deletingEstimate}
        onOpenChange={(open) => !open && setDeletingEstimate(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Estimate</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this estimate?
              {deletingEstimate && (
                <span className="block mt-2 font-medium text-zinc-900">
                  {deletingEstimate.estimate_number} -{' '}
                  {formatCurrency(deletingEstimate.total_cents)}
                </span>
              )}
              <span className="block mt-2 text-amber-600 font-medium">
                This action cannot be undone.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              {isDeleting ? 'Deleting...' : 'Delete Estimate'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

/**
 * Empty State Component
 */
function EmptyState({ createUrl }: { createUrl: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center bg-white border border-zinc-200 rounded-lg">
      <div className="w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center mb-4">
        <FileText className="w-6 h-6 text-zinc-400" />
      </div>
      <h3 className="text-sm font-medium text-zinc-900 mb-1">
        No estimates yet
      </h3>
      <p className="text-sm text-zinc-500 mb-4 max-w-sm">
        Create an estimate to provide quotes for pool services.
      </p>
      <Button asChild>
        <Link href={createUrl}>
          <Plus className="w-4 h-4 mr-2" />
          New Estimate
        </Link>
      </Button>
    </div>
  );
}

/**
 * Estimate List Skeleton
 */
export function EstimateListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="h-4 w-20 bg-zinc-200 rounded animate-pulse" />
        <div className="h-9 w-32 bg-zinc-200 rounded animate-pulse" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {Array.from({ length: count }).map((_, i) => (
          <EstimateCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
