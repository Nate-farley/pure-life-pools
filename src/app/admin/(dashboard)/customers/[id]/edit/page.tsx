import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import { getCustomer } from '@/app/actions/customers';
import { Button } from '@/components/ui/button';
import { CustomerEditFormClient } from '@/components/customers/customer-edit-form-client';

/**
 * Customer Edit Page
 *
 * Server component that:
 * - Fetches existing customer data
 * - Renders breadcrumb navigation
 * - Passes data to client form component
 *
 * @route /admin/customers/:id/edit
 */

interface CustomerEditPageProps {
  params: Promise<{ id: string }>;
}

export default async function CustomerEditPage({
  params,
}: CustomerEditPageProps) {
  const { id } = await params;

  return (
    <Suspense fallback={<CustomerEditSkeleton />}>
      <CustomerEditContent customerId={id} />
    </Suspense>
  );
}

/**
 * Async content component that fetches and displays edit form.
 * Separated to work with Suspense boundary.
 */
async function CustomerEditContent({ customerId }: { customerId: string }) {
  const result = await getCustomer(customerId);

  if (!result.success || !result.data) {
    notFound();
  }

  const customer = result.data;

  return (
    <div className="space-y-6">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-sm">
        <Link
          href="/admin/customers"
          className="text-zinc-500 hover:text-zinc-900 transition-colors"
        >
          Customers
        </Link>
        <ChevronRight className="w-4 h-4 text-zinc-400" />
        <Link
          href={`/admin/customers/${customer.id}`}
          className="text-zinc-500 hover:text-zinc-900 transition-colors"
        >
          {customer.name}
        </Link>
        <ChevronRight className="w-4 h-4 text-zinc-400" />
        <span className="text-zinc-900">Edit</span>
      </nav>

      {/* Page Header with Back Link */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link
            href={`/admin/customers/${customer.id}`}
            className="flex items-center gap-1"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to Customer
          </Link>
        </Button>
      </div>

      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900">Edit Customer</h1>
        <p className="text-sm text-zinc-500 mt-1">
          Update customer information for {customer.name}
        </p>
      </div>

      {/* Edit Form */}
      <CustomerEditFormClient customer={customer} />
    </div>
  );
}

/**
 * Loading skeleton for the edit page
 */
function CustomerEditSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Breadcrumb skeleton */}
      <div className="flex items-center gap-2">
        <div className="h-4 w-20 bg-zinc-200 rounded" />
        <div className="h-4 w-4 bg-zinc-200 rounded" />
        <div className="h-4 w-32 bg-zinc-200 rounded" />
        <div className="h-4 w-4 bg-zinc-200 rounded" />
        <div className="h-4 w-12 bg-zinc-200 rounded" />
      </div>

      {/* Back button skeleton */}
      <div className="h-9 w-40 bg-zinc-200 rounded" />

      {/* Title skeleton */}
      <div className="space-y-2">
        <div className="h-8 w-48 bg-zinc-200 rounded" />
        <div className="h-4 w-64 bg-zinc-200 rounded" />
      </div>

      {/* Form skeleton */}
      <div className="max-w-2xl bg-white border border-zinc-200 rounded-lg p-6 space-y-6">
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 w-20 bg-zinc-200 rounded" />
              <div className="h-9 w-full bg-zinc-100 rounded" />
            </div>
          ))}
        </div>
        <div className="flex gap-3 pt-4">
          <div className="h-9 w-24 bg-zinc-200 rounded" />
          <div className="h-9 w-32 bg-zinc-900 rounded" />
        </div>
      </div>
    </div>
  );
}

/**
 * Generate metadata for SEO and browser tab
 */
export async function generateMetadata({
  params,
}: CustomerEditPageProps): Promise<Metadata> {
  const { id } = await params;
  const result = await getCustomer(id);

  if (!result.success || !result.data) {
    return {
      title: 'Customer Not Found | Pure Life Pools CRM',
    };
  }

  return {
    title: `Edit ${result.data.name} | Pure Life Pools CRM`,
    description: `Edit customer details for ${result.data.name}`,
  };
}
