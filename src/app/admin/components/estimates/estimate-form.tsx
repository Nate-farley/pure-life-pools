'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Calendar, FileText, Percent } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LineItemEditor } from './line-item-editor';
import {
  createEstimateSchema,
  calculateEstimateTotals,
  formatCurrency,
  getDefaultValidUntil,
  parsePercentageToRate,
  type CreateEstimateInput,
  type LineItemInput,
} from '@/lib/validations/estimate';
import { getPoolTypeLabel } from '@/lib/validations/pool';
import { createEstimate, getPoolsForCustomer } from '@/app/actions/estimates';
import type { Estimate } from '@/lib/types/database';
import { v4 as uuidv4 } from 'uuid';

/**
 * Estimate Form Component
 *
 * Full-featured form for creating estimates with:
 * - Customer pre-selection
 * - Pool selection (optional)
 * - Line item editor
 * - Tax rate input
 * - Notes and validity date
 * - Real-time totals calculation
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

interface EstimateFormProps {
  /** Pre-selected customer */
  customer: CustomerInfo;
  /** Initial pool selection (optional) */
  initialPoolId?: string | null;
  /** Redirect URL after success */
  redirectTo?: string;
  /** Called on successful save */
  onSuccess?: (estimate: EstimateWithCustomer) => void;
  /** Called when user cancels */
  onCancel?: () => void;
}

