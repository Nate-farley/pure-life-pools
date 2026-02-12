'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  FileText,
  MoreHorizontal,
  Pencil,
  Copy,
  Trash2,
  ExternalLink,
  User,
  Calendar,
  Droplets,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  formatCurrency,
  formatDate,
  getStatusConfig,
  type EstimateStatusValue,
} from '@/lib/validations/estimate';
import { getPoolTypeLabel } from '@/lib/validations/pool';
import type { Estimate } from '@/lib/types/database';

/**
 * Estimate Card Component
 *
 * Displays an estimate summary in a card format.
 * Used in estimate lists on customer detail and estimates page.
 */

interface CustomerInfo {
  id: string;
  name: string;
  phone: string;
  email: string | null;
}

interface PoolInfo {
  id: string;
  type: string;
  property: {
    id: string;
    address_line1: string;
    city: string;
    state: string;
  };
}

interface EstimateWithCustomer extends Estimate {
  customer: CustomerInfo;
  pool?: PoolInfo | null;
}

interface EstimateCardProps {
  estimate: EstimateWithCustomer;
  /** Whether to show customer info (hide when on customer detail page) */
  showCustomer?: boolean;
  onEdit?: (estimate: EstimateWithCustomer) => void;
  onDuplicate?: (estimate: EstimateWithCustomer) => void;
  onDelete?: (estimate: EstimateWithCustomer) => void;
}

