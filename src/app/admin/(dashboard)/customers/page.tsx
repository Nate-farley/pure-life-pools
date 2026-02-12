import { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import { Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { CustomerList } from '@/components/customers';
import { listCustomers } from '@/app/actions/customers';

export const metadata: Metadata = {
  title: 'Customers',
  description: 'Manage your customer database',
};

/**
 * Customers List Page
 *
 * Server component that fetches initial data and renders the customer list.
 * Search and pagination are handled client-side for instant feedback.
 */
export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; page?: string }>;
}) {
  const params = await searchParams;
  const search = params.search ?? '';
  const page = parseInt(params.page ?? '1', 10);
  const limit = 25;
  const offset = (page - 1) * limit;

  // Fetch initial data server-side
  const result = await listCustomers({
    limit,
    offset,
    search: search || undefined,
    sortBy: 'created_at',
    sortOrder: 'desc',
  });

  const initialData = result.success
    ? { customers: result.data.customers, total: result.data.total }
    : { customers: [], total: 0 };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900">Customers</h1>
          <p className="text-sm text-zinc-500 mt-1">
            Manage your customer database
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/customers/new">
            <Plus className="w-4 h-4 mr-2" />
            Add Customer
          </Link>
        </Button>
      </div>

      {/* Customer List with Search and Pagination */}
      <Suspense fallback={<CustomerListSkeleton />}>
      {/* @ts-ignore */}
        <CustomerList initialData={initialData} />
      </Suspense>
    </div>
  );
}

/**
 * Skeleton for customer list loading state
 */
function CustomerListSkeleton() {
  return (
    <div className="space-y-4">
      {/* Search skeleton */}
      <div className="h-9 w-80 bg-zinc-200 rounded-md animate-pulse" />

      {/* Table skeleton */}
      <div className="bg-white border border-zinc-200 rounded-lg overflow-hidden">
        <div className="animate-pulse">
          {/* Header */}
          <div className="bg-zinc-50 border-b border-zinc-200 px-4 py-3">
            <div className="h-4 w-full max-w-md bg-zinc-200 rounded" />
          </div>
          {/* Rows */}
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="px-4 py-3 border-b border-zinc-200">
              <div className="h-4 w-full max-w-lg bg-zinc-200 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export const dynamic = 'force-dynamic';
