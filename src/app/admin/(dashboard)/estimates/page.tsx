/**
 * Estimates List Page
 *
 * Main estimates page showing all estimates with filtering,
 * search, and pagination. Accessible from sidebar navigation.
 */

import { Suspense } from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { listEstimates } from '@/app/actions/estimates';
import { EstimatesTable } from '@/components/estimates/estimates-table';
import { EstimatesFilters } from '@/components/estimates/estimates-filters';
import { EstimatesListSkeleton } from '@/components/estimates/estimates-list-skeleton';
import { EstimatesEmptyState } from '@/components/estimates/estimates-empty-state';
import type { EstimateStatus } from '@/lib/validations/estimate';

// ============================================================================
// Metadata
// ============================================================================

export const metadata = {
  title: 'Estimates | Pure Life Pools CRM',
  description: 'Manage customer estimates and quotes',
};

// ============================================================================
// Types
// ============================================================================

interface PageProps {
  searchParams: Promise<{
    page?: string;
    status?: EstimateStatus;
    search?: string;
  }>;
}

// ============================================================================
// Content Component
// ============================================================================

async function EstimatesContent({
  page,
  status,
  search,
}: {
  page: number;
  status?: EstimateStatus;
  search?: string;
}) {
  const limit = 25;
  const offset = (page - 1) * limit;

  const result = await listEstimates({
    limit,
    offset,
    status,
    sortBy: 'created_at',
    sortOrder: 'desc',
  });

  if (!result.success) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg text-red-700">
        <p className="text-sm">Failed to load estimates: {result.error}</p>
      </div>
    );
  }

  const { estimates, total, hasMore } = result.data;

  if (estimates.length === 0 && !status && !search) {
    return <EstimatesEmptyState />;
  }

  if (estimates.length === 0) {
    return (
      <div className="p-8 text-center bg-white border border-zinc-200 rounded-lg">
        <p className="text-zinc-500">No estimates match your filters.</p>
        <Link
          href="/admin/estimates"
          className="text-sm text-blue-600 hover:text-blue-700 mt-2 inline-block"
        >
          Clear filters
        </Link>
      </div>
    );
  }

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-4">
      <EstimatesTable estimates={estimates} />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 bg-white border border-zinc-200 rounded-lg">
          <p className="text-sm text-zinc-500">
            Showing {offset + 1}-{Math.min(offset + limit, total)} of {total} estimates
          </p>
          <div className="flex items-center gap-2">
            {page > 1 && (
              <Link
                href={`/admin/estimates?page=${page - 1}${status ? `&status=${status}` : ''}`}
                className="inline-flex items-center justify-center h-8 px-3 text-sm font-medium text-zinc-700 bg-white border border-zinc-300 rounded-md hover:bg-zinc-50"
              >
                Previous
              </Link>
            )}
            <span className="text-sm text-zinc-600">
              Page {page} of {totalPages}
            </span>
            {hasMore && (
              <Link
                href={`/admin/estimates?page=${page + 1}${status ? `&status=${status}` : ''}`}
                className="inline-flex items-center justify-center h-8 px-3 text-sm font-medium text-zinc-700 bg-white border border-zinc-300 rounded-md hover:bg-zinc-50"
              >
                Next
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Page Component
// ============================================================================

export default async function EstimatesPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? '1', 10) || 1);
  const status = params.status;
  const search = params.search;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900">Estimates</h1>
          <p className="text-sm text-zinc-500 mt-1">
            Create and manage customer quotes
          </p>
        </div>
        <Link
          href="/admin/estimates/new"
          className="inline-flex items-center justify-center h-9 px-4 bg-zinc-900 hover:bg-zinc-800 active:bg-zinc-950 text-white text-sm font-medium rounded-md transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Estimate
        </Link>
      </div>

      {/* Filters */}
      <EstimatesFilters currentStatus={status} />

      {/* Content */}
      <Suspense fallback={<EstimatesListSkeleton />}>
        <EstimatesContent page={page} status={status} search={search} />
      </Suspense>
    </div>
  );
}

export const dynamic = 'force-dynamic';
