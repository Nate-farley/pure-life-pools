'use client';

import * as React from 'react';
import { Plus, Trash2, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  calculateLineItemTotal,
  formatCurrency,
  parseCurrencyToCents,
  type LineItemInput,
} from '@/lib/validations/estimate';
import { v4 as uuidv4 } from 'uuid';

/**
 * Line Item Editor Component
 *
 * Inline editor for estimate line items.
 * Supports adding, removing, and editing line items with real-time total calculation.
 */

interface LineItemEditorProps {
  /** Current line items */
  lineItems: LineItemInput[];
  /** Called when line items change */
  onChange: (lineItems: LineItemInput[]) => void;
  /** Validation errors by item ID */
  errors?: Record<string, { description?: string; quantity?: string; unitPriceCents?: string }>;
  /** Whether the form is disabled */
  disabled?: boolean;
}

export function LineItemEditor({
  lineItems,
  onChange,
  errors = {},
  disabled = false,
}: LineItemEditorProps) {
  // Add a new empty line item
  const handleAddItem = () => {
    const newItem: LineItemInput = {
      id: uuidv4(),
      description: '',
      quantity: 1,
      unitPriceCents: 0,
    };
    onChange([...lineItems, newItem]);
  };

  // Remove a line item
  const handleRemoveItem = (id: string) => {
    if (lineItems.length <= 1) return; // Keep at least one item
    onChange(lineItems.filter((item) => item.id !== id));
  };

  // Update a line item field
  const handleUpdateItem = (
    id: string,
    field: keyof LineItemInput,
    value: string | number
  ) => {
    onChange(
      lineItems.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  // Calculate subtotal
  const subtotal = lineItems.reduce(
    (sum, item) => sum + calculateLineItemTotal(item.quantity, item.unitPriceCents),
    0
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="grid grid-cols-12 gap-3 text-xs font-medium text-zinc-600 uppercase tracking-wider">
        <div className="col-span-6">Description</div>
        <div className="col-span-2 text-right">Qty</div>
        <div className="col-span-2 text-right">Unit Price</div>
        <div className="col-span-2 text-right">Total</div>
      </div>

      {/* Line Items */}
      <div className="space-y-3">
        {lineItems.map((item, index) => (
          <LineItemRow
            key={item.id}
            item={item}
            index={index}
            onUpdate={(field, value) => handleUpdateItem(item.id, field, value)}
            onRemove={() => handleRemoveItem(item.id)}
            canRemove={lineItems.length > 1}
            errors={errors[item.id]}
            disabled={disabled}
          />
        ))}
      </div>

      {/* Add Item Button */}
      <Button
        type="button"
        variant="secondary"
        size="sm"
        onClick={handleAddItem}
        disabled={disabled}
        className="mt-2"
      >
        <Plus className="w-4 h-4 mr-2" />
        Add Line Item
      </Button>

      {/* Subtotal */}
      <div className="flex justify-end pt-4 border-t border-zinc-200">
        <div className="text-right">
          <span className="text-sm text-zinc-600 mr-4">Subtotal:</span>
          <span className="text-lg font-semibold text-zinc-900">
            {formatCurrency(subtotal)}
          </span>
        </div>
      </div>
    </div>
  );
}

/**
 * Individual Line Item Row
 */
interface LineItemRowProps {
  item: LineItemInput;
  index: number;
  onUpdate: (field: keyof LineItemInput, value: string | number) => void;
  onRemove: () => void;
  canRemove: boolean;
  errors?: { description?: string; quantity?: string; unitPriceCents?: string };
  disabled: boolean;
}

function LineItemRow({
  item,
  index,
  onUpdate,
  onRemove,
  canRemove,
  errors,
  disabled,
}: LineItemRowProps) {
  const [priceDisplay, setPriceDisplay] = React.useState(
    item.unitPriceCents > 0 ? (item.unitPriceCents / 100).toFixed(2) : ''
  );

  // Calculate line total
  const lineTotal = calculateLineItemTotal(item.quantity, item.unitPriceCents);

  // Handle price input blur - convert to cents
  const handlePriceBlur = () => {
    const cents = parseCurrencyToCents(priceDisplay);
    if (cents !== null) {
      onUpdate('unitPriceCents', cents);
      setPriceDisplay((cents / 100).toFixed(2));
    } else if (priceDisplay === '') {
      onUpdate('unitPriceCents', 0);
    }
  };

  // Handle quantity change
  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value) && value >= 0) {
      onUpdate('quantity', value);
    } else if (e.target.value === '') {
      onUpdate('quantity', 0);
    }
  };

  return (
    <div className="grid grid-cols-12 gap-3 items-start group">
      {/* Description */}
      <div className="col-span-6">
        <Input
          value={item.description}
          onChange={(e) => onUpdate('description', e.target.value)}
          placeholder="Service description..."
          disabled={disabled}
          aria-invalid={!!errors?.description}
          className={errors?.description ? 'border-red-500' : ''}
        />
        {errors?.description && (
          <p className="text-xs text-red-600 mt-1">{errors.description}</p>
        )}
      </div>

      {/* Quantity */}
      <div className="col-span-2">
        <Input
          type="number"
          min="0"
          step="0.01"
          value={item.quantity || ''}
          onChange={handleQuantityChange}
          placeholder="1"
          disabled={disabled}
          className={`text-right ${errors?.quantity ? 'border-red-500' : ''}`}
          aria-invalid={!!errors?.quantity}
        />
        {errors?.quantity && (
          <p className="text-xs text-red-600 mt-1">{errors.quantity}</p>
        )}
      </div>

      {/* Unit Price */}
      <div className="col-span-2">
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-sm">
            $
          </span>
          <Input
            type="text"
            inputMode="decimal"
            value={priceDisplay}
            onChange={(e) => setPriceDisplay(e.target.value)}
            onBlur={handlePriceBlur}
            placeholder="0.00"
            disabled={disabled}
            className={`pl-7 text-right ${errors?.unitPriceCents ? 'border-red-500' : ''}`}
            aria-invalid={!!errors?.unitPriceCents}
          />
        </div>
        {errors?.unitPriceCents && (
          <p className="text-xs text-red-600 mt-1">{errors.unitPriceCents}</p>
        )}
      </div>

      {/* Total + Remove */}
      <div className="col-span-2 flex items-center justify-end gap-2">
        <span className="text-sm font-medium text-zinc-900 tabular-nums">
          {formatCurrency(lineTotal)}
        </span>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onRemove}
          disabled={disabled || !canRemove}
          className={`h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity ${
            !canRemove ? 'invisible' : ''
          }`}
          aria-label="Remove line item"
        >
          <Trash2 className="w-4 h-4 text-zinc-400 hover:text-red-600" />
        </Button>
      </div>
    </div>
  );
}

/**
 * Line Item Editor Skeleton
 */
export function LineItemEditorSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="grid grid-cols-12 gap-3">
        <div className="col-span-6 h-4 bg-zinc-200 rounded" />
        <div className="col-span-2 h-4 bg-zinc-200 rounded" />
        <div className="col-span-2 h-4 bg-zinc-200 rounded" />
        <div className="col-span-2 h-4 bg-zinc-200 rounded" />
      </div>
      {[1, 2].map((i) => (
        <div key={i} className="grid grid-cols-12 gap-3">
          <div className="col-span-6 h-9 bg-zinc-200 rounded" />
          <div className="col-span-2 h-9 bg-zinc-200 rounded" />
          <div className="col-span-2 h-9 bg-zinc-200 rounded" />
          <div className="col-span-2 h-9 bg-zinc-200 rounded" />
        </div>
      ))}
    </div>
  );
}
