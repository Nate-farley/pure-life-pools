import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { getCustomer } from '@/app/actions/customers';
import { CustomerDetailHeader } from '@/components/customers/customer-detail-header';
import { CustomerDetailTabs } from '@/components/customers/customer-detail-tabs';
import { CustomerDetailSkeleton } from '@/components/customers/customer-detail-skeleton';

/**
 * Customer Detail Page
 *
 * Server component that displays full customer information with:
 * - Breadcrumb navigation
 * - Contact info header with avatar
 * - Quick action buttons
 * - Tabbed content for properties, communications, estimates, notes
 *
 * @route /admin/customers/:id
 */

interface CustomerDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function CustomerDetailPage({
  params,
}: CustomerDetailPageProps) {
  const { id } = await params;

  return (
    <Suspense fallback={<CustomerDetailSkeleton />}>
      <CustomerDetailContent customerId={id} />
    </Suspense>
  );
}

/**
 * Async content component that fetches and displays customer data.
 * Separated to work with Suspense boundary.
 */
async function CustomerDetailContent({ customerId }: { customerId: string }) {
  const result = await getCustomer(customerId);

  console.log("Customer fetch result:", result);

  if (!result.success || !result.data) {
    notFound();
  }

  const customer = result.data;

  return (
    <div className="space-y-6">
      {/* Breadcrumb + Header */}
      <CustomerDetailHeader customer={customer} />

      {/* Tabbed Content */}
      <CustomerDetailTabs customer={customer} />
    </div>
  );
}

/**
 * Generate metadata for SEO and browser tab
 */
export async function generateMetadata({ params }: CustomerDetailPageProps) {
  const { id } = await params;
  const result = await getCustomer(id);

  if (!result.success || !result.data) {
    return {
      title: 'Customer Not Found | Pure Life Pools CRM',
    };
  }

  return {
    title: `${result.data.name} | Pure Life Pools CRM`,
    description: `Customer details for ${result.data.name}`,
  };
}
