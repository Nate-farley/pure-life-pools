'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Calculator } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  createPoolSchema,
  updatePoolSchema,
  calculatePoolVolume,
  POOL_TYPES,
  POOL_SURFACE_TYPES,
  type CreatePoolInput,
  type UpdatePoolInput,
} from '@/lib/validations/pool';
import type { Pool } from '@/lib/types/database';

/**
 * Pool Form Component
 *
 * Handles both create and edit modes for pools.
 * Includes pool type/surface selection, dimension inputs, and equipment notes.
 */

interface PoolFormProps {
  /** Property ID - required for creating new pools */
  propertyId: string;
  /** Customer ID - for revalidation */
  customerId: string;
  /** Existing pool for edit mode */
  pool?: Pool;
  /** Called on successful save */
  onSuccess: (pool: Pool) => void;
  /** Called when user cancels */
  onCancel: () => void;
  /** Server action for creating pool */
  createAction: (input: CreatePoolInput) => Promise<{ success: boolean; data?: Pool; error?: string }>;
  /** Server action for updating pool */
  updateAction: (id: string, propertyId: string, customerId: string, input: UpdatePoolInput) => Promise<{ success: boolean; data?: Pool; error?: string }>;
}

export function PoolForm({
  propertyId,
  customerId,
  pool,
  onSuccess,
  onCancel,
  createAction,
  updateAction,
}: PoolFormProps) {
  const isEditMode = !!pool;
  const [serverError, setServerError] = React.useState<string | null>(null);

  // Choose schema based on mode
  const schema = isEditMode ? updatePoolSchema : createPoolSchema;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CreatePoolInput | UpdatePoolInput>({
    resolver: zodResolver(schema),
    defaultValues: isEditMode
      ? {
          type: pool.type,
          surfaceType: pool.surface_type ?? undefined,
          lengthFt: pool.length_ft ?? undefined,
          widthFt: pool.width_ft ?? undefined,
          depthShallowFt: pool.depth_shallow_ft ?? undefined,
          depthDeepFt: pool.depth_deep_ft ?? undefined,
          volumeGallons: pool.volume_gallons ?? undefined,
          equipmentNotes: pool.equipment_notes ?? '',
        }
      : {
          propertyId,
          type: undefined,
          surfaceType: undefined,
          lengthFt: undefined,
          widthFt: undefined,
          depthShallowFt: undefined,
          depthDeepFt: undefined,
          volumeGallons: undefined,
          equipmentNotes: '',
        },
  });

  // Watch form values for auto-calculation
  const selectedType = watch('type');
  const selectedSurfaceType = watch('surfaceType');
  const lengthFt = watch('lengthFt');
  const widthFt = watch('widthFt');
  const depthShallowFt = watch('depthShallowFt');
  const depthDeepFt = watch('depthDeepFt');
  const volumeGallons = watch('volumeGallons');

  // Calculate estimated volume
  const estimatedVolume = React.useMemo(() => {
    return calculatePoolVolume(
      Number(lengthFt) || null,
      Number(widthFt) || null,
      Number(depthShallowFt) || null,
      Number(depthDeepFt) || null
    );
  }, [lengthFt, widthFt, depthShallowFt, depthDeepFt]);

  // Apply calculated volume
  const handleApplyCalculatedVolume = () => {
    if (estimatedVolume) {
      setValue('volumeGallons', estimatedVolume, { shouldValidate: true });
    }
  };

  const onSubmit = async (data: CreatePoolInput | UpdatePoolInput) => {
    setServerError(null);

    try {
      let result;

      if (isEditMode) {
        result = await updateAction(pool.id, propertyId, customerId, data as UpdatePoolInput);
      } else {
        result = await createAction(data as CreatePoolInput);
      }

      if (result.success && result.data) {
        onSuccess(result.data);
      } else {
        setServerError(result.error ?? 'An error occurred');
      }
    } catch (error) {
      setServerError('An unexpected error occurred. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Server Error */}
      {serverError && (
        <Alert variant="destructive">
          <AlertDescription>{serverError}</AlertDescription>
        </Alert>
      )}

      {/* Hidden property ID for create mode */}
      {!isEditMode && (
        <input type="hidden" {...register('propertyId')} value={propertyId} />
      )}

      {/* Pool Type Section */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-zinc-900">Pool Type</h3>

        <div className="grid grid-cols-2 gap-4">
          {/* Pool Type */}
          <div className="space-y-1.5">
            <Label htmlFor="type">
              Type <span className="text-red-500">*</span>
            </Label>
            <Select
              value={selectedType}
              onValueChange={(value) => setValue('type', value as any, { shouldValidate: true })}
            >
              <SelectTrigger id="type" aria-invalid={!!errors.type}>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {POOL_TYPES.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.type && (
              <p className="text-sm text-red-600">{errors.type.message}</p>
            )}
          </div>

          {/* Surface Type */}
          <div className="space-y-1.5">
            <Label htmlFor="surfaceType">
              Surface <span className="text-zinc-400">(optional)</span>
            </Label>
            <Select
              value={selectedSurfaceType ?? ''}
             onValueChange={(value) =>
  setValue('surfaceType', value === 'none' ? null : value as any, { shouldValidate: true })
}
            >
              <SelectTrigger id="surfaceType">
                <SelectValue placeholder="Select surface" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Not specified</SelectItem>
                {POOL_SURFACE_TYPES.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.surfaceType && (
              <p className="text-sm text-red-600">{errors.surfaceType.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Dimensions Section */}
      <div className="space-y-4 pt-4 border-t border-zinc-200">
        <h3 className="text-sm font-medium text-zinc-900">Dimensions</h3>

        <div className="grid grid-cols-2 gap-4">
          {/* Length */}
          <div className="space-y-1.5">
            <Label htmlFor="lengthFt">
              Length (ft) <span className="text-zinc-400">(optional)</span>
            </Label>
            <Input
              id="lengthFt"
              type="number"
              step="0.01"
              min="0"
              placeholder="32"
              {...register('lengthFt')}
              aria-invalid={!!errors.lengthFt}
            />
            {errors.lengthFt && (
              <p className="text-sm text-red-600">{errors.lengthFt.message}</p>
            )}
          </div>

          {/* Width */}
          <div className="space-y-1.5">
            <Label htmlFor="widthFt">
              Width (ft) <span className="text-zinc-400">(optional)</span>
            </Label>
            <Input
              id="widthFt"
              type="number"
              step="0.01"
              min="0"
              placeholder="16"
              {...register('widthFt')}
              aria-invalid={!!errors.widthFt}
            />
            {errors.widthFt && (
              <p className="text-sm text-red-600">{errors.widthFt.message}</p>
            )}
          </div>

          {/* Shallow Depth */}
          <div className="space-y-1.5">
            <Label htmlFor="depthShallowFt">
              Shallow Depth (ft) <span className="text-zinc-400">(optional)</span>
            </Label>
            <Input
              id="depthShallowFt"
              type="number"
              step="0.01"
              min="0"
              placeholder="3.5"
              {...register('depthShallowFt')}
              aria-invalid={!!errors.depthShallowFt}
            />
            {errors.depthShallowFt && (
              <p className="text-sm text-red-600">{errors.depthShallowFt.message}</p>
            )}
          </div>

          {/* Deep Depth */}
          <div className="space-y-1.5">
            <Label htmlFor="depthDeepFt">
              Deep Depth (ft) <span className="text-zinc-400">(optional)</span>
            </Label>
            <Input
              id="depthDeepFt"
              type="number"
              step="0.01"
              min="0"
              placeholder="9"
              {...register('depthDeepFt')}
              aria-invalid={!!errors.depthDeepFt}
            />
            {errors.depthDeepFt && (
              <p className="text-sm text-red-600">{errors.depthDeepFt.message}</p>
            )}
          </div>
        </div>

        {/* Volume */}
        <div className="space-y-1.5">
          <Label htmlFor="volumeGallons">
            Volume (gallons) <span className="text-zinc-400">(optional)</span>
          </Label>
          <div className="flex gap-2">
            <Input
              id="volumeGallons"
              type="number"
              min="0"
              placeholder="25000"
              className="flex-1"
              {...register('volumeGallons')}
              aria-invalid={!!errors.volumeGallons}
            />
            {estimatedVolume && estimatedVolume !== volumeGallons && (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleApplyCalculatedVolume}
                className="whitespace-nowrap"
              >
                <Calculator className="w-4 h-4 mr-1.5" />
                Use {estimatedVolume.toLocaleString()}
              </Button>
            )}
          </div>
          {errors.volumeGallons && (
            <p className="text-sm text-red-600">{errors.volumeGallons.message}</p>
          )}
          {estimatedVolume && (
            <p className="text-xs text-zinc-500">
              Estimated: {estimatedVolume.toLocaleString()} gallons based on dimensions
            </p>
          )}
        </div>
      </div>

      {/* Equipment Section */}
      <div className="space-y-4 pt-4 border-t border-zinc-200">
        <h3 className="text-sm font-medium text-zinc-900">Equipment</h3>

        <div className="space-y-1.5">
          <Label htmlFor="equipmentNotes">
            Equipment Notes <span className="text-zinc-400">(optional)</span>
          </Label>
          <Textarea
            id="equipmentNotes"
            placeholder="Variable speed pump (Pentair IntelliFlo), salt chlorine generator, pool heater..."
            rows={3}
            maxLength={1000}
            {...register('equipmentNotes')}
            aria-invalid={!!errors.equipmentNotes}
          />
          {errors.equipmentNotes && (
            <p className="text-sm text-red-600">{errors.equipmentNotes.message}</p>
          )}
          <p className="text-xs text-zinc-500">
            Note any pumps, filters, heaters, chlorinators, or other equipment
          </p>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t border-zinc-200">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              {isEditMode ? 'Saving...' : 'Adding...'}
            </>
          ) : (
            <>{isEditMode ? 'Save Changes' : 'Add Pool'}</>
          )}
        </Button>
      </div>
    </form>
  );
}
