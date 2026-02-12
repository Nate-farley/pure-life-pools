/**
 * Calendar Event Types
 *
 * @file src/lib/types/calendar.ts
 *
 * TypeScript types for calendar-related entities and operations.
 * Includes FullCalendar integration types and color mapping.
 */

import type { CalendarEvent, Customer, Property, Pool, Admin } from './database';
import type { CalendarEventType, CalendarEventStatus } from '@/lib/validations/calendar';

// =============================================================================
// Extended Event Types
// =============================================================================

/**
 * Calendar event with related customer information
 */
export interface CalendarEventWithCustomer extends CalendarEvent {
  customer: Pick<Customer, 'id' | 'name' | 'phone' | 'phone_normalized'>;
  property?: Pick<Property, 'id' | 'address_line1' | 'city' | 'state'> | null;
  pool?: Pick<Pool, 'id' | 'type'> | null;
  created_by_admin?: Pick<Admin, 'id' | 'full_name' | 'email'> | null;
}

/**
 * Minimal event type for calendar display
 */
export interface CalendarEventSummary {
  id: string;
  title: string;
  start: string; // ISO datetime
  end: string; // ISO datetime
  allDay: boolean;
  eventType: CalendarEventType;
  status: CalendarEventStatus;
  customerId: string;
  customerName: string;
  backgroundColor: string;
  borderColor: string;
  textColor: string;
  extendedProps: {
    eventType: CalendarEventType;
    status: CalendarEventStatus;
    customerId: string;
    customerName: string;
    customerPhone: string;
    propertyAddress?: string;
    version: number;
  };
}

// =============================================================================
// FullCalendar Types
// =============================================================================

/**
 * FullCalendar event object compatible type
 */
export interface FullCalendarEvent {
  id: string;
  title: string;
  start: string | Date;
  end: string | Date;
  allDay: boolean;
  backgroundColor: string;
  borderColor: string;
  textColor: string;
  editable: boolean;
  extendedProps: Record<string, unknown>;
}

/**
 * Date range for calendar view queries
 */
export interface CalendarDateRange {
  start: Date;
  end: Date;
}

/**
 * FullCalendar date select info
 */
export interface DateSelectInfo {
  start: Date;
  end: Date;
  startStr: string;
  endStr: string;
  allDay: boolean;
}

/**
 * FullCalendar event drop info (drag/drop)
 */
export interface EventDropInfo {
  event: {
    id: string;
    start: Date | null;
    end: Date | null;
    allDay: boolean;
    extendedProps: Record<string, unknown>;
  };
  oldEvent: {
    start: Date | null;
    end: Date | null;
    allDay: boolean;
  };
  revert: () => void;
}

/**
 * FullCalendar event resize info
 */
export interface EventResizeInfo {
  event: {
    id: string;
    start: Date | null;
    end: Date | null;
    allDay: boolean;
    extendedProps: Record<string, unknown>;
  };
  oldEvent: {
    start: Date | null;
    end: Date | null;
    allDay: boolean;
  };
  revert: () => void;
}

/**
 * FullCalendar event click info
 */
export interface EventClickInfo {
  event: {
    id: string;
    title: string;
    start: Date | null;
    end: Date | null;
    allDay: boolean;
    backgroundColor: string;
    borderColor: string;
    extendedProps: Record<string, unknown>;
  };
  el: HTMLElement;
  jsEvent: MouseEvent;
}

// =============================================================================
// Color Configuration
// =============================================================================

/**
 * Event type color configuration
 * These colors are from the design system specification
 */
export const EVENT_TYPE_COLORS: Record<
  CalendarEventType,
  { background: string; border: string; text: string }
> = {
  consultation: {
    background: '#eff6ff', // blue-50
    border: '#2563eb', // blue-600
    text: '#1d4ed8', // blue-700
  },
  estimate_visit: {
    background: '#ecfdf5', // emerald-50
    border: '#059669', // emerald-600
    text: '#047857', // emerald-700
  },
  follow_up: {
    background: '#fffbeb', // amber-50
    border: '#d97706', // amber-600
    text: '#b45309', // amber-700
  },
  other: {
    background: '#f4f4f5', // zinc-100
    border: '#71717a', // zinc-500
    text: '#3f3f46', // zinc-700
  },
};

/**
 * Event status indicators
 */
export const EVENT_STATUS_STYLES: Record<
  CalendarEventStatus,
  { dotColor: string; opacity: number }
> = {
  scheduled: {
    dotColor: '#2563eb', // blue-600
    opacity: 1,
  },
  completed: {
    dotColor: '#059669', // emerald-600
    opacity: 0.7,
  },
  canceled: {
    dotColor: '#dc2626', // red-600
    opacity: 0.5,
  },
};

// =============================================================================
// List Result Types
// =============================================================================

/**
 * Paginated list of calendar events
 */
export interface CalendarEventListResult {
  events: CalendarEventWithCustomer[];
  hasMore: boolean;
  nextCursor: string | null;
}

/**
 * Events grouped by date for list view
 */
export interface EventsByDate {
  date: string; // YYYY-MM-DD format
  dateLabel: string; // "Monday, January 15"
  events: CalendarEventWithCustomer[];
}

// =============================================================================
// Utility Functions
// =============================================================================

/**
 * Get colors for an event based on its type
 */
export function getEventColors(eventType: CalendarEventType): {
  background: string;
  border: string;
  text: string;
} {
  return EVENT_TYPE_COLORS[eventType] ?? EVENT_TYPE_COLORS.other;
}

/**
 * Get status styles for an event
 */
export function getStatusStyles(status: CalendarEventStatus): {
  dotColor: string;
  opacity: number;
} {
  return EVENT_STATUS_STYLES[status] ?? EVENT_STATUS_STYLES.scheduled;
}

/**
 * Transform a database event to a FullCalendar event object
 */
export function toFullCalendarEvent(event: CalendarEventWithCustomer): FullCalendarEvent {
  const colors = getEventColors(event.event_type);
  const statusStyles = getStatusStyles(event.status);

  return {
    id: event.id,
    title: event.title,
    start: event.start_datetime,
    end: event.end_datetime,
    allDay: event.all_day,
    backgroundColor: colors.background,
    borderColor: colors.border,
    textColor: colors.text,
    editable: event.status === 'scheduled', // Only scheduled events can be moved
    extendedProps: {
      eventType: event.event_type,
      status: event.status,
      description: event.description,
      customerId: event.customer_id,
      customerName: event.customer.name,
      customerPhone: event.customer.phone,
      propertyId: event.property_id,
      propertyAddress: event.property
        ? `${event.property.address_line1}, ${event.property.city}`
        : undefined,
      poolId: event.pool_id,
      poolType: event.pool?.type,
      locationUrl: event.location_url,
      version: event.version,
      statusOpacity: statusStyles.opacity,
      statusDotColor: statusStyles.dotColor,
    },
  };
}

/**
 * Transform multiple database events to FullCalendar events
 */
export function toFullCalendarEvents(events: CalendarEventWithCustomer[]): FullCalendarEvent[] {
  return events.map(toFullCalendarEvent);
}
