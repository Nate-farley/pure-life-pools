/**
 * Event Detail Popover
 *
 * @file src/components/admin/calendar/event-detail-popover.tsx
 *
 * Popover component that displays event details when clicking an event.
 * Includes quick actions for completing, canceling, editing, and deleting.
 */

'use client';

import * as React from 'react';
import Link from 'next/link';
import * as Popover from '@radix-ui/react-popover';
import {
  X,
  Calendar,
  MapPin,
  User,
  Phone,
  Home,
  CheckCircle,
  XCircle,
  Pencil,
  Trash2,
  ExternalLink,
  MoreHorizontal,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { cn } from '@/lib/utils';
import {
  cancelCalendarEvent,
  completeCalendarEvent,
  deleteCalendarEvent,
} from '@/app/actions/calendar';
import type { CalendarEventWithCustomer } from '@/lib/types/calendar';
import {
  formatTimeRange,
  getRelativeDateLabel,
  DEFAULT_TIMEZONE,
} from '@/lib/utils/timezone';
import {
  getEventTypeLabel,
  getEventStatusLabel,
} from '@/lib/validations/calendar';
import { getEventColors, getStatusStyles } from '@/lib/types/calendar';
import { EditEventModal } from './edit-event-modal';

// =============================================================================
// Types
// =============================================================================

interface EventDetailPopoverProps {
  /** The event to display */
  event: CalendarEventWithCustomer;
  /** The anchor element for positioning */
  anchor: HTMLElement;
  /** Callback when popover is closed */
  onClose: () => void;
  /** Callback when event is updated or deleted */
  onUpdated: () => void;
  /** Timezone for display */
  timezone?: string;
}

// =============================================================================
// Component
// =============================================================================

export function EventDetailPopover({
  event,
  anchor,
  onClose,
  onUpdated,
  timezone = DEFAULT_TIMEZONE,
}: EventDetailPopoverProps) {
  // State
  const [isCompleting, setIsCompleting] = React.useState(false);
  const [isCanceling, setIsCanceling] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);
  const [showEditModal, setShowEditModal] = React.useState(false);

  // Get colors and styles
  const colors = getEventColors(event.event_type);
  const statusStyles = getStatusStyles(event.status);

  // ===========================================================================
  // Actions
  // ===========================================================================

  const handleComplete = async () => {
    if (event.status !== 'scheduled') {
      toast.error(`Cannot complete a ${event.status} event`);
      return;
    }

    setIsCompleting(true);

    try {
      const result = await completeCalendarEvent(event.id, event.version);

      if (result.success) {
        toast.success('Event marked as completed');
        onUpdated();
      } else {
        toast.error(result.error || 'Failed to complete event');
      }
    } catch (error) {
      console.error('Error completing event:', error);
      toast.error('Failed to complete event');
    } finally {
      setIsCompleting(false);
    }
  };

  const handleCancel = async () => {
    if (event.status !== 'scheduled') {
      toast.error(`Cannot cancel a ${event.status} event`);
      return;
    }

    setIsCanceling(true);

    try {
      const result = await cancelCalendarEvent(event.id, event.version);

      if (result.success) {
        toast.success('Event canceled');
        onUpdated();
      } else {
        toast.error(result.error || 'Failed to cancel event');
      }
    } catch (error) {
      console.error('Error canceling event:', error);
      toast.error('Failed to cancel event');
    } finally {
      setIsCanceling(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);

    try {
      const result = await deleteCalendarEvent(event.id);

      if (result.success) {
        toast.success('Event deleted');
        onUpdated();
      } else {
        toast.error(result.error || 'Failed to delete event');
      }
    } catch (error) {
      console.error('Error deleting event:', error);
      toast.error('Failed to delete event');
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleEditComplete = () => {
    setShowEditModal(false);
    onUpdated();
  };

  // ===========================================================================
  // Render
  // ===========================================================================

  return (
    <>
      <Popover.Root open={true} onOpenChange={(open) => !open && onClose()}>
        <Popover.Anchor asChild>
          <span ref={(node) => node && anchor} />
        </Popover.Anchor>

        <Popover.Portal>
          <Popover.Content
            className={cn(
              'z-50 w-80 rounded-lg bg-white shadow-lg border border-zinc-200',
              'animate-in fade-in-0 zoom-in-95 duration-200',
              'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95'
            )}
            sideOffset={8}
            align="start"
            collisionPadding={16}
          >
            {/* Header */}
            <div
              className="px-4 py-3 border-b border-zinc-100 rounded-t-lg"
              style={{ backgroundColor: colors.background }}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  {/* Status badge */}
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                      style={{
                        backgroundColor: `${colors.border}20`,
                        color: colors.text,
                      }}
                    >
                      {getEventTypeLabel(event.event_type)}
                    </span>
                    <span
                      className={cn(
                        'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium',
                        event.status === 'scheduled' && 'bg-blue-50 text-blue-700',
                        event.status === 'completed' && 'bg-emerald-50 text-emerald-700',
                        event.status === 'canceled' && 'bg-red-50 text-red-700'
                      )}
                    >
                      <span
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ backgroundColor: statusStyles.dotColor }}
                      />
                      {getEventStatusLabel(event.status)}
                    </span>
                  </div>

                  {/* Title */}
                  <h3
                    className={cn(
                      'text-base font-semibold text-zinc-900',
                      event.status === 'canceled' && 'line-through opacity-70'
                    )}
                  >
                    {event.title}
                  </h3>
                </div>

                {/* Close button */}
                <button
                  onClick={onClose}
                  className="flex-shrink-0 p-1 rounded hover:bg-zinc-200/50 text-zinc-500 hover:text-zinc-700 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-4 space-y-3">
              {/* Date & Time */}
              <div className="flex items-start gap-3 text-sm">
                <Calendar className="w-4 h-4 text-zinc-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-zinc-900">
                    {getRelativeDateLabel(event.start_datetime, timezone)}
                  </p>
                  {event.all_day ? (
                    <p className="text-zinc-500">All day</p>
                  ) : (
                    <p className="text-zinc-500">
                      {formatTimeRange(event.start_datetime, event.end_datetime, timezone)}
                    </p>
                  )}
                </div>
              </div>

              {/* Customer */}
              <div className="flex items-start gap-3 text-sm">
                <User className="w-4 h-4 text-zinc-400 mt-0.5 flex-shrink-0" />
                <div>
                  <Link
                    href={`/admin/customers/${event.customer_id}`}
                    className="font-medium text-zinc-900 hover:text-blue-600 transition-colors"
                  >
                    {event.customer.name}
                  </Link>
                  <p className="text-zinc-500 flex items-center gap-1">
                    <Phone className="w-3 h-3" />
                    {event.customer.phone}
                  </p>
                </div>
              </div>

              {/* Property */}
              {event.property && (
                <div className="flex items-start gap-3 text-sm">
                  <Home className="w-4 h-4 text-zinc-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-zinc-900">{event.property.address_line1}</p>
                    <p className="text-zinc-500">
                      {event.property.city}
                      {event.property.state && `, ${event.property.state}`}
                    </p>
                  </div>
                </div>
              )}

              {/* Location URL */}
              {event.location_url && (
                <div className="flex items-start gap-3 text-sm">
                  <MapPin className="w-4 h-4 text-zinc-400 mt-0.5 flex-shrink-0" />
                  <a
                    href={event.location_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1"
                  >
                    View on map
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}

              {/* Description */}
              {event.description && (
                <div className="pt-2 border-t border-zinc-100">
                  <p className="text-sm text-zinc-600 whitespace-pre-wrap">
                    {event.description}
                  </p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="px-4 py-3 border-t border-zinc-100 bg-zinc-50 rounded-b-lg">
              <div className="flex items-center justify-between gap-2">
                {/* Quick actions for scheduled events */}
                {event.status === 'scheduled' && (
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={handleComplete}
                      disabled={isCompleting}
                    >
                      {isCompleting ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4 mr-1.5" />
                          Complete
                        </>
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleCancel}
                      disabled={isCanceling}
                      className="text-zinc-600 hover:text-red-600"
                    >
                      {isCanceling ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <XCircle className="w-4 h-4 mr-1.5" />
                          Cancel
                        </>
                      )}
                    </Button>
                  </div>
                )}

                {/* Non-scheduled status message */}
                {event.status !== 'scheduled' && (
                  <span className="text-sm text-zinc-500">
                    Event is {event.status}
                  </span>
                )}

                {/* More menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="sm" variant="ghost" className="px-2">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => setShowEditModal(true)}
                      className="cursor-pointer"
                    >
                      <Pencil className="w-4 h-4 mr-2" />
                      Edit event
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={`/admin/customers/${event.customer_id}`}>
                        <User className="w-4 h-4 mr-2" />
                        View customer
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => setShowDeleteConfirm(true)}
                      className="cursor-pointer text-red-600 focus:text-red-600"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete event
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <Popover.Arrow className="fill-white" />
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>

      {/* Delete confirmation dialog */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete event</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &ldquo;{event.title}&rdquo;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit modal */}
      {showEditModal && (
        <EditEventModal
          open={showEditModal}
          onOpenChange={setShowEditModal}
          event={event}
          onUpdated={handleEditComplete}
        />
      )}
    </>
  );
}