export function EstimateForm({
  customer,
  initialPoolId,
  redirectTo,
  onSuccess,
  onCancel,
}: EstimateFormProps) {
  const router = useRouter();
  const [serverError, setServerError] = React.useState<string | null>(null);
  const [pools, setPools] = React.useState<PoolInfo[]>([]);
  const [isLoadingPools, setIsLoadingPools] = React.useState(true);
  const [taxRateDisplay, setTaxRateDisplay] = React.useState('7');



  // Default line item
  const defaultLineItem: LineItemInput = {
    id: uuidv4(),
    description: '',
    quantity: 1,
    unitPriceCents: 0,
  };

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CreateEstimateInput>({
    resolver: zodResolver(createEstimateSchema),
    defaultValues: {
      customerId: customer.id,
      poolId: initialPoolId ?? null,
      lineItems: [defaultLineItem],
      taxRate: 0.07, // Default 7% tax
      notes: '',
      validUntil: getDefaultValidUntil(),
    },
  });

  // Watch form values for calculations
  const lineItems = watch('lineItems');
  console.log(lineItems)
  const taxRate = watch('taxRate');
  const selectedPoolId = watch('poolId');

  // Calculate totals
  const totals = React.useMemo(() => {
    return calculateEstimateTotals(
      lineItems.map((item) => ({
        quantity: item.quantity,
        unitPriceCents: item.unitPriceCents,
      })),
      taxRate
    );
  }, [lineItems, taxRate]);

  // Load pools for customer
  React.useEffect(() => {
    async function loadPools() {
      setIsLoadingPools(true);
      try {
        const result = await getPoolsForCustomer(customer.id);
        if (result.success && result.data) {
          setPools(result.data);
        }
      } catch (err) {
        console.error('Error loading pools:', err);
      } finally {
        setIsLoadingPools(false);
      }
    }
    loadPools();
  }, [customer.id]);

  // Handle tax rate change
  const handleTaxRateChange = (value: string) => {
    setTaxRateDisplay(value);
    const rate = parsePercentageToRate(value);
    if (rate !== null) {
      setValue('taxRate', rate);
    }
  };

  const handleTaxRateBlur = () => {
    const rate = parsePercentageToRate(taxRateDisplay);
    if (rate !== null) {
      setTaxRateDisplay((rate * 100).toFixed(2));
    }
  };

  const onSubmit = async (data: CreateEstimateInput) => {
    setServerError(null);

    try {
      console.log("Raw estimate data: ", data);
      const result = await createEstimate(data);

      console.log("Estimate result: ", result);
      if (result.success && result.data) {
        if (onSuccess) {
          onSuccess(result.data);
        } else if (redirectTo) {
          router.push(redirectTo);
        } else {
          router.push(`/admin/estimates/${result.data.id}`);
        }
      } else {
        setServerError(result.error ?? 'Failed to create estimate');
      }
    } catch (error) {
      setServerError('An unexpected error occurred. Please try again.');
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      router.back();
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Server Error */}
      {serverError && (
        <Alert variant="destructive">
          <AlertDescription>{serverError}</AlertDescription>
        </Alert>
      )}

      {/* Hidden customer ID */}
      <input type="hidden" {...register('customerId')} />

      {/* Customer Info (read-only) */}
      <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-4">
        <Label className="text-zinc-500 text-xs uppercase tracking-wider">
          Customer
        </Label>
        <div className="mt-2">
          <p className="text-lg font-medium text-zinc-900">{customer.name}</p>
          <p className="text-sm text-zinc-600">{customer.phone}</p>
          {customer.email && (
            <p className="text-sm text-zinc-500">{customer.email}</p>
          )}
        </div>
      </div>

      {/* Pool Selection (optional) */}
      <div className="space-y-2">
        <Label htmlFor="poolId">
          Pool <span className="text-zinc-400">(optional)</span>
        </Label>
        <Controller
          control={control}
          name="poolId"
          render={({ field }) => (
            <Select
              value={field.value ?? 'none'}
              onValueChange={(value) => field.onChange(value === 'none' ? null : value)}
              disabled={isLoadingPools}
            >
              <SelectTrigger id="poolId">
                <SelectValue placeholder={isLoadingPools ? 'Loading pools...' : 'Select a pool'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No pool selected</SelectItem>
                {pools.map((pool) => (
                  <SelectItem key={pool.id} value={pool.id}>
                    <div className="flex flex-col">
                      <span>{getPoolTypeLabel(pool.type)} Pool</span>
                      <span className="text-xs text-zinc-500">
                        {pool.property.address_line1}, {pool.property.city}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {pools.length === 0 && !isLoadingPools && (
          <p className="text-xs text-zinc-500">
            No pools found. Add a pool to the customer's property first.
          </p>
        )}
      </div>

      {/* Line Items */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-zinc-400" />
          <Label className="text-base font-medium">Line Items</Label>
        </div>
        <div className="bg-white border border-zinc-200 rounded-lg p-4">
          <Controller
            control={control}
            name="lineItems"
            render={({ field }) => (
              <LineItemEditor
                lineItems={field.value}
                onChange={field.onChange}
                disabled={isSubmitting}
              />
            )}
          />
          {errors.lineItems && (
            <p className="text-sm text-red-600 mt-2">
              {errors.lineItems.message ?? 'Please add at least one line item'}
            </p>
          )}
        </div>
      </div>

      {/* Tax & Totals */}
      <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-4">
          <Percent className="w-5 h-5 text-zinc-400" />
          <Label className="text-base font-medium">Tax & Totals</Label>
        </div>

        <div className="space-y-4">
          {/* Tax Rate */}
          <div className="flex items-center justify-between">
            <Label htmlFor="taxRate" className="text-sm text-zinc-600">
              Tax Rate
            </Label>
            <div className="flex items-center gap-2">
              <Input
                id="taxRate"
                type="text"
                inputMode="decimal"
                value={taxRateDisplay}
                onChange={(e) => handleTaxRateChange(e.target.value)}
                onBlur={handleTaxRateBlur}
                className="w-20 text-right"
                disabled={isSubmitting}
              />
              <span className="text-zinc-500">%</span>
            </div>
          </div>

          {/* Totals Display */}
          <div className="border-t border-zinc-200 pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-zinc-600">Subtotal</span>
              <span className="font-medium tabular-nums">
                {formatCurrency(totals.subtotalCents)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-zinc-600">
                Tax ({(taxRate * 100).toFixed(2)}%)
              </span>
              <span className="font-medium tabular-nums">
                {formatCurrency(totals.taxAmountCents)}
              </span>
            </div>
            <div className="flex justify-between text-lg font-semibold pt-2 border-t border-zinc-200">
              <span className="text-zinc-900">Total</span>
              <span className="text-zinc-900 tabular-nums">
                {formatCurrency(totals.totalCents)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Valid Until Date */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-zinc-400" />
          <Label htmlFor="validUntil">
            Valid Until <span className="text-zinc-400">(optional)</span>
          </Label>
        </div>
        <Input
          id="validUntil"
          type="date"
          {...register('validUntil')}
          disabled={isSubmitting}
          className="w-48"
        />
        {errors.validUntil && (
          <p className="text-sm text-red-600">{errors.validUntil.message}</p>
        )}
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <Label htmlFor="notes">
          Notes <span className="text-zinc-400">(optional)</span>
        </Label>
        <Textarea
          id="notes"
          placeholder="Internal notes about this estimate..."
          rows={3}
          maxLength={5000}
          {...register('notes')}
          disabled={isSubmitting}
        />
        {errors.notes && (
          <p className="text-sm text-red-600">{errors.notes.message}</p>
        )}
        <p className="text-xs text-zinc-500">
          These notes are for internal use only.
        </p>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t border-zinc-200">
        <Button
          type="button"
          variant="secondary"
          onClick={handleCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Creating...
            </>
          ) : (
            'Create Estimate'
          )}
        </Button>
      </div>
    </form>
  );
}

/**
 * Estimate Form Skeleton
 */
export function EstimateFormSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Customer Info */}
      <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-4">
        <div className="h-3 w-16 bg-zinc-200 rounded mb-3" />
        <div className="h-6 w-48 bg-zinc-200 rounded mb-2" />
        <div className="h-4 w-32 bg-zinc-200 rounded" />
      </div>

      {/* Pool Selection */}
      <div className="space-y-2">
        <div className="h-4 w-20 bg-zinc-200 rounded" />
        <div className="h-9 w-full bg-zinc-200 rounded" />
      </div>

      {/* Line Items */}
      <div className="space-y-4">
        <div className="h-5 w-24 bg-zinc-200 rounded" />
        <div className="bg-white border border-zinc-200 rounded-lg p-4">
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="grid grid-cols-12 gap-3">
                <div className="col-span-6 h-9 bg-zinc-200 rounded" />
                <div className="col-span-2 h-9 bg-zinc-200 rounded" />
                <div className="col-span-2 h-9 bg-zinc-200 rounded" />
                <div className="col-span-2 h-9 bg-zinc-200 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tax & Totals */}
      <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-4">
        <div className="h-5 w-24 bg-zinc-200 rounded mb-4" />
        <div className="space-y-3">
          <div className="h-4 w-full bg-zinc-200 rounded" />
          <div className="h-4 w-full bg-zinc-200 rounded" />
          <div className="h-6 w-full bg-zinc-200 rounded" />
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t border-zinc-200">
        <div className="h-9 w-20 bg-zinc-200 rounded" />
        <div className="h-9 w-32 bg-zinc-200 rounded" />
      </div>
    </div>
  );
}
