/**
 * Pool Calendar Component
 *
 * @file src/components/admin/calendar/pool-calendar.tsx
 *
 * Main calendar component wrapping FullCalendar with:
 * - Day, Week, Month views
 * - Event rendering with color coding by type
 * - Drag/drop rescheduling with optimistic locking
 * - Timezone-aware display
 */

'use client';

import * as React from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import type {
  EventClickArg,
  EventDropArg,
  EventResizeDoneArg,
  DateSelectArg,
  DatesSetArg,
  EventContentArg,
} from '@fullcalendar/core';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

import { getEventsInRange, rescheduleCalendarEvent } from '@/app/actions/calendar';
import {
  toFullCalendarEvents,
  getEventColors,
  getStatusStyles,
  type CalendarEventWithCustomer,
  type FullCalendarEvent,
} from '@/lib/types/calendar';
import { DEFAULT_TIMEZONE, getCalendarRangeUTC } from '@/lib/utils/timezone';
import { cn } from '@/lib/utils';
import { EventDetailPopover } from './event-detail-popover';
import { CreateEventModal } from './create-event-modal';

// =============================================================================
// Types
// =============================================================================

interface PoolCalendarProps {
  /** Initial events to display (optional, for SSR) */
  initialEvents?: CalendarEventWithCustomer[];
  /** Customer ID to filter events (optional) */
  customerId?: string;
  /** Callback when an event is clicked */
  onEventClick?: (event: CalendarEventWithCustomer) => void;
  /** Callback when an empty date/time is clicked */
  onDateSelect?: (start: Date, end: Date, allDay: boolean) => void;
  /** Timezone for display (defaults to app timezone) */
  timezone?: string;
  /** Additional CSS classes */
  className?: string;
}

// =============================================================================
// Component
// =============================================================================

