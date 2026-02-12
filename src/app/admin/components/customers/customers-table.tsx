'use client';

import * as React from 'react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { ChevronRight, Phone, Mail } from 'lucide-react';
import { formatPhone } from '@/lib/utils/phone';
import { cn } from '@/lib/utils';
import type { Customer } from '@/lib/types/database';

/**
 * Customers Table Component
 *
 * Displays a paginated list of customers in a table format.
 * Each row is clickable to navigate to customer details.
 */

interface CustomersTableProps {
  customers: Customer[];
  isLoading?: boolean;
}

export function CustomersTable({ customers, isLoading }: CustomersTableProps) {
  if (isLoading) {
    return <CustomersTableSkeleton />;
  }

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-zinc-50 border-b border-zinc-200">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-600 uppercase tracking-wider">
              Customer
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-600 uppercase tracking-wider">
              Phone
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-600 uppercase tracking-wider hidden md:table-cell">
              Email
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-600 uppercase tracking-wider hidden lg:table-cell">
              Source
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-600 uppercase tracking-wider hidden sm:table-cell">
              Added
            </th>
            <th className="px-4 py-3 w-10">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-200">
          {customers.map((customer) => (
            <CustomerRow key={customer.id} customer={customer} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * Customer Row Component
 */
interface CustomerRowProps {
  customer: Customer;
}

function CustomerRow({ customer }: CustomerRowProps) {
  const formattedPhone = formatPhone(customer.phone);
  const timeAgo = formatDistanceToNow(new Date(customer.created_at), {
    addSuffix: true,
  });

  return (
    <tr className="hover:bg-zinc-50 transition-colors group">
      {/* Customer Name */}
      <td className="px-4 py-3">
        <Link
          href={`/admin/customers/${customer.id}`}
          className="font-medium text-zinc-900 hover:text-blue-600 transition-colors"
        >
          {customer.name}
        </Link>
      </td>

      {/* Phone */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-2 text-zinc-600">
          <Phone className="w-4 h-4 text-zinc-400 hidden sm:block" />
          <span>{formattedPhone}</span>
        </div>
      </td>

      {/* Email */}
      <td className="px-4 py-3 hidden md:table-cell">
        {customer.email ? (
          <div className="flex items-center gap-2 text-zinc-600">
            <Mail className="w-4 h-4 text-zinc-400" />
            <span className="truncate max-w-[200px]">{customer.email}</span>
          </div>
        ) : (
          <span className="text-zinc-400">—</span>
        )}
      </td>

      {/* Source */}
      <td className="px-4 py-3 hidden lg:table-cell">
        {customer.source ? (
          <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full bg-zinc-100 text-zinc-700 capitalize">
            {customer.source.replace('_', ' ')}
          </span>
        ) : (
          <span className="text-zinc-400">—</span>
        )}
      </td>

      {/* Created At */}
      <td className="px-4 py-3 text-zinc-500 hidden sm:table-cell">
        {timeAgo}
      </td>

      {/* Action */}
      <td className="px-4 py-3">
        <Link
          href={`/admin/customers/${customer.id}`}
          className="text-zinc-400 group-hover:text-zinc-600 transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </Link>
      </td>
    </tr>
  );
}

/**
 * Skeleton Loading State
 */
function CustomersTableSkeleton() {
  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-zinc-50 border-b border-zinc-200">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-600 uppercase tracking-wider">
              Customer
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-600 uppercase tracking-wider">
              Phone
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-600 uppercase tracking-wider hidden md:table-cell">
              Email
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-600 uppercase tracking-wider hidden lg:table-cell">
              Source
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-600 uppercase tracking-wider hidden sm:table-cell">
              Added
            </th>
            <th className="px-4 py-3 w-10" />
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-200">
          {Array.from({ length: 5 }).map((_, i) => (
            <tr key={i} className="animate-pulse">
              <td className="px-4 py-3">
                <div className="h-4 w-32 bg-zinc-200 rounded" />
              </td>
              <td className="px-4 py-3">
                <div className="h-4 w-28 bg-zinc-200 rounded" />
              </td>
              <td className="px-4 py-3 hidden md:table-cell">
                <div className="h-4 w-40 bg-zinc-200 rounded" />
              </td>
              <td className="px-4 py-3 hidden lg:table-cell">
                <div className="h-4 w-20 bg-zinc-200 rounded" />
              </td>
              <td className="px-4 py-3 hidden sm:table-cell">
                <div className="h-4 w-24 bg-zinc-200 rounded" />
              </td>
              <td className="px-4 py-3">
                <div className="h-4 w-4 bg-zinc-200 rounded" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
