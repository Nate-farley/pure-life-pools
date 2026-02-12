'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Phone, User, Mail, Tag } from 'lucide-react';

import {
  createCustomerSchema,
  type CreateCustomerInput,
  LEAD_SOURCES,
} from '@/lib/validations/customer';
import { formatPhone, validatePhone } from '@/lib/utils/phone';
import type { Customer } from '@/lib/types/database';
import type { ActionResult } from '@/lib/types/api';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/forms/form';

/**
 * Customer Form Component
 *
 * Full-featured form for creating new customers with:
 * - Phone validation and normalization
 * - Duplicate phone number detection
 * - Lead source selection
 * - Loading and error states
 */

// ============================================================================
// Types
// ============================================================================

interface DuplicateCustomer {
  id: string;
  name: string;
  phone: string;
  email: string | null;
}

interface CustomerFormProps {
  /**
   * Server action to create the customer.
   */
  onSubmit: (data: CreateCustomerInput) => Promise<ActionResult<Customer>>;
  /**
   * Server action to check for duplicate phone.
   */
  checkDuplicatePhone: (phone: string) => Promise<ActionResult<DuplicateCustomer | null>>;
  /**
   * Called when customer is successfully created.
   */
  onSuccess?: (customer: Customer) => void;
  /**
   * Called when user clicks cancel.
   */
  onCancel?: () => void;
}

// ============================================================================
// Lead Source Display Names
// ============================================================================

const leadSourceLabels: Record<string, string> = {
  referral: 'Referral',
  website: 'Website',
  phone: 'Phone Call',
  walk_in: 'Walk-in',
  google: 'Google',
  facebook: 'Facebook',
  yelp: 'Yelp',
  other: 'Other',
};

// ============================================================================
// Customer Form Component
// ============================================================================

