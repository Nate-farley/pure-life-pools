'use client';

/**
 * Estimate Detail Content
 *
 * Main content component for the estimate detail page.
 * Displays estimate information, customer details, pool details (if any),
 * line items, and action buttons.
 */

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  User,
  Phone,
  Mail,
  MapPin,
  Droplets,
  Calendar,
  FileText,
  Copy,
  Printer,
  Trash2,
  ChevronRight,
  AlertCircle,
} from 'lucide-react';
import { EstimateStatusBadge } from './estimate-status-badge';
import { EstimateLineItemsTable } from './estimate-line-items';
import { EstimateStatusActions } from './estimate-status-actions';
import type { EstimateWithDetails } from '@/lib/types/estimate';
import { formatCents } from '@/lib/utils/currency';
import { duplicateEstimate, deleteEstimate } from '@/app/actions/estimates';

// ============================================================================
// Utility Functions
// ============================================================================

function formatDate(dateString: string | null): string {
  if (!dateString) return '—';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function formatDateTime(dateString: string): string {
  return new Date(dateString).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function formatPhoneDisplay(phone: string): string {
  // Format E.164 to display format
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 11 && digits.startsWith('1')) {
    const areaCode = digits.slice(1, 4);
    const prefix = digits.slice(4, 7);
    const lineNumber = digits.slice(7, 11);
    return `(${areaCode}) ${prefix}-${lineNumber}`;
  }
  return phone;
}

function formatPoolType(type: string): string {
  const types: Record<string, string> = {
    inground: 'Inground',
    above_ground: 'Above Ground',
    spa: 'Spa',
    other: 'Other',
  };
  return types[type] || type;
}

function formatSurfaceType(type: string | null): string {
  if (!type) return '—';
  const surfaces: Record<string, string> = {
    plaster: 'Plaster',
    pebble: 'Pebble',
    tile: 'Tile',
    vinyl: 'Vinyl',
    fiberglass: 'Fiberglass',
  };
  return surfaces[type] || type;
}

// ============================================================================
// Component
// ============================================================================

interface EstimateDetailContentProps {
  estimate: EstimateWithDetails;
}

export function EstimateDetailContent({ estimate }: EstimateDetailContentProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDuplicating, setIsDuplicating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDuplicate = async () => {
    setIsDuplicating(true);
    setError(null);

    try {
      const result = await duplicateEstimate(estimate.id);

      if (!result.success) {
        setError(result.error);
        return;
      }

      // Navigate to the new estimate
      router.push(`/admin/estimates/${result.data.id}`);
    } catch (err) {
      setError('Failed to duplicate estimate');
      console.error('Duplicate error:', err);
    } finally {
      setIsDuplicating(false);
    }
  };

  const handleDelete = async () => {
    if (
      !confirm(
        'Are you sure you want to delete this estimate? This action cannot be undone.'
      )
    ) {
      return;
    }

    setIsDeleting(true);
    setError(null);

    try {
      const result = await deleteEstimate(estimate.id);

      if (!result.success) {
        setError(result.error);
        return;
      }

      // Navigate back to estimates list
      router.push('/admin/estimates');
    } catch (err) {
      setError('Failed to delete estimate');
      console.error('Delete error:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const isExpired =
    estimate.valid_until && new Date(estimate.valid_until) < new Date();

  return (
    <div className="space-y-6">
      {/* Error Alert */}
      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm">{error}</p>
          <button
            onClick={() => setError(null)}
            className="ml-auto text-red-500 hover:text-red-700"
          >
            ×
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between gap-4 print:hidden">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold text-zinc-900">
              {estimate.estimate_number}
            </h1>
            <EstimateStatusBadge status={estimate.status} size="md" />
          </div>
          <p className="text-sm text-zinc-500 mt-1">
            Created {formatDateTime(estimate.created_at)}
            {estimate.created_by_admin && (
              <span> by {estimate.created_by_admin.full_name}</span>
            )}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="inline-flex items-center justify-center h-9 px-4 bg-white hover:bg-zinc-50 active:bg-zinc-100 text-zinc-700 hover:text-zinc-900 text-sm font-medium border border-zinc-300 hover:border-zinc-400 rounded-md transition-colors"
          >
            <Printer className="w-4 h-4 mr-2" />
            Print
          </button>
          <button
            onClick={handleDuplicate}
            disabled={isDuplicating}
            className="inline-flex items-center justify-center h-9 px-4 bg-white hover:bg-zinc-50 active:bg-zinc-100 text-zinc-700 hover:text-zinc-900 text-sm font-medium border border-zinc-300 hover:border-zinc-400 rounded-md transition-colors disabled:opacity-50"
          >
            <Copy className="w-4 h-4 mr-2" />
            {isDuplicating ? 'Duplicating...' : 'Duplicate'}
          </button>
          <Link
            href={`/admin/estimates/${estimate.id}/edit`}
            className="inline-flex items-center justify-center h-9 px-4 bg-zinc-900 hover:bg-zinc-800 active:bg-zinc-950 text-white text-sm font-medium rounded-md transition-colors"
          >
            Edit
          </Link>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="inline-flex items-center justify-center h-9 px-4 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white text-sm font-medium rounded-md transition-colors disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            {isDeleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>

      {/* Print Header (hidden on screen) */}
      <div className="hidden print:block mb-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900">Estimate</h1>
            <p className="text-lg font-semibold text-zinc-700 mt-1">
              {estimate.estimate_number}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-zinc-600">Date: {formatDate(estimate.created_at)}</p>
            {estimate.valid_until && (
              <p className="text-sm text-zinc-600">
                Valid Until: {formatDate(estimate.valid_until)}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Status Actions (only for status changes) */}
      <div className="print:hidden">
        <EstimateStatusActions
          estimateId={estimate.id}
          currentStatus={estimate.status}
        />
      </div>

      {/* Expiration Warning */}
      {isExpired && estimate.status === 'sent' && (
        <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 print:hidden">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm">
            This estimate expired on {formatDate(estimate.valid_until)}
          </p>
        </div>
      )}

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Customer & Pool Info */}
        <div className="lg:col-span-1 space-y-6 print:space-y-4">
          {/* Customer Card */}
          <div className="bg-white border border-zinc-200 rounded-lg p-4 print:border-zinc-400">
            <h2 className="text-sm font-semibold text-zinc-900 mb-3 flex items-center gap-2">
              <User className="w-4 h-4 text-zinc-500" />
              Customer
            </h2>
            <div className="space-y-3">
              <div>
                <Link
                  href={`/admin/customers/${estimate.customer.id}`}
                  className="text-base font-medium text-zinc-900 hover:text-blue-600 transition-colors print:no-underline print:text-zinc-900"
                >
                  {estimate.customer.name}
                </Link>
              </div>
              <div className="flex items-center gap-2 text-sm text-zinc-600">
                <Phone className="w-4 h-4 text-zinc-400" />
                <a
                  href={`tel:${estimate.customer.phone_normalized}`}
                  className="hover:text-zinc-900"
                >
                  {formatPhoneDisplay(estimate.customer.phone_normalized)}
                </a>
              </div>
              {estimate.customer.email && (
                <div className="flex items-center gap-2 text-sm text-zinc-600">
                  <Mail className="w-4 h-4 text-zinc-400" />
                  <a
                    href={`mailto:${estimate.customer.email}`}
                    className="hover:text-zinc-900 truncate"
                  >
                    {estimate.customer.email}
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Pool Card */}
          {estimate.pool && (
            <div className="bg-white border border-zinc-200 rounded-lg p-4 print:border-zinc-400">
              <h2 className="text-sm font-semibold text-zinc-900 mb-3 flex items-center gap-2">
                <Droplets className="w-4 h-4 text-zinc-500" />
                Pool
              </h2>
              <div className="space-y-3">
                <div>
                  <span className="text-sm font-medium text-zinc-900">
                    {formatPoolType(estimate.pool.type)}
                  </span>
                  <span className="text-sm text-zinc-500 ml-2">
                    ({formatSurfaceType(estimate.pool.surface_type)})
                  </span>
                </div>
                {estimate.pool.volume_gallons && (
                  <p className="text-sm text-zinc-600">
                    {estimate.pool.volume_gallons.toLocaleString()} gallons
                  </p>
                )}
                {estimate.pool.property && (
                  <div className="flex items-start gap-2 text-sm text-zinc-600 pt-2 border-t border-zinc-100">
                    <MapPin className="w-4 h-4 text-zinc-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p>{estimate.pool.property.address_line1}</p>
                      {estimate.pool.property.address_line2 && (
                        <p>{estimate.pool.property.address_line2}</p>
                      )}
                      <p>
                        {estimate.pool.property.city}, {estimate.pool.property.state}{' '}
                        {estimate.pool.property.zip_code}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Estimate Details Card */}
          <div className="bg-white border border-zinc-200 rounded-lg p-4 print:border-zinc-400">
            <h2 className="text-sm font-semibold text-zinc-900 mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4 text-zinc-500" />
              Details
            </h2>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-zinc-500">Status</dt>
                <dd>
                  <EstimateStatusBadge status={estimate.status} />
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-zinc-500">Created</dt>
                <dd className="text-zinc-900">{formatDate(estimate.created_at)}</dd>
              </div>
              {estimate.valid_until && (
                <div className="flex justify-between">
                  <dt className="text-zinc-500">Valid Until</dt>
                  <dd
                    className={
                      isExpired ? 'text-red-600 font-medium' : 'text-zinc-900'
                    }
                  >
                    {formatDate(estimate.valid_until)}
                    {isExpired && ' (Expired)'}
                  </dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-zinc-500">Last Updated</dt>
                <dd className="text-zinc-900">{formatDate(estimate.updated_at)}</dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Right Column - Line Items & Notes */}
        <div className="lg:col-span-2 space-y-6 print:space-y-4">
          {/* Line Items */}
          <div className="bg-white border border-zinc-200 rounded-lg p-4 print:border-zinc-400 print:p-0">
            <h2 className="text-sm font-semibold text-zinc-900 mb-4 print:hidden">
              Line Items
            </h2>
            <EstimateLineItemsTable
              lineItems={estimate.line_items}
              subtotalCents={estimate.subtotal_cents}
              taxRate={estimate.tax_rate}
              taxAmountCents={estimate.tax_amount_cents}
              totalCents={estimate.total_cents}
            />
          </div>

          {/* Total Summary (mobile-friendly) */}
          <div className="lg:hidden bg-zinc-900 text-white rounded-lg p-4 print:hidden">
            <div className="flex justify-between items-center">
              <span className="font-medium">Total</span>
              <span className="text-2xl font-semibold">
                {formatCents(estimate.total_cents)}
              </span>
            </div>
          </div>

          {/* Notes */}
          {estimate.notes && (
            <div className="bg-white border border-zinc-200 rounded-lg p-4 print:border-zinc-400">
              <h2 className="text-sm font-semibold text-zinc-900 mb-3">Notes</h2>
              <p className="text-sm text-zinc-600 whitespace-pre-wrap">
                {estimate.notes}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Navigation */}
      <div className="flex items-center gap-2 pt-4 border-t border-zinc-200 print:hidden">
        <Link
          href={`/admin/customers/${estimate.customer.id}`}
          className="inline-flex items-center text-sm text-zinc-600 hover:text-zinc-900"
        >
          View Customer
          <ChevronRight className="w-4 h-4 ml-1" />
        </Link>
        {estimate.pool?.property && (
          <>
            <span className="text-zinc-300">|</span>
            <Link
              href={`/admin/customers/${estimate.customer.id}?tab=properties`}
              className="inline-flex items-center text-sm text-zinc-600 hover:text-zinc-900"
            >
              View Property
              <ChevronRight className="w-4 h-4 ml-1" />
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
