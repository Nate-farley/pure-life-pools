'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Plus, Users, AlertCircle, RefreshCw } from 'lucide-react';

import { listCustomers, type ListCustomersParams } from '@/app/actions/customers';
import { Button } from '@/components/ui/button';
import { SearchInput } from '@/components/ui/search-input';
import { Pagination } from '@/components/ui/pagination';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CustomersTable } from './customers-table';
import type { Customer } from '@/lib/types/database';

/**
 * Customer List Component
 *
 * Client component that handles:
 * - Search with debouncing
 * - Pagination
 * - Loading and error states
 * - URL state synchronization
 */

const ITEMS_PER_PAGE = 25;

interface CustomerListProps {
  initialData?: {
    customers: Customer[];
    total: number;
  };
}

export function CustomerList({ initialData }: CustomerListProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get initial values from URL
  const initialSearch = searchParams.get('search') ?? '';
  const initialPage = parseInt(searchParams.get('page') ?? '1', 10);

  // State
  const [customers, setCustomers] = React.useState<Customer[]>(
    initialData?.customers ?? []
  );
  const [total, setTotal] = React.useState(initialData?.total ?? 0);
  const [search, setSearch] = React.useState(initialSearch);
  const [currentPage, setCurrentPage] = React.useState(initialPage);
  const [isLoading, setIsLoading] = React.useState(!initialData);
  const [error, setError] = React.useState<string | null>(null);

  // Calculate pagination
  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  // Fetch customers
  const fetchCustomers = React.useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const params: ListCustomersParams = {
      limit: ITEMS_PER_PAGE,
      offset,
      search: search || undefined,
      sortBy: 'created_at',
      sortOrder: 'desc',
    };

    const result = await listCustomers(params);
    console.log(result)
    if (result.success) {
      setCustomers(result.data.items);
      setTotal(result.data.total);
    } else {
      setError(result.error);
    }

    setIsLoading(false);
  }, [search, offset]);

  // Fetch on mount and when dependencies change
  React.useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  // Update URL when search or page changes
  React.useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (currentPage > 1) params.set('page', currentPage.toString());

    const queryString = params.toString();
    const newUrl = queryString ? `/admin/customers?${queryString}` : '/admin/customers';

    // Only update if different
    if (window.location.pathname + window.location.search !== newUrl) {
      router.replace(newUrl, { scroll: false });
    }
  }, [search, currentPage, router]);

  // Handle search change
  const handleSearchChange = React.useCallback((value: string) => {
    setSearch(value);
    setCurrentPage(1); // Reset to first page on search
  }, []);

  // Handle page change
  const handlePageChange = React.useCallback((page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Handle retry
  const handleRetry = React.useCallback(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  // Determine what to render
  const isEmpty = !isLoading && customers.length === 0;
  const isSearchEmpty = isEmpty && search.length > 0;
  const isNoCustomers = isEmpty && search.length === 0;

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex items-center gap-3">
        <div className="flex-1 max-w-md">
          <SearchInput
            value={search}
            onChange={handleSearchChange}
            placeholder="Search by name or phone..."
            debounceMs={300}
          />
        </div>
        {/* Customer count */}
        {!isLoading && total > 0 && (
          <p className="text-sm text-zinc-500">
            {total} customer{total !== 1 ? 's' : ''}
          </p>
        )}
      </div>

      {/* Error State */}
      {error && (
        <Alert variant="error">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>{error}</span>
            <Button variant="ghost" size="sm" onClick={handleRetry}>
              <RefreshCw className="h-4 w-4 mr-1" />
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Empty State: No Search Results */}
      {isSearchEmpty && (
        <EmptySearchState
          query={search}
          onClear={() => handleSearchChange('')}
        />
      )}

      {/* Empty State: No Customers */}
      {isNoCustomers && !error && <EmptyState />}

      {/* Customers Table */}
      {!isEmpty && !error && (
        <div className="bg-white border border-zinc-200 rounded-lg overflow-hidden">
          <CustomersTable customers={customers} isLoading={isLoading} />
        </div>
      )}

      {/* Pagination */}
      {!isEmpty && totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={total}
          itemsPerPage={ITEMS_PER_PAGE}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
}

/**
 * Empty State: No customers in system
 */
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center bg-white border border-zinc-200 rounded-lg">
      <div className="w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center mb-4">
        <Users className="w-6 h-6 text-zinc-400" />
      </div>
      <h3 className="text-sm font-medium text-zinc-900 mb-1">
        No customers yet
      </h3>
      <p className="text-sm text-zinc-500 mb-4 max-w-sm">
        Get started by adding your first customer to the system.
      </p>
      <Button asChild>
        <Link href="/admin/customers/new">
          <Plus className="w-4 h-4 mr-2" />
          Add Customer
        </Link>
      </Button>
    </div>
  );
}

/**
 * Empty State: No search results
 */
interface EmptySearchStateProps {
  query: string;
  onClear: () => void;
}

function EmptySearchState({ query, onClear }: EmptySearchStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center bg-white border border-zinc-200 rounded-lg">
      <div className="w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center mb-4">
        <Users className="w-6 h-6 text-zinc-400" />
      </div>
      <h3 className="text-sm font-medium text-zinc-900 mb-1">
        No customers found
      </h3>
      <p className="text-sm text-zinc-500 mb-4 max-w-sm">
        No customers match "<span className="font-medium">{query}</span>".
        <br />
        Try a different search term or clear the search.
      </p>
      <div className="flex gap-2">
        <Button variant="secondary" onClick={onClear}>
          Clear Search
        </Button>
        <Button asChild>
          <Link href="/admin/customers/new">
            <Plus className="w-4 h-4 mr-2" />
            Add Customer
          </Link>
        </Button>
      </div>
    </div>
  );
}