export function EstimateCard({
  estimate,
  showCustomer = true,
  onEdit,
  onDuplicate,
  onDelete,
}: EstimateCardProps) {
  const statusConfig = getStatusConfig(estimate.status as EstimateStatusValue);
  const isExpired =
    estimate.valid_until && new Date(estimate.valid_until) < new Date();

  return (
    <div className="bg-white border border-zinc-200 rounded-lg overflow-hidden hover:border-zinc-300 transition-colors">
      {/* Header */}
      <div className="px-4 py-3 border-b border-zinc-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-zinc-100 rounded-md">
            <FileText className="w-4 h-4 text-zinc-600" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <Link
                href={`/admin/estimates/${estimate.id}`}
                className="text-sm font-medium text-zinc-900 hover:text-blue-600 transition-colors"
              >
                {estimate.estimate_number}
              </Link>
              <span
                className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full ${statusConfig.color}`}
              >
                {statusConfig.label}
              </span>
            </div>
            <p className="text-xs text-zinc-500">
              Created {formatDate(estimate.created_at)}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <span className="text-lg font-semibold text-zinc-900 tabular-nums">
            {formatCurrency(estimate.total_cents)}
          </span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                aria-label="Estimate actions"
              >
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem asChild>
                <Link href={`/admin/estimates/${estimate.id}`}>
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View Details
                </Link>
              </DropdownMenuItem>
              {onEdit && (
                <DropdownMenuItem onClick={() => onEdit(estimate)}>
                  <Pencil className="w-4 h-4 mr-2" />
                  Edit Estimate
                </DropdownMenuItem>
              )}
              {onDuplicate && (
                <DropdownMenuItem onClick={() => onDuplicate(estimate)}>
                  <Copy className="w-4 h-4 mr-2" />
                  Duplicate
                </DropdownMenuItem>
              )}
              {onDelete && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-red-600 focus:text-red-600 focus:bg-red-50"
                    onClick={() => onDelete(estimate)}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Body */}
      <div className="px-4 py-3 space-y-2">
        {/* Customer (optional) */}
        {showCustomer && (
          <div className="flex items-center gap-2 text-sm">
            <User className="w-4 h-4 text-zinc-400" />
            <Link
              href={`/admin/customers/${estimate.customer.id}`}
              className="text-zinc-700 hover:text-blue-600 transition-colors"
            >
              {estimate.customer.name}
            </Link>
          </div>
        )}

        {/* Pool (if selected) */}
        {estimate.pool && (
          <div className="flex items-center gap-2 text-sm">
            <Droplets className="w-4 h-4 text-blue-400" />
            <span className="text-zinc-600">
              {getPoolTypeLabel(estimate.pool.type)} Pool at{' '}
              {estimate.pool.property.address_line1}
            </span>
          </div>
        )}

        {/* Valid Until */}
        {estimate.valid_until && (
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4 text-zinc-400" />
            <span className={isExpired ? 'text-red-600' : 'text-zinc-600'}>
              {isExpired ? 'Expired' : 'Valid until'} {formatDate(estimate.valid_until)}
            </span>
          </div>
        )}

        {/* Line Items Preview */}
        <div className="pt-2 border-t border-zinc-100">
          <p className="text-xs text-zinc-500 mb-1">
            {estimate.line_items.length} line{' '}
            {estimate.line_items.length === 1 ? 'item' : 'items'}
          </p>
          <div className="space-y-1">
            {estimate.line_items.slice(0, 2).map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between text-sm"
              >
                <span className="text-zinc-600 truncate max-w-[200px]">
                  {item.description}
                </span>
                <span className="text-zinc-900 tabular-nums">
                  {formatCurrency(item.total_cents)}
                </span>
              </div>
            ))}
            {estimate.line_items.length > 2 && (
              <p className="text-xs text-zinc-400">
                +{estimate.line_items.length - 2} more
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 py-2 bg-zinc-50 border-t border-zinc-100 flex items-center justify-between text-xs text-zinc-500">
        <span>Subtotal: {formatCurrency(estimate.subtotal_cents)}</span>
        <span>Tax: {formatCurrency(estimate.tax_amount_cents)}</span>
      </div>
    </div>
  );
}

/**
 * Estimate Card Skeleton
 */
export function EstimateCardSkeleton() {
  return (
    <div className="bg-white border border-zinc-200 rounded-lg overflow-hidden animate-pulse">
      <div className="px-4 py-3 border-b border-zinc-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-zinc-200 rounded-md" />
          <div className="space-y-1.5">
            <div className="h-4 w-32 bg-zinc-200 rounded" />
            <div className="h-3 w-24 bg-zinc-200 rounded" />
          </div>
        </div>
        <div className="h-6 w-20 bg-zinc-200 rounded" />
      </div>
      <div className="px-4 py-3 space-y-2">
        <div className="h-4 w-40 bg-zinc-200 rounded" />
        <div className="h-4 w-32 bg-zinc-200 rounded" />
        <div className="pt-2 border-t border-zinc-100 space-y-1">
          <div className="h-4 w-full bg-zinc-200 rounded" />
          <div className="h-4 w-3/4 bg-zinc-200 rounded" />
        </div>
      </div>
    </div>
  );
}

/**
 * Compact Estimate Row
 *
 * Simpler row format for tables or dense lists.
 */
interface CompactEstimateRowProps {
  estimate: EstimateWithCustomer;
  showCustomer?: boolean;
  onClick?: () => void;
}

export function CompactEstimateRow({
  estimate,
  showCustomer = true,
  onClick,
}: CompactEstimateRowProps) {
  const statusConfig = getStatusConfig(estimate.status as EstimateStatusValue);

  const content = (
    <div className="flex items-center justify-between p-3 bg-white border border-zinc-200 rounded-lg hover:border-zinc-300 hover:bg-zinc-50 transition-colors cursor-pointer">
      <div className="flex items-center gap-4">
        <div>
          <p className="text-sm font-medium text-zinc-900">
            {estimate.estimate_number}
          </p>
          {showCustomer && (
            <p className="text-xs text-zinc-500">{estimate.customer.name}</p>
          )}
        </div>
        <span
          className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full ${statusConfig.color}`}
        >
          {statusConfig.label}
        </span>
      </div>
      <div className="text-right">
        <p className="text-sm font-semibold text-zinc-900 tabular-nums">
          {formatCurrency(estimate.total_cents)}
        </p>
        <p className="text-xs text-zinc-500">{formatDate(estimate.created_at)}</p>
      </div>
    </div>
  );

  if (onClick) {
    return (
      <button onClick={onClick} className="w-full text-left">
        {content}
      </button>
    );
  }

  return (
    <Link href={`/admin/estimates/${estimate.id}`}>
      {content}
    </Link>
  );
}
