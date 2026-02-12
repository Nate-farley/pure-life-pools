
import * as React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight, Search, Users, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { searchCustomers } from '@/app/actions/customers';
import ClientCustomerSelector from '@/components/estimates/client-customer-selector';

/**
 * Select Customer Page
 *
 * Customer search/selection before creating a new estimate.
 */

interface CustomerResult {
  id: string;
  name: string;
  phone: string;
  email: string | null;
}

export default function SelectCustomerPage() {

  return (
    <div className="max-w-2xl mx-auto">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm mb-6">
        <Link href="/admin/estimates" className="text-zinc-500 hover:text-zinc-900">
          Estimates
        </Link>
        <ChevronRight className="w-4 h-4 text-zinc-400" />
        <Link href="/admin/estimates/new" className="text-zinc-500 hover:text-zinc-900">
          New Estimate
        </Link>
        <ChevronRight className="w-4 h-4 text-zinc-400" />
        <span className="text-zinc-900">Select Customer</span>
      </nav>

      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-zinc-900">Select Customer</h1>
        <p className="text-sm text-zinc-500 mt-1">
          Search for a customer to create an estimate for.
        </p>
      </div>

      <ClientCustomerSelector />

      {/* Cancel */}
      <div className="mt-4 text-center">
        <Button variant="ghost" asChild>
          <Link href="/admin/estimates">Cancel</Link>
        </Button>
      </div>
    </div>
  );
}

export const dynamic = 'force-dynamic';
