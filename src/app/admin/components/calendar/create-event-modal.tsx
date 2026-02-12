/**
 * Create Event Modal
 *
 * @file src/components/admin/calendar/create-event-modal.tsx
 *
 * Modal dialog for creating new calendar events.
 * Includes customer search, property/pool selection, and datetime pickers.
 */

'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Search, Calendar, Clock, User, Home } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { createCalendarEvent } from '@/app/actions/calendar';
import { searchCustomers } from '@/app/actions/customers';
import {
  createCalendarEventSchema,
  eventTypeOptions,
  type CreateCalendarEventInput,
} from '@/lib/validations/calendar';
import {
  localToUTCString,
  utcToLocalString,
  DEFAULT_TIMEZONE,
} from '@/lib/utils/timezone';
import type { Customer, Property, Pool } from '@/lib/types/database';

// =============================================================================
// Types
// =============================================================================

interface CreateEventModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Pre-selected customer ID (optional) */
  customerId?: string;
  /** Pre-selected customer data (optional) */
  customer?: Pick<Customer, 'id' | 'name' | 'phone'>;
  /** Default start time */
  defaultStart?: Date;
  /** Default end time */
  defaultEnd?: Date;
  /** Default all-day setting */
  defaultAllDay?: boolean;
  /** Callback when event is created */
  onCreated?: () => void;
  /** Timezone */
  timezone?: string;
}

interface CustomerSearchResult {
  id: string;
  name: string;
  phone: string;
  properties?: Array<{
    id: string;
    address_line1: string;
    city: string;
    pool?: { id: string; type: string } | null;
  }>;
}

// =============================================================================
// Component
// =============================================================================

