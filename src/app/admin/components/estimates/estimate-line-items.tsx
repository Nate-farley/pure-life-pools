/**
 * Estimate Line Items Table
 *
 * Displays estimate line items in a table format.
 * Used in both the detail view and print layout.
 */

import type { LineItem } from '@/lib/validations/estimate';
import { formatCents } from '@/lib/utils/currency';

// ============================================================================
// Component
// ============================================================================

interface EstimateLineItemsTableProps {
  lineItems: LineItem[];
  subtotalCents: number;
  taxRate: number;
  taxAmountCents: number;
  totalCents: number;
  showDescription?: boolean;
  compact?: boolean;
}

export function EstimateLineItemsTable({
  lineItems,
  subtotalCents,
  taxRate,
  taxAmountCents,
  totalCents,
  showDescription = true,
  compact = false,
}: EstimateLineItemsTableProps) {
  const cellPadding = compact ? 'px-3 py-2' : 'px-4 py-3';
  const headerPadding = compact ? 'px-3 py-2' : 'px-4 py-3';

  return (
    <div className="border border-zinc-200 rounded-lg overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-zinc-50 border-b border-zinc-200">
          <tr>
            <th
              className={`${headerPadding} text-left text-xs font-semibold text-zinc-600 uppercase tracking-wider`}
            >
              {showDescription ? 'Description' : 'Item'}
            </th>
            <th
              className={`${headerPadding} text-right text-xs font-semibold text-zinc-600 uppercase tracking-wider w-24`}
            >
              Qty
            </th>
            <th
              className={`${headerPadding} text-right text-xs font-semibold text-zinc-600 uppercase tracking-wider w-32`}
            >
              Unit Price
            </th>
            <th
              className={`${headerPadding} text-right text-xs font-semibold text-zinc-600 uppercase tracking-wider w-32`}
            >
              Total
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-200">
          {lineItems.map((item, index) => (
            <tr
              key={item.id}
              className={index % 2 === 0 ? 'bg-white' : 'bg-zinc-50/50'}
            >
              <td className={`${cellPadding} text-zinc-900`}>
                {item.description}
              </td>
              <td
                className={`${cellPadding} text-right text-zinc-700 tabular-nums`}
              >
                {item.quantity}
              </td>
              <td
                className={`${cellPadding} text-right text-zinc-700 tabular-nums`}
              >
                {formatCents(item.unit_price_cents)}
              </td>
              <td
                className={`${cellPadding} text-right text-zinc-900 font-medium tabular-nums`}
              >
                {formatCents(item.total_cents)}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot className="bg-zinc-50">
          {/* Subtotal row */}
          <tr className="border-t border-zinc-200">
            <td
              colSpan={3}
              className={`${cellPadding} text-right text-zinc-600`}
            >
              Subtotal
            </td>
            <td
              className={`${cellPadding} text-right text-zinc-900 tabular-nums`}
            >
              {formatCents(subtotalCents)}
            </td>
          </tr>

          {/* Tax row */}
          {taxRate > 0 && (
            <tr>
              <td
                colSpan={3}
                className={`${cellPadding} text-right text-zinc-600`}
              >
                Tax ({(taxRate * 100).toFixed(taxRate * 100 % 1 === 0 ? 0 : 2)}%)
              </td>
              <td
                className={`${cellPadding} text-right text-zinc-900 tabular-nums`}
              >
                {formatCents(taxAmountCents)}
              </td>
            </tr>
          )}

          {/* Total row */}
          <tr className="border-t-2 border-zinc-300">
            <td
              colSpan={3}
              className={`${cellPadding} text-right font-semibold text-zinc-900`}
            >
              Total
            </td>
            <td
              className={`${cellPadding} text-right font-semibold text-zinc-900 text-base tabular-nums`}
            >
              {formatCents(totalCents)}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

// ============================================================================
// Print-Friendly Version
// ============================================================================

interface EstimateLineItemsPrintProps {
  lineItems: LineItem[];
  subtotalCents: number;
  taxRate: number;
  taxAmountCents: number;
  totalCents: number;
}

export function EstimateLineItemsPrint({
  lineItems,
  subtotalCents,
  taxRate,
  taxAmountCents,
  totalCents,
}: EstimateLineItemsPrintProps) {
  return (
    <div className="print:border print:border-black">
      <table className="w-full text-sm print:text-xs">
        <thead>
          <tr className="border-b-2 border-zinc-900 print:border-black">
            <th className="px-3 py-2 text-left font-semibold text-zinc-900">
              Description
            </th>
            <th className="px-3 py-2 text-right font-semibold text-zinc-900 w-20">
              Qty
            </th>
            <th className="px-3 py-2 text-right font-semibold text-zinc-900 w-28">
              Unit Price
            </th>
            <th className="px-3 py-2 text-right font-semibold text-zinc-900 w-28">
              Total
            </th>
          </tr>
        </thead>
        <tbody>
          {lineItems.map((item) => (
            <tr key={item.id} className="border-b border-zinc-200 print:border-zinc-400">
              <td className="px-3 py-2 text-zinc-900">{item.description}</td>
              <td className="px-3 py-2 text-right text-zinc-700 tabular-nums">
                {item.quantity}
              </td>
              <td className="px-3 py-2 text-right text-zinc-700 tabular-nums">
                {formatCents(item.unit_price_cents)}
              </td>
              <td className="px-3 py-2 text-right text-zinc-900 tabular-nums">
                {formatCents(item.total_cents)}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={3} className="px-3 py-2 text-right text-zinc-600">
              Subtotal
            </td>
            <td className="px-3 py-2 text-right text-zinc-900 tabular-nums">
              {formatCents(subtotalCents)}
            </td>
          </tr>
          {taxRate > 0 && (
            <tr>
              <td colSpan={3} className="px-3 py-2 text-right text-zinc-600">
                Tax ({(taxRate * 100).toFixed(taxRate * 100 % 1 === 0 ? 0 : 2)}%)
              </td>
              <td className="px-3 py-2 text-right text-zinc-900 tabular-nums">
                {formatCents(taxAmountCents)}
              </td>
            </tr>
          )}
          <tr className="border-t-2 border-zinc-900 print:border-black">
            <td colSpan={3} className="px-3 py-2 text-right font-bold text-zinc-900">
              Total
            </td>
            <td className="px-3 py-2 text-right font-bold text-zinc-900 text-base tabular-nums">
              {formatCents(totalCents)}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
