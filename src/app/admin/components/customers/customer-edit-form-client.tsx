'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Phone, User, Mail, Tag, Loader2 } from 'lucide-react';

import {
  updateCustomerSchema,
  type UpdateCustomerInput,
  LEAD_SOURCES,
} from '@/lib/validations/customer';
import { formatPhone } from '@/lib/utils/phone';
import type { CustomerWithDetails } from '@/lib/types/customer';

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
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/forms/form';
import { updateCustomer } from '@/app/actions/customers';

/**
 * Customer Edit Form Client Component
 */

interface CustomerEditFormClientProps {
  customer: CustomerWithDetails;
}

const LEAD_SOURCE_LABELS: Record<string, string> = {
  referral: 'Referral',
  website: 'Website',
  phone: 'Phone Call',
  walk_in: 'Walk-in',
  google: 'Google',
  facebook: 'Facebook',
  yelp: 'Yelp',
  social_media: 'Social Media',
  other: 'Other',
};

export function CustomerEditFormClient({ customer }: CustomerEditFormClientProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const form = useForm<UpdateCustomerInput>({
    resolver: zodResolver(updateCustomerSchema),
    defaultValues: {
      phone: customer.phone,
      name: customer.name,
      email: customer.email ?? '',
      source: customer.source ?? '',
    },
  });

  async function handleFormSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const values = form.getValues();

    // Transform __none__ back to empty string before validation
    const transformedValues = {
      ...values,
      id: customer.id,
      source: values.source === '__none__' ? '' : values.source,
    };

    const validationResult = updateCustomerSchema.safeParse(transformedValues);
    if (!validationResult.success) {
      toast.error(validationResult.error.errors[0]?.message || 'Validation failed');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await updateCustomer(customer.id, validationResult.data);

      if (result.success) {
        toast.success('Customer updated successfully');
        router.push(`/admin/customers/${customer.id}`);
        router.refresh();
      } else {
        toast.error(result.error || 'Failed to update customer');
      }
    } catch (error) {
      console.error('Error updating customer:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleCancel() {
    router.push(`/admin/customers/${customer.id}`);
  }

  function handlePhoneBlur(event: React.FocusEvent<HTMLInputElement>) {
    const formatted = formatPhone(event.target.value);
    if (formatted !== event.target.value) {
      form.setValue('phone', formatted, { shouldValidate: true });
    }
  }

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle className="text-lg">Customer Information</CardTitle>
        <CardDescription>
          Update the customer&apos;s contact details and information.
        </CardDescription>
      </CardHeader>

      <Form {...form}>
        <form onSubmit={handleFormSubmit}>
          <CardContent className="space-y-4">
            {/* Phone Field */}
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Phone Number <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                      <Input
                        {...field}
                        type="tel"
                        placeholder="(555) 123-4567"
                        className="pl-10"
                        onBlur={(e) => {
                          field.onBlur();
                          handlePhoneBlur(e);
                        }}
                        disabled={isSubmitting}
                      />
                    </div>
                  </FormControl>
                  <FormDescription>
                    Primary contact number for this customer
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Name Field */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Full Name <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                      <Input
                        {...field}
                        placeholder="John Smith"
                        className="pl-10"
                        disabled={isSubmitting}
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
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                      <Input
                        {...field}
                        type="email"
                        placeholder="john@example.com"
                        className="pl-10"
                        disabled={isSubmitting}
                      />
                    </div>
                  </FormControl>
                  <FormDescription>
                    Optional email for communications
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Source Field */}
            <FormField
              control={form.control}
              name="source"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lead Source</FormLabel>
                  <div className="relative">
                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 z-10 pointer-events-none" />
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value || '__none__'}
                      disabled={isSubmitting}
                    >
                      <FormControl>
                        <SelectTrigger className="pl-10">
                          <SelectValue placeholder="How did they find us?" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="__none__">No source specified</SelectItem>
                        {LEAD_SOURCES.map((source) => (
                          <SelectItem key={source} value={source}>
                            {LEAD_SOURCE_LABELS[source] || source}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <FormDescription>
                    Track how the customer discovered your business
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>

          <CardFooter className="flex justify-between border-t pt-6">
            <Button
              type="button"
              variant="ghost"
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