export function CustomerForm({
  onSubmit,
  checkDuplicatePhone,
  onSuccess,
  onCancel,
}: CustomerFormProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isCheckingDuplicate, setIsCheckingDuplicate] = React.useState(false);
  const [duplicateCustomer, setDuplicateCustomer] = React.useState<DuplicateCustomer | null>(null);
  const [showDuplicateDialog, setShowDuplicateDialog] = React.useState(false);
  const [pendingSubmitData, setPendingSubmitData] = React.useState<CreateCustomerInput | null>(null);
  const [submitError, setSubmitError] = React.useState<string | null>(null);

  const form = useForm<CreateCustomerInput>({
    resolver: zodResolver(createCustomerSchema),
    defaultValues: {
      phone: '',
      name: '',
      email: '',
      source: undefined,
    },
    mode: 'onBlur',
  });

  // Phone field validation feedback
  const phoneValue = form.watch('phone');
  const phoneValidation = React.useMemo(() => {
    if (!phoneValue || phoneValue.length < 10) return null;
    return validatePhone(phoneValue);
  }, [phoneValue]);

  // Format phone on blur
  const handlePhoneBlur = React.useCallback(() => {
    const currentValue = form.getValues('phone');
    if (currentValue && currentValue.length >= 10) {
      const validation = validatePhone(currentValue);
      if (validation.isValid) {
        form.setValue('phone', validation.formatted, { shouldValidate: true });
      }
    }
  }, [form]);

  // Check for duplicate phone when phone field loses focus
  const checkForDuplicate = React.useCallback(async () => {
    const phone = form.getValues('phone');
    if (!phone || phone.length < 10) return;

    const validation = validatePhone(phone);
    if (!validation.isValid) return;

    setIsCheckingDuplicate(true);
    try {
      const result = await checkDuplicatePhone(validation.normalized);
      if (result.success && result.data) {
        setDuplicateCustomer(result.data);
      } else {
        setDuplicateCustomer(null);
      }
    } catch (error) {
      console.error('Error checking duplicate:', error);
    } finally {
      setIsCheckingDuplicate(false);
    }
  }, [form, checkDuplicatePhone]);

  // Handle form submission
  const handleFormSubmit = React.useCallback(
    async (data: CreateCustomerInput) => {
      setSubmitError(null);

      // If we found a duplicate, show confirmation dialog
      if (duplicateCustomer) {
        setPendingSubmitData(data);
        setShowDuplicateDialog(true);
        return;
      }

      // No duplicate, proceed with submission
      setIsSubmitting(true);
      try {
        const result = await onSubmit(data);
        if (result.success) {
          toast.success('Customer created successfully');
          form.reset();
          onSuccess?.(result.data);
        } else {
          setSubmitError(result.error);
          toast.error(result.error);
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'An unexpected error occurred';
        setSubmitError(message);
        toast.error(message);
      } finally {
        setIsSubmitting(false);
      }
    },
    [duplicateCustomer, form, onSubmit, onSuccess]
  );

  // Handle confirmation to create despite duplicate
  const handleConfirmCreate = React.useCallback(async () => {
    if (!pendingSubmitData) return;

    setShowDuplicateDialog(false);
    setIsSubmitting(true);

    try {
      const result = await onSubmit(pendingSubmitData);
      if (result.success) {
        toast.success('Customer created successfully');
        form.reset();
        setDuplicateCustomer(null);
        setPendingSubmitData(null);
        onSuccess?.(result.data);
      } else {
        setSubmitError(result.error);
        toast.error(result.error);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An unexpected error occurred';
      setSubmitError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  }, [pendingSubmitData, form, onSubmit, onSuccess]);

  // Cancel duplicate confirmation
  const handleCancelDuplicate = React.useCallback(() => {
    setShowDuplicateDialog(false);
    setPendingSubmitData(null);
  }, []);

  return (
    <>
      <Card className="w-full max-w-xl">
        <CardHeader>
          <CardTitle>New Customer</CardTitle>
          <CardDescription>
            Add a new customer to the system. Phone number is the primary identifier.
          </CardDescription>
        </CardHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)}>
            <CardContent className="space-y-4">
              {/* Submit Error Alert */}
              {submitError && (
                <Alert variant="error">
                  <AlertDescription>{submitError}</AlertDescription>
                </Alert>
              )}

              {/* Phone Field */}
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>Phone Number</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                        <Input
                          {...field}
                          type="tel"
                          placeholder="(555) 123-4567"
                          className="pl-10"
                          error={!!form.formState.errors.phone}
                          onBlur={() => {
                            field.onBlur();
                            handlePhoneBlur();
                            checkForDuplicate();
                          }}
                        />
                      </div>
                    </FormControl>
                    <FormDescription>
                      {phoneValidation?.isValid && !isCheckingDuplicate && (
                        <span className="text-emerald-600">
                          ✓ Valid phone: {phoneValidation.formatted}
                        </span>
                      )}
                      {isCheckingDuplicate && (
                        <span className="text-zinc-500">Checking for existing customers...</span>
                      )}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Duplicate Warning */}
              {duplicateCustomer && !isCheckingDuplicate && (
                <Alert variant="warning">
                  <AlertDescription>
                    <span className="font-medium">Existing customer found:</span>{' '}
                    {duplicateCustomer.name} ({formatPhone(duplicateCustomer.phone)})
                    {duplicateCustomer.email && ` - ${duplicateCustomer.email}`}
                  </AlertDescription>
                </Alert>
              )}

              {/* Name Field */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>Customer Name</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                        <Input
                          {...field}
                          placeholder="John Smith"
                          className="pl-10"
                          error={!!form.formState.errors.name}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Email Field */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel optional>Email Address</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                        <Input
                          {...field}
                          type="email"
                          placeholder="john@example.com"
                          className="pl-10"
                          value={field.value ?? ''}
                          error={!!form.formState.errors.email}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Lead Source Field */}
              <FormField
                control={form.control}
                name="source"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel optional>Lead Source</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 z-10" />
                        <Select
                          onValueChange={field.onChange}
                          value={field.value ?? undefined}
                        >
                          <SelectTrigger className="pl-10">
                            <SelectValue placeholder="Select lead source" />
                          </SelectTrigger>
                          <SelectContent>
                            {LEAD_SOURCES.map((source) => (
                              <SelectItem key={source} value={source}>
                                {leadSourceLabels[source] ?? source}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </FormControl>
                    <FormDescription>
                      How did this customer hear about you?
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>

            <CardFooter className="flex justify-end gap-3">
              {onCancel && (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={onCancel}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
              )}
              <Button
                type="submit"
                loading={isSubmitting}
                disabled={isSubmitting || isCheckingDuplicate}
              >
                {duplicateCustomer ? 'Create Anyway' : 'Create Customer'}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>

      {/* Duplicate Confirmation Dialog */}
      <AlertDialog open={showDuplicateDialog} onOpenChange={setShowDuplicateDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Duplicate Phone Number Detected</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3">
                <p>
                  A customer with this phone number already exists in the system:
                </p>
                <div className="p-3 bg-zinc-50 rounded-md border border-zinc-200">
                  <p className="font-medium text-zinc-900">{duplicateCustomer?.name}</p>
                  <p className="text-sm text-zinc-600">
                    {duplicateCustomer && formatPhone(duplicateCustomer.phone)}
                  </p>
                  {duplicateCustomer?.email && (
                    <p className="text-sm text-zinc-500">{duplicateCustomer.email}</p>
                  )}
                </div>
                <p>
                  Are you sure you want to create a new customer with the same phone number?
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelDuplicate}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmCreate}>
              Create Anyway
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
