/**
 * Edit Event Modal
 *
 * @file src/components/admin/calendar/edit-event-modal.tsx
 *
 * Modal dialog for editing existing calendar events.
 * Pre-populates form with existing event data.
 */

'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, User, Home } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

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
import { updateCalendarEvent } from '@/app/actions/calendar';
import {
  updateCalendarEventSchema,
  eventTypeOptions,
  eventStatusOptions,
  type UpdateCalendarEventInput,
} from '@/lib/validations/calendar';
import {
  localToUTCString,
  utcToLocalString,
  DEFAULT_TIMEZONE,
} from '@/lib/utils/timezone';
import type { CalendarEventWithCustomer } from '@/lib/types/calendar';

// =============================================================================
// Types
// =============================================================================

interface EditEventModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** The event to edit */
  event: CalendarEventWithCustomer;
  /** Callback when event is updated */
  onUpdated?: () => void;
  /** Timezone */
  timezone?: string;
}

// =============================================================================
// Component
// =============================================================================

export function EditEventModal({
  open,
  onOpenChange,
  event,
  onUpdated,
  timezone = DEFAULT_TIMEZONE,
}: EditEventModalProps) {
  // Form setup
  const form = useForm<UpdateCalendarEventInput>({
    resolver: zodResolver(updateCalendarEventSchema),
    defaultValues: {
      id: event.id,
      version: event.version,
      title: event.title,
      description: event.description ?? '',
      eventType: event.event_type,
      status: event.status,
      startDatetime: utcToLocalString(event.start_datetime, timezone),
      endDatetime: utcToLocalString(event.end_datetime, timezone),
      allDay: event.all_day,
      locationUrl: event.location_url ?? '',
    },
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting, isDirty },
  } = form;

  const allDay = watch('allDay');
  const eventType = watch('eventType');
  const status = watch('status');

  // ===========================================================================
  // Form Submission
  // ===========================================================================

  const onSubmit = async (data: UpdateCalendarEventInput) => {
    try {
      // Convert local times to UTC for storage
      const submitData: UpdateCalendarEventInput = {
        ...data,
        startDatetime: data.startDatetime
          ? localToUTCString(data.startDatetime, timezone)
          : undefined,
        endDatetime: data.endDatetime
          ? localToUTCString(data.endDatetime, timezone)
          : undefined,
      };

      const result = await updateCalendarEvent(submitData);

      if (result.success) {
        toast.success('Event updated successfully');
        onOpenChange(false);
        onUpdated?.();
      } else {
        if (result.code === 'CONFLICT') {
          toast.error('Event was modified by another user. Please refresh and try again.');
        } else {
          toast.error(result.error || 'Failed to update event');
        }
      }
    } catch (error) {
      console.error('Error updating event:', error);
      toast.error('Failed to update event');
    }
  };

  // ===========================================================================
  // Render
  // ===========================================================================

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Event</DialogTitle>
          <DialogDescription>
            Make changes to the event details below.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Customer Info (read-only) */}
          <div className="space-y-2">
            <Label>Customer</Label>
            <div className="flex items-center justify-between p-3 bg-zinc-50 rounded-md border border-zinc-200">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center">
                  <User className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-zinc-900">{event.customer.name}</p>
                  <p className="text-sm text-zinc-500">{event.customer.phone}</p>
                </div>
              </div>
              <Link
                href={`/admin/customers/${event.customer_id}`}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                View
              </Link>
            </div>
          </div>

          {/* Property Info (read-only if set) */}
          {event.property && (
            <div className="space-y-2">
              <Label>Property</Label>
              <div className="flex items-center gap-3 p-3 bg-zinc-50 rounded-md border border-zinc-200">
                <Home className="w-4 h-4 text-zinc-400" />
                <div>
                  <p className="text-zinc-900">{event.property.address_line1}</p>
                  <p className="text-sm text-zinc-500">
                    {event.property.city}
                    {event.property.state && `, ${event.property.state}`}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Status (can be changed) */}
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={status}
              onValueChange={(value) =>
                setValue('status', value as UpdateCalendarEventInput['status'], {
                  shouldDirty: true,
                })
              }
            >
              <SelectTrigger
                className={cn(
                  status === 'completed' && 'border-emerald-300 bg-emerald-50',
                  status === 'canceled' && 'border-red-300 bg-red-50'
                )}
              >
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {eventStatusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <span
                      className={cn(
                        option.value === 'completed' && 'text-emerald-700',
                        option.value === 'canceled' && 'text-red-700'
                      )}
                    >
                      {option.label}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Event Type */}
          <div className="space-y-2">
            <Label htmlFor="eventType">
              Event Type <span className="text-red-500">*</span>
            </Label>
            <Select
              value={eventType}
              onValueChange={(value) =>
                setValue('eventType', value as UpdateCalendarEventInput['eventType'], {
                  shouldDirty: true,
                })
              }
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
            <Button type="submit" disabled={isSubmitting || !isDirty}>
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
