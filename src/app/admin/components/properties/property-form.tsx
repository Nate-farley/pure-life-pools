'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
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
  createPropertySchema,
  updatePropertySchema,
  stateOptions,
  type CreatePropertyInput,
  type UpdatePropertyInput,
} from '@/lib/validations/property';
import type { Property } from '@/lib/types/database';

/**
 * Property Form Component
 *
 * Handles both create and edit modes for properties.
 * Includes address validation and gate code/access notes fields.
 */

interface PropertyFormProps {
  /** Customer ID - required for creating new properties */
  customerId: string;
  /** Existing property for edit mode */
  property?: Property;
  /** Called on successful save */
  onSuccess: (property: Property) => void;
  /** Called when user cancels */
  onCancel: () => void;
  /** Server action for creating property */
  createAction: (input: CreatePropertyInput) => Promise<{ success: boolean; data?: Property; error?: string }>;
  /** Server action for updating property */
  updateAction: (id: string, customerId: string, input: UpdatePropertyInput) => Promise<{ success: boolean; data?: Property; error?: string }>;
}

export function PropertyForm({
  customerId,
  property,
  onSuccess,
  onCancel,
  createAction,
  updateAction,
}: PropertyFormProps) {
  const isEditMode = !!property;
  const [serverError, setServerError] = React.useState<string | null>(null);

  // Choose schema based on mode
  const schema = isEditMode ? updatePropertySchema : createPropertySchema;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CreatePropertyInput | UpdatePropertyInput>({
    resolver: zodResolver(schema),
    defaultValues: isEditMode
      ? {
          addressLine1: property.address_line1,
          addressLine2: property.address_line2 ?? '',
          city: property.city,
          state: property.state ?? "FL",
          zipCode: property.zip_code,
          gateCode: property.gate_code ?? '',
          accessNotes: property.access_notes ?? '',
        }
      : {
          customerId,
          addressLine1: '',
          addressLine2: '',
          city: '',
          state: 'FL',
          zipCode: '',
          gateCode: '',
          accessNotes: '',
        },
  });

  const selectedState = watch('state');

const normalize = <T extends Record<string, any>>(data: T) => ({
  ...data,
  addressLine2: data.addressLine2 || undefined,
  gateCode: data.gateCode || undefined,
  accessNotes: data.accessNotes || undefined,
});

const onSubmit = async (data: CreatePropertyInput | UpdatePropertyInput) => {
  setServerError(null);

  const normalized = normalize(data);

  try {
    let result;

    if (isEditMode) {
      result = await updateAction(property.id, customerId, normalized as UpdatePropertyInput);
    } else {
      result = await createAction(normalized as CreatePropertyInput);
    }

    if (result.success && result.data) {
      onSuccess(result.data);
    } else {
      setServerError(result.error ?? 'An error occurred');
    }
  } catch {
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

      {/* Hidden customer ID for create mode */}
      {!isEditMode && (
        <input type="hidden" {...register('customerId')} value={customerId} />
      )}

      {/* Address Section */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-zinc-900">Address</h3>

        {/* Street Address */}
        <div className="space-y-1.5">
          <Label htmlFor="addressLine1">
            Street Address <span className="text-red-500">*</span>
          </Label>
          <Input
            id="addressLine1"
            placeholder="123 Main Street"
            {...register('addressLine1')}
            aria-invalid={!!errors.addressLine1}
          />
          {errors.addressLine1 && (
            <p className="text-sm text-red-600">{errors.addressLine1.message}</p>
          )}
        </div>

        {/* Address Line 2 */}
        <div className="space-y-1.5">
          <Label htmlFor="addressLine2">
            Apt, Suite, Unit <span className="text-zinc-400">(optional)</span>
          </Label>
          <Input
            id="addressLine2"
            placeholder="Apt 4B"
            {...register('addressLine2')}
            aria-invalid={!!errors.addressLine2}
          />
          {errors.addressLine2 && (
            <p className="text-sm text-red-600">{errors.addressLine2.message}</p>
          )}
        </div>

        {/* City, State, ZIP */}
        <div className="grid grid-cols-6 gap-4">
          {/* City */}
          <div className="col-span-3 space-y-1.5">
            <Label htmlFor="city">
              City <span className="text-red-500">*</span>
            </Label>
            <Input
              id="city"
              placeholder="Miami"
              {...register('city')}
              aria-invalid={!!errors.city}
            />
            {errors.city && (
              <p className="text-sm text-red-600">{errors.city.message}</p>
            )}
          </div>

          {/* State */}
          <div className="col-span-1 space-y-1.5">
            <Label htmlFor="state">
              State <span className="text-red-500">*</span>
            </Label>
            <Select
              value={selectedState || "FL"}
              onValueChange={(value) => setValue('state', value, { shouldValidate: true })}
            >
              <SelectTrigger
                id="state"
                aria-invalid={!!errors.state}
              >
                <SelectValue placeholder="--" />
              </SelectTrigger>
              <SelectContent>
                {stateOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.state && (
              <p className="text-sm text-red-600">{errors.state.message}</p>
            )}
          </div>

          {/* ZIP Code */}
          <div className="col-span-2 space-y-1.5">
            <Label htmlFor="zipCode">
              ZIP Code <span className="text-red-500">*</span>
            </Label>
            <Input
              id="zipCode"
              placeholder="33101"
              {...register('zipCode')}
              aria-invalid={!!errors.zipCode}
            />
            {errors.zipCode && (
              <p className="text-sm text-red-600">{errors.zipCode.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Access Information Section */}
      <div className="space-y-4 pt-4 border-t border-zinc-200">
        <h3 className="text-sm font-medium text-zinc-900">Access Information</h3>

        {/* Gate Code */}
        <div className="space-y-1.5">
          <Label htmlFor="gateCode">
            Gate Code <span className="text-zinc-400">(optional)</span>
          </Label>
          <Input
            id="gateCode"
            placeholder="#1234"
            maxLength={20}
            {...register('gateCode')}
            aria-invalid={!!errors.gateCode}
          />
          {errors.gateCode && (
            <p className="text-sm text-red-600">{errors.gateCode.message}</p>
          )}
          <p className="text-xs text-zinc-500">
            Entry code for gated communities or buildings
          </p>
        </div>

        {/* Access Notes */}
        <div className="space-y-1.5">
          <Label htmlFor="accessNotes">
            Access Notes <span className="text-zinc-400">(optional)</span>
          </Label>
          <Textarea
            id="accessNotes"
            placeholder="Enter through side gate. Dog in backyard - please close gate behind you."
            rows={3}
            maxLength={500}
            {...register('accessNotes')}
            aria-invalid={!!errors.accessNotes}
          />
          {errors.accessNotes && (
            <p className="text-sm text-red-600">{errors.accessNotes.message}</p>
          )}
          <p className="text-xs text-zinc-500">
            Special instructions for accessing the property
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
            <>{isEditMode ? 'Save Changes' : 'Add Property'}</>
          )}
        </Button>
      </div>
    </form>
  );
}
