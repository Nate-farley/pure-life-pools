'use client';

import { useRouter } from 'next/navigation';
import { CustomerForm } from '@/components/forms/customer-form';
import type { CreateCustomerInput } from '@/lib/validations/customer';
import type { Customer } from '@/lib/types/database';
import type { ActionResult } from '@/lib/types/api';

/**
 * Client component wrapper for CustomerForm
 *
 * Handles navigation after successful customer creation
 * and wraps the server actions for client-side usage.
 */

interface CustomerFormClientProps {
  createCustomerAction: (data: CreateCustomerInput) => Promise<ActionResult<Customer>>;
  checkDuplicateAction: (phone: string) => Promise<ActionResult<{
    id: string;
    name: string;
    phone: string;
    email: string | null;
  } | null>>;
}

export function CustomerFormClient({
  createCustomerAction,
  checkDuplicateAction,
}: CustomerFormClientProps) {
  const router = useRouter();

  const handleSuccess = (customer: Customer) => {
    // Navigate to the new customer's detail page
    router.push(`/admin/customers/${customer.id}`);
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <CustomerForm
      onSubmit={createCustomerAction}
      checkDuplicatePhone={checkDuplicateAction}
      onSuccess={handleSuccess}
      onCancel={handleCancel}
    />
  );
}
