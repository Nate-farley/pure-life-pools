'use client';

/**
 * Estimates Table
 *
 * Displays estimates in a table format with sortable columns,
 * status badges, and row actions.
 */

import Link from 'next/link';
import { MoreHorizontal, Eye, Copy, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { EstimateStatusBadge } from './estimate-status-badge';
import { formatCents } from '@/lib/utils/currency';
import { duplicateEstimate, deleteEstimate } from '@/app/actions/estimates';
import type { EstimateSummary } from '@/lib/types/estimate';

// ============================================================================
// Utility Functions
// ============================================================================

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatPhoneDisplay(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  if (digits.length === 11 && digits.startsWith('1')) {
    return `(${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
  }
  return phone;
}

// ============================================================================
// Row Actions Dropdown
// ============================================================================

interface RowActionsProps {
  estimate: EstimateSummary;
}

function RowActions({ estimate }: RowActionsProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleDuplicate = async () => {
    setIsLoading(true);
    try {
      const result = await duplicateEstimate(estimate.id);
      if (result.success) {
        router.push(`/admin/estimates/${result.data.id}`);
      }
    } catch (error) {
      console.error('Failed to duplicate:', error);
    } finally {
      setIsLoading(false);
      setIsOpen(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this estimate?')) {
      return;
    }
    setIsLoading(true);
    try {
      const result = await deleteEstimate(estimate.id);
      if (result.success) {
        router.refresh();
      }
    } catch (error) {
      console.error('Failed to delete:', error);
    } finally {
      setIsLoading(false);
      setIsOpen(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center justify-center w-8 h-8 text-zinc-500 hover:text-zinc-700 hover:bg-zinc-100 rounded-md transition-colors"
        disabled={isLoading}
      >
        <MoreHorizontal className="w-4 h-4" />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-zinc-200 rounded-lg shadow-lg z-20 py-1">
            <Link
              href={`/admin/estimates/${estimate.id}`}
              className="flex items-center gap-2 px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-50"
              onClick={() => setIsOpen(false)}
            >
              <Eye className="w-4 h-4" />
              View Details
            </Link>
            <button
              onClick={handleDuplicate}
              disabled={isLoading}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-50 disabled:opacity-50"
            >
              <Copy className="w-4 h-4" />
              Duplicate
            </button>
            <button
              onClick={handleDelete}
              disabled={isLoading}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

interface EstimatesTableProps {
  estimates: EstimateSummary[];
}

export function EstimatesTable({ estimates }: EstimatesTableProps) {
  return (
    <div className="bg-white border border-zinc-200 rounded-lg overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-zinc-50 border-b border-zinc-200">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-600 uppercase tracking-wider">
              Estimate
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-600 uppercase tracking-wider">
              Customer
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-600 uppercase tracking-wider">
              Status
            </th>
            <th className="px-4 py-3 text-right text-xs font-semibold text-zinc-600 uppercase tracking-wider">
              Total
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-600 uppercase tracking-wider">
              Created
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-600 uppercase tracking-wider">
              Valid Until
            </th>
            <th className="px-4 py-3 w-12"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-200">
          {estimates.map((estimate) => {
            const isExpired =
              estimate.valid_until &&
              new Date(estimate.valid_until) < new Date() &&
              estimate.status === 'sent';

            return (
              <tr
                key={estimate.id}
                className="hover:bg-zinc-50 transition-colors"
              >
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/estimates/${estimate.id}`}
                    className="font-medium text-zinc-900 hover:text-blue-600"
                  >
                    {estimate.estimate_number}
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <div>
                    <Link
                      href={`/admin/customers/${estimate.customer.id}`}
                      className="text-zinc-900 hover:text-blue-600"
                    >
                      {estimate.customer.name}
                    </Link>
                    <p className="text-xs text-zinc-500">
                      {formatPhoneDisplay(estimate.customer.phone)}
                    </p>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <EstimateStatusBadge status={estimate.status} />
                </td>
                <td className="px-4 py-3 text-right tabular-nums font-medium text-zinc-900">
                  {formatCents(estimate.total_cents)}
                </td>
                <td className="px-4 py-3 text-zinc-600">
                  {formatDate(estimate.created_at)}
                </td>
                <td className="px-4 py-3">
                  {estimate.valid_until ? (
                    <span
                      className={
                        isExpired ? 'text-red-600 font-medium' : 'text-zinc-600'
                      }
                    >
                      {formatDate(estimate.valid_until)}
                      {isExpired && ' (Expired)'}
                    </span>
                  ) : (
                    <span className="text-zinc-400">—</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <RowActions estimate={estimate} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
