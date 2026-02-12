import { Metadata } from 'next';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { createCustomer, checkDuplicatePhone } from '@/app/actions/customers';
import { CustomerFormClient } from './customer-form-client';

export const metadata: Metadata = {
  title: 'New Customer',
  description: 'Create a new customer in the Pure Life Pools CRM system',
};

/**
 * New Customer Page
 *
 * Renders the customer creation form with server actions bound.
 * Uses the dashboard layout for consistent navigation.
 */
export default function NewCustomerPage() {
  return (
    <div className="space-y-6">
      {/* Page Header with Back Link */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/admin/customers" className="flex items-center gap-1">
            <ChevronLeft className="h-4 w-4" />
            Back to Customers
          </Link>
        </Button>
      </div>

      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900">Create Customer</h1>
        <p className="text-sm text-zinc-500 mt-1">
          Add a new customer to your database
        </p>
      </div>

      {/* Customer Form */}
      <CustomerFormClient
        createCustomerAction={createCustomer}
        checkDuplicateAction={checkDuplicatePhone}
      />
    </div>
  );
}

export const dynamic = 'force-dynamic';