export function CreateEventModal({
  open,
  onOpenChange,
  customerId: initialCustomerId,
  customer: initialCustomer,
  defaultStart,
  defaultEnd,
  defaultAllDay = false,
  onCreated,
  timezone = DEFAULT_TIMEZONE,
}: CreateEventModalProps) {
  // Customer search state
  const [customerSearch, setCustomerSearch] = React.useState('');
  const [searchResults, setSearchResults] = React.useState<CustomerSearchResult[]>([]);
  const [isSearching, setIsSearching] = React.useState(false);
  const [selectedCustomer, setSelectedCustomer] = React.useState<CustomerSearchResult | null>(
    initialCustomer
      ? {
          id: initialCustomer.id,
          name: initialCustomer.name,
          phone: initialCustomer.phone,
        }
      : null
  );
  const [selectedProperty, setSelectedProperty] = React.useState<string | null>(null);
  const [selectedPool, setSelectedPool] = React.useState<string | null>(null);

  // Search debounce ref
  const searchTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  // Form setup
  const form = useForm<CreateCalendarEventInput>({
    resolver: zodResolver(createCalendarEventSchema),
    defaultValues: {
      customerId: initialCustomerId ?? '',
      propertyId: null,
      poolId: null,
      title: '',
      description: '',
      eventType: 'consultation',
      startDatetime: defaultStart
        ? format(defaultStart, "yyyy-MM-dd'T'HH:mm")
        : format(new Date(), "yyyy-MM-dd'T'HH:mm"),
      endDatetime: defaultEnd
        ? format(defaultEnd, "yyyy-MM-dd'T'HH:mm")
        : format(new Date(Date.now() + 3600000), "yyyy-MM-dd'T'HH:mm"),
      allDay: defaultAllDay,
      locationUrl: '',
    },
  });

  const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = form;
  const allDay = watch('allDay');
  const eventType = watch('eventType');

  // ===========================================================================
  // Customer Search
  // ===========================================================================

  const handleCustomerSearch = React.useCallback(async (query: string) => {
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);

    try {
      const result = await searchCustomers(query, 5);

      if (result.success) {
        setSearchResults(result.data as CustomerSearchResult[]);
      }
    } catch (error) {
      console.error('Error searching customers:', error);
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Debounced search
  React.useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (customerSearch.length >= 2) {
      searchTimeoutRef.current = setTimeout(() => {
        handleCustomerSearch(customerSearch);
      }, 300);
    } else {
      setSearchResults([]);
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [customerSearch, handleCustomerSearch]);

  // ===========================================================================
  // Customer Selection
  // ===========================================================================

  const handleSelectCustomer = (customer: CustomerSearchResult) => {
    setSelectedCustomer(customer);
    setValue('customerId', customer.id);
    setCustomerSearch('');
    setSearchResults([]);
    setSelectedProperty(null);
    setSelectedPool(null);
    setValue('propertyId', null);
    setValue('poolId', null);
  };

  const handleClearCustomer = () => {
    setSelectedCustomer(null);
    setValue('customerId', '');
    setSelectedProperty(null);
    setSelectedPool(null);
    setValue('propertyId', null);
    setValue('poolId', null);
  };

  // ===========================================================================
  // Property/Pool Selection
  // ===========================================================================

  const handlePropertyChange = (propertyId: string) => {
    if (propertyId === 'none') {
      setSelectedProperty(null);
      setSelectedPool(null);
      setValue('propertyId', null);
      setValue('poolId', null);
    } else {
      setSelectedProperty(propertyId);
      setValue('propertyId', propertyId);

      // Auto-select pool if property has one
      const property = selectedCustomer?.properties?.find((p) => p.id === propertyId);
      if (property?.pool) {
        setSelectedPool(property.pool.id);
        setValue('poolId', property.pool.id);
      } else {
        setSelectedPool(null);
        setValue('poolId', null);
      }
    }
  };

  // ===========================================================================
  // Form Submission
  // ===========================================================================

  const onSubmit = async (data: CreateCalendarEventInput) => {
    try {
      // Convert local times to UTC for storage
      const submitData: CreateCalendarEventInput = {
        ...data,
        startDatetime: localToUTCString(data.startDatetime, timezone),
        endDatetime: localToUTCString(data.endDatetime, timezone),
      };

      const result = await createCalendarEvent(submitData);

      if (result.success) {
        toast.success('Event created successfully');
        onOpenChange(false);
        onCreated?.();
      } else {
        toast.error(result.error || 'Failed to create event');
      }
    } catch (error) {
      console.error('Error creating event:', error);
      toast.error('Failed to create event');
    }
  };

  // ===========================================================================
  // Auto-generate title based on event type and customer
  // ===========================================================================

  React.useEffect(() => {
    if (selectedCustomer && !form.getValues('title')) {
      const typeLabels: Record<string, string> = {
        consultation: 'Consultation',
        estimate_visit: 'Estimate Visit',
        follow_up: 'Follow Up',
        other: 'Appointment',
      };
      const label = typeLabels[eventType] || 'Appointment';
      setValue('title', `${label} - ${selectedCustomer.name}`);
    }
  }, [selectedCustomer, eventType, setValue, form]);

  // ===========================================================================
  // Render
  // ===========================================================================

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Event</DialogTitle>
          <DialogDescription>
            Schedule a new appointment or follow-up with a customer.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Customer Selection */}
          <div className="space-y-2">
            <Label>
              Customer <span className="text-red-500">*</span>
            </Label>

            {selectedCustomer ? (
              <div className="flex items-center justify-between p-3 bg-zinc-50 rounded-md border border-zinc-200">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center">
                    <User className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-zinc-900">{selectedCustomer.name}</p>
                    <p className="text-sm text-zinc-500">{selectedCustomer.phone}</p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleClearCustomer}
                >
                  Change
                </Button>
              </div>
            ) : (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <Input
                  placeholder="Search by name or phone..."
                  value={customerSearch}
                  onChange={(e) => setCustomerSearch(e.target.value)}
                  className="pl-9"
                />

                {/* Search Results Dropdown */}
                {(searchResults.length > 0 || isSearching) && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-zinc-200 rounded-md shadow-lg">
                    {isSearching ? (
                      <div className="p-4 text-center text-sm text-zinc-500">
                        <Loader2 className="w-4 h-4 animate-spin mx-auto mb-1" />
                        Searching...
                      </div>
                    ) : (
                      <ul className="py-1">
                        {searchResults.map((customer) => (
                          <li key={customer.id}>
                            <button
                              type="button"
                              onClick={() => handleSelectCustomer(customer)}
                              className="w-full px-4 py-2 text-left hover:bg-zinc-50 transition-colors"
                            >
                              <p className="font-medium text-zinc-900">{customer.name}</p>
                              <p className="text-sm text-zinc-500">{customer.phone}</p>
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>
            )}

            {errors.customerId && (
              <p className="text-sm text-red-600">{errors.customerId.message}</p>
            )}
          </div>

          {/* Property Selection (if customer selected and has properties) */}
          {selectedCustomer?.properties && selectedCustomer.properties.length > 0 && (
            <div className="space-y-2">
              <Label>Property</Label>
              <Select
                value={selectedProperty ?? 'none'}
                onValueChange={handlePropertyChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a property (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No specific property</SelectItem>
                  {selectedCustomer.properties.map((property) => (
                    <SelectItem key={property.id} value={property.id}>
                      <div className="flex items-center gap-2">
                        <Home className="w-4 h-4 text-zinc-400" />
                        <span>
                          {property.address_line1}, {property.city}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Event Type */}
          <div className="space-y-2">
            <Label htmlFor="eventType">
              Event Type <span className="text-red-500">*</span>
            </Label>
            <Select
              value={eventType}
              onValueChange={(value) => setValue('eventType', value as CreateCalendarEventInput['eventType'])}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select event type" />
              </SelectTrigger>
              <SelectContent>
                {eventTypeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.eventType && (
              <p className="text-sm text-red-600">{errors.eventType.message}</p>
            )}
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">
              Title <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              {...register('title')}
              placeholder="Event title"
            />
            {errors.title && (
              <p className="text-sm text-red-600">{errors.title.message}</p>
            )}
          </div>

          {/* All Day Toggle */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="allDay"
              {...register('allDay')}
              className="h-4 w-4 rounded border-zinc-300 text-blue-600 focus:ring-blue-500"
            />
            <Label htmlFor="allDay" className="font-normal cursor-pointer">
              All day event
            </Label>
          </div>

          {/* Date/Time */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDatetime">
                {allDay ? 'Date' : 'Start'} <span className="text-red-500">*</span>
              </Label>
              <Input
                id="startDatetime"
                type={allDay ? 'date' : 'datetime-local'}
                {...register('startDatetime')}
              />
              {errors.startDatetime && (
                <p className="text-sm text-red-600">{errors.startDatetime.message}</p>
              )}
            </div>

            {!allDay && (
              <div className="space-y-2">
                <Label htmlFor="endDatetime">
                  End <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="endDatetime"
                  type="datetime-local"
                  {...register('endDatetime')}
                />
                {errors.endDatetime && (
                  <p className="text-sm text-red-600">{errors.endDatetime.message}</p>
                )}
              </div>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Notes</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Add any notes or details..."
              rows={3}
            />
          </div>

          {/* Location URL */}
          <div className="space-y-2">
            <Label htmlFor="locationUrl">Location URL</Label>
            <Input
              id="locationUrl"
              {...register('locationUrl')}
              placeholder="https://maps.google.com/..."
              type="url"
            />
            <p className="text-xs text-zinc-500">
              Optional link to Google Maps or other directions
            </p>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="secondary"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !selectedCustomer}>
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Event'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
