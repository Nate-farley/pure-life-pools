import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { createAdminClient } from '@/lib/supabase/server';
import { EstimateForm } from '@/components/estimates/estimate-form';

/**
 * New Estimate Page
 *
 * Creates a new estimate for a customer.
 * Requires customerId query param - redirects to customer selection if not provided.
 */

interface NewEstimatePageProps {
  searchParams: Promise<{
    customerId?: string;
    poolId?: string;
  }>;
}

export default async function NewEstimatePage({ searchParams }: NewEstimatePageProps) {
  const params = await searchParams;
  const { customerId, poolId } = params;

  // If no customer specified, redirect to customer selection
  if (!customerId) {
    redirect('/admin/estimates/new/select-customer');
  }

  // Fetch customer details
  const supabase = createAdminClient();
  const { data: customer, error } = await supabase
    .from('customers')
    .select('id, name, phone, email')
    .eq('id', customerId)
    .is('deleted_at', null)
    .single();

  if (error || !customer) {
    notFound();
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm mb-6">
        <Link href="/admin/estimates" className="text-zinc-500 hover:text-zinc-900">
          Estimates
        </Link>
        <ChevronRight className="w-4 h-4 text-zinc-400" />
        <span className="text-zinc-900">New Estimate</span>
      </nav>

      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-zinc-900">New Estimate</h1>
        <p className="text-sm text-zinc-500 mt-1">
          {/* @ts-ignore */}
          Create a new estimate for {customer.name}
        </p>
      </div>

      {/* Form */}
      <div className="bg-white border border-zinc-200 rounded-lg p-6">
        <EstimateForm
          customer={customer}
          initialPoolId={poolId ?? null}
          redirectTo={`/admin/customers/${customerId}`}
        />
      </div>
    </div>
  );
}

export const dynamic = 'force-dynamic';
