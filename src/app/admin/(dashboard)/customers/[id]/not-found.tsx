import Link from 'next/link';
import { UserX } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * Customer Not Found Page
 *
 * Shown when a customer ID doesn't exist or has been deleted.
 */

export default function CustomerNotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 rounded-full bg-zinc-100 flex items-center justify-center mb-6">
        <UserX className="w-8 h-8 text-zinc-400" />
      </div>

      <h1 className="text-2xl font-semibold text-zinc-900 mb-2">
        Customer Not Found
      </h1>

      <p className="text-sm text-zinc-500 mb-6 max-w-md">
        The customer you're looking for doesn't exist or may have been deleted.
        Please check the URL or go back to the customers list.
      </p>

      <div className="flex items-center gap-3">
        <Button variant="secondary" asChild>
          <Link href="/admin/customers">Back to Customers</Link>
        </Button>
        <Button asChild>
          <Link href="/admin/customers/new">Add New Customer</Link>
        </Button>
      </div>
    </div>
  );
}