export function PoolCalendar({
  initialEvents = [],
  customerId,
  onEventClick,
  onDateSelect,
  timezone = DEFAULT_TIMEZONE,
  className,
}: PoolCalendarProps) {
  // State
  const [events, setEvents] = React.useState<FullCalendarEvent[]>(
    toFullCalendarEvents(initialEvents)
  );
  const [isLoading, setIsLoading] = React.useState(false);
  const [selectedEvent, setSelectedEvent] = React.useState<CalendarEventWithCustomer | null>(null);
  const [popoverAnchor, setPopoverAnchor] = React.useState<HTMLElement | null>(null);
  const [createModalOpen, setCreateModalOpen] = React.useState(false);
  const [newEventDates, setNewEventDates] = React.useState<{
    start: Date;
    end: Date;
    allDay: boolean;
  } | null>(null);

  // Track current date range for refetching
  const currentRangeRef = React.useRef<{ start: Date; end: Date } | null>(null);

  // Calendar ref for API access
  const calendarRef = React.useRef<FullCalendar>(null);

  // ===========================================================================
  // Event Fetching
  // ===========================================================================

  /**
   * Fetch events for the visible date range
   */
  const fetchEvents = React.useCallback(
    async (start: Date, end: Date) => {
      setIsLoading(true);

      try {
        const { start: utcStart, end: utcEnd } = getCalendarRangeUTC(start, end, timezone);

        const result = await getEventsInRange({
          start: utcStart,
          end: utcEnd,
          customerId,
        });

        if (result.success) {
          setEvents(toFullCalendarEvents(result.data));
        } else {
          console.error('Failed to fetch events:', result.error);
          toast.error('Failed to load calendar events');
        }
      } catch (error) {
        console.error('Error fetching events:', error);
        toast.error('Failed to load calendar events');
      } finally {
        setIsLoading(false);
      }
    },
    [customerId, timezone]
  );

  /**
   * Handle date range change (view change or navigation)
   */
  const handleDatesSet = React.useCallback(
    (info: DatesSetArg) => {
      currentRangeRef.current = { start: info.start, end: info.end };
      fetchEvents(info.start, info.end);
    },
    [fetchEvents]
  );

  // ===========================================================================
  // Event Handlers
  // ===========================================================================

  /**
   * Handle event click - show detail popover
   */
  const handleEventClick = React.useCallback(
    (info: EventClickArg) => {
      const eventData = events.find((e) => e.id === info.event.id);

      if (eventData) {
        // Convert back to CalendarEventWithCustomer format
        const fullEvent: CalendarEventWithCustomer = {
          id: eventData.id,
          title: eventData.title,
          start_datetime: eventData.start as string,
          end_datetime: eventData.end as string,
          all_day: eventData.allDay,
          event_type: eventData.extendedProps.eventType as CalendarEventWithCustomer['event_type'],
          status: eventData.extendedProps.status as CalendarEventWithCustomer['status'],
          description: eventData.extendedProps.description as string | null,
          customer_id: eventData.extendedProps.customerId as string,
          property_id: eventData.extendedProps.propertyId as string | null,
          pool_id: eventData.extendedProps.poolId as string | null,
          location_url: eventData.extendedProps.locationUrl as string | null,
          version: eventData.extendedProps.version as number,
          reminder_24h_sent: false,
          reminder_2h_sent: false,
          created_by: '',
          created_at: '',
          updated_at: '',
          customer: {
            id: eventData.extendedProps.customerId as string,
            name: eventData.extendedProps.customerName as string,
            phone: eventData.extendedProps.customerPhone as string,
            phone_normalized: eventData.extendedProps.customerPhone as string,
          },
          property: eventData.extendedProps.propertyAddress
            ? {
                id: eventData.extendedProps.propertyId as string,
                address_line1: (eventData.extendedProps.propertyAddress as string).split(',')[0],
                city: (eventData.extendedProps.propertyAddress as string).split(',')[1]?.trim() || '',
                state: '',
              }
            : null,
          pool: eventData.extendedProps.poolType
            ? {
                id: eventData.extendedProps.poolId as string,
                type: eventData.extendedProps.poolType as 'inground' | 'above_ground' | 'spa' | 'other',
              }
            : null,
        };

        setSelectedEvent(fullEvent);
        setPopoverAnchor(info.el);

        if (onEventClick) {
          onEventClick(fullEvent);
        }
      }
    },
    [events, onEventClick]
  );

  /**
   * Handle date selection (clicking empty space)
   */
  const handleDateSelect = React.useCallback(
    (info: DateSelectArg) => {
      // Clear the selection
      const calendarApi = calendarRef.current?.getApi();
      calendarApi?.unselect();

      if (onDateSelect) {
        onDateSelect(info.start, info.end, info.allDay);
      } else {
        // Open create modal with selected dates
        setNewEventDates({
          start: info.start,
          end: info.end,
          allDay: info.allDay,
        });
        setCreateModalOpen(true);
      }
    },
    [onDateSelect]
  );

  /**
   * Handle event drop (drag to new time/date)
   */
  const handleEventDrop = React.useCallback(
    async (info: EventDropArg) => {
      const { event, revert } = info;
      const version = event.extendedProps.version as number;
      const status = event.extendedProps.status as string;

      // Can only move scheduled events
      if (status !== 'scheduled') {
        toast.error(`Cannot move a ${status} event`);
        revert();
        return;
      }

      // Optimistic update is already done by FullCalendar
      // Now persist to server

      try {
        const result = await rescheduleCalendarEvent({
          id: event.id,
          version,
          startDatetime: event.start?.toISOString() ?? '',
          endDatetime: event.end?.toISOString() ?? event.start?.toISOString() ?? '',
          allDay: event.allDay,
        });

        if (result.success) {
          // Update local state with new version
          setEvents((prev) =>
            prev.map((e) =>
              e.id === event.id
                ? {
                    ...e,
                    start: event.start?.toISOString() ?? e.start,
                    end: event.end?.toISOString() ?? e.end,
                    allDay: event.allDay,
                    extendedProps: {
                      ...e.extendedProps,
                      version: result.data.version,
                    },
                  }
                : e
            )
          );

          toast.success('Event rescheduled');
        } else {
          revert();

          if (result.code === 'CONFLICT') {
            toast.error('Event was modified by another user. Please refresh.');
            // Refetch events to get latest data
            if (currentRangeRef.current) {
              fetchEvents(currentRangeRef.current.start, currentRangeRef.current.end);
            }
          } else {
            toast.error(result.error || 'Failed to reschedule event');
          }
        }
      } catch (error) {
        console.error('Error rescheduling event:', error);
        revert();
        toast.error('Failed to reschedule event');
      }
    },
    [fetchEvents]
  );

  /**
   * Handle event resize
   */
  const handleEventResize = React.useCallback(
    async (info: EventResizeDoneArg) => {
      const { event, revert } = info;
      const version = event.extendedProps.version as number;
      const status = event.extendedProps.status as string;

      if (status !== 'scheduled') {
        toast.error(`Cannot resize a ${status} event`);
        revert();
        return;
      }

      try {
        const result = await rescheduleCalendarEvent({
          id: event.id,
          version,
          startDatetime: event.start?.toISOString() ?? '',
          endDatetime: event.end?.toISOString() ?? event.start?.toISOString() ?? '',
          allDay: event.allDay,
        });

        if (result.success) {
          setEvents((prev) =>
            prev.map((e) =>
              e.id === event.id
                ? {
                    ...e,
                    start: event.start?.toISOString() ?? e.start,
                    end: event.end?.toISOString() ?? e.end,
                    extendedProps: {
                      ...e.extendedProps,
                      version: result.data.version,
                    },
                  }
                : e
            )
          );

          toast.success('Event duration updated');
        } else {
          revert();

          if (result.code === 'CONFLICT') {
            toast.error('Event was modified by another user. Please refresh.');
            if (currentRangeRef.current) {
              fetchEvents(currentRangeRef.current.start, currentRangeRef.current.end);
            }
          } else {
            toast.error(result.error || 'Failed to update event');
          }
        }
      } catch (error) {
        console.error('Error resizing event:', error);
        revert();
        toast.error('Failed to update event');
      }
    },
    [fetchEvents]
  );

  /**
   * Close event detail popover
   */
  const handleClosePopover = React.useCallback(() => {
    setSelectedEvent(null);
    setPopoverAnchor(null);
  }, []);

  /**
   * Handle event created/updated
   */
  const handleEventMutated = React.useCallback(() => {
    setCreateModalOpen(false);
    setNewEventDates(null);
    handleClosePopover();

    // Refetch events
    if (currentRangeRef.current) {
      fetchEvents(currentRangeRef.current.start, currentRangeRef.current.end);
    }
  }, [fetchEvents, handleClosePopover]);

  // ===========================================================================
  // Custom Event Rendering
  // ===========================================================================

  /**
   * Custom event content renderer
   */
  const renderEventContent = React.useCallback((eventInfo: EventContentArg) => {
    const { event, timeText, view } = eventInfo;
    const eventType = event.extendedProps.eventType as string;
    const status = event.extendedProps.status as string;
    const statusStyles = getStatusStyles(status as 'scheduled' | 'completed' | 'canceled');

    const isMonthView = view.type === 'dayGridMonth';
    const isCompact = isMonthView;

    return (
      <div
        className={cn(
          'flex items-center gap-1.5 px-1.5 py-0.5 overflow-hidden',
          isCompact && 'text-xs'
        )}
        style={{ opacity: statusStyles.opacity }}
      >
        {/* Status indicator dot */}
        <span
          className="flex-shrink-0 w-1.5 h-1.5 rounded-full"
          style={{ backgroundColor: statusStyles.dotColor }}
        />

        {/* Time (if not month view) */}
        {!isMonthView && timeText && (
          <span className="flex-shrink-0 text-[11px] font-medium opacity-80">
            {timeText}
          </span>
        )}

        {/* Title */}
        <span className="truncate font-medium">{event.title}</span>
      </div>
    );
  }, []);

  // ===========================================================================
  // Render
  // ===========================================================================

  return (
    <div className={cn('relative', className)}>
      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-white/50 z-10 flex items-center justify-center">
          <div className="flex items-center gap-2 text-zinc-600">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm">Loading events...</span>
          </div>
        </div>
      )}

      {/* Calendar */}
      <FullCalendar
        ref={calendarRef}
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay',
        }}
        events={events}
        eventContent={renderEventContent}
        editable={true}
        selectable={true}
        selectMirror={true}
        dayMaxEvents={true}
        weekends={true}
        nowIndicator={true}
        timeZone={timezone}
        slotMinTime="06:00:00"
        slotMaxTime="21:00:00"
        slotDuration="00:30:00"
        slotLabelInterval="01:00:00"
        slotLabelFormat={{
          hour: 'numeric',
          minute: '2-digit',
          meridiem: 'short',
        }}
        eventTimeFormat={{
          hour: 'numeric',
          minute: '2-digit',
          meridiem: 'short',
        }}
        datesSet={handleDatesSet}
        eventClick={handleEventClick}
        select={handleDateSelect}
        eventDrop={handleEventDrop}
        eventResize={handleEventResize}
        height="auto"
        expandRows={true}
        stickyHeaderDates={true}
        dayHeaderFormat={{
          weekday: 'short',
          month: 'numeric',
          day: 'numeric',
          omitCommas: true,
        }}
        buttonText={{
          today: 'Today',
          month: 'Month',
          week: 'Week',
          day: 'Day',
        }}
        allDaySlot={true}
        allDayText="All Day"
        eventResizableFromStart={true}
        snapDuration="00:15:00"
        eventClassNames={(arg) => {
          const status = arg.event.extendedProps.status as string;
          return [
            'cursor-pointer',
            'transition-all duration-150',
            status === 'canceled' && 'line-through',
          ].filter(Boolean) as string[];
        }}
      />

      {/* Event Detail Popover */}
      {selectedEvent && popoverAnchor && (
        <EventDetailPopover
          event={selectedEvent}
          anchor={popoverAnchor}
          onClose={handleClosePopover}
          onUpdated={handleEventMutated}
        />
      )}

      {/* Create Event Modal */}
      {createModalOpen && newEventDates && (
        <CreateEventModal
          open={createModalOpen}
          onOpenChange={setCreateModalOpen}
          defaultStart={newEventDates.start}
          defaultEnd={newEventDates.end}
          defaultAllDay={newEventDates.allDay}
          customerId={customerId}
          onCreated={handleEventMutated}
        />
      )}
    </div>
  );
}
