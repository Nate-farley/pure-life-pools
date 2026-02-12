/**
 * Calendar Event Validation Schemas
 *
 * @file src/lib/validations/admin/calendar.ts
 *
 * Zod schemas for calendar event operations.
 * These are the source of truth for both runtime validation and TypeScript types.
 */

import { z } from 'zod';

// =============================================================================
// Constants
// =============================================================================

/**
 * Calendar event types
 */
export const CALENDAR_EVENT_TYPES = [
  'consultation',
  'estimate_visit',
  'follow_up',
  'other',
] as const;

export type CalendarEventType = (typeof CALENDAR_EVENT_TYPES)[number];

/**
 * Calendar event statuses
 */
export const CALENDAR_EVENT_STATUSES = [
  'scheduled',
  'completed',
  'canceled',
] as const;

export type CalendarEventStatus = (typeof CALENDAR_EVENT_STATUSES)[number];

/**
 * Event type options for UI select components
 */
export const eventTypeOptions: Array<{ value: CalendarEventType; label: string }> = [
  { value: 'consultation', label: 'Consultation' },
  { value: 'estimate_visit', label: 'Estimate Visit' },
  { value: 'follow_up', label: 'Follow Up' },
  { value: 'other', label: 'Other' },
];

/**
 * Event status options for UI select components
 */
export const eventStatusOptions: Array<{ value: CalendarEventStatus; label: string }> = [
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'completed', label: 'Completed' },
  { value: 'canceled', label: 'Canceled' },
];

// =============================================================================
// Base Schemas
// =============================================================================

/**
 * UUID validation schema
 */
const uuidSchema = z.string().uuid('Invalid UUID format');

/**
 * ISO datetime string validation
 */
const datetimeSchema = z.string().refine(
  (val) => {
    const date = new Date(val);
    return !isNaN(date.getTime());
  },
  { message: 'Invalid datetime format' }
);

// =============================================================================
// Create Event Schema
// =============================================================================

/**
 * Schema for creating a new calendar event
 */
export const createCalendarEventSchema = z
  .object({
    customerId: uuidSchema.describe('Customer UUID'),
    propertyId: uuidSchema.optional().nullable().describe('Optional property UUID'),
    poolId: uuidSchema.optional().nullable().describe('Optional pool UUID'),
    title: z
      .string()
      .min(1, 'Title is required')
      .max(200, 'Title must be 200 characters or less')
      .trim(),
    description: z
      .string()
      .max(2000, 'Description must be 2000 characters or less')
      .trim()
      .optional()
      .nullable(),
    eventType: z.enum(CALENDAR_EVENT_TYPES, {
      errorMap: () => ({ message: 'Invalid event type' }),
    }),
    startDatetime: datetimeSchema.describe('Event start time (ISO 8601)'),
    endDatetime: datetimeSchema.describe('Event end time (ISO 8601)'),
    allDay: z.boolean().default(false),
    locationUrl: z
      .string()
      .url('Invalid URL format')
      .optional()
      .nullable()
      .or(z.literal('')),
  })
  .refine(
    (data) => {
      const start = new Date(data.startDatetime);
      const end = new Date(data.endDatetime);
      return end > start;
    },
    {
      message: 'End time must be after start time',
      path: ['endDatetime'],
    }
  );

export type CreateCalendarEventInput = z.infer<typeof createCalendarEventSchema>;

// =============================================================================
// Update Event Schema
// =============================================================================

/**
 * Schema for updating an existing calendar event
 */
export const updateCalendarEventSchema = z
  .object({
    id: uuidSchema,
    version: z.number().int().positive('Version must be a positive integer'),
    customerId: uuidSchema.optional(),
    propertyId: uuidSchema.optional().nullable(),
    poolId: uuidSchema.optional().nullable(),
    title: z
      .string()
      .min(1, 'Title is required')
      .max(200, 'Title must be 200 characters or less')
      .trim()
      .optional(),
    description: z
      .string()
      .max(2000, 'Description must be 2000 characters or less')
      .trim()
      .optional()
      .nullable(),
    eventType: z.enum(CALENDAR_EVENT_TYPES).optional(),
    status: z.enum(CALENDAR_EVENT_STATUSES).optional(),
    startDatetime: datetimeSchema.optional(),
    endDatetime: datetimeSchema.optional(),
    allDay: z.boolean().optional(),
    locationUrl: z.string().url('Invalid URL format').optional().nullable().or(z.literal('')),
  })
  .refine(
    (data) => {
      // Only validate datetime relationship if both are provided
      if (data.startDatetime && data.endDatetime) {
        const start = new Date(data.startDatetime);
        const end = new Date(data.endDatetime);
        return end > start;
      }
      return true;
    },
    {
      message: 'End time must be after start time',
      path: ['endDatetime'],
    }
  );

export type UpdateCalendarEventInput = z.infer<typeof updateCalendarEventSchema>;

// =============================================================================
// Reschedule Event Schema
// =============================================================================

/**
 * Schema for rescheduling an event (optimized for drag/drop)
 */
export const rescheduleEventSchema = z
  .object({
    id: uuidSchema,
    version: z.number().int().positive('Version must be a positive integer'),
    startDatetime: datetimeSchema,
    endDatetime: datetimeSchema,
    allDay: z.boolean().optional(),
  })
  .refine(
    (data) => {
      const start = new Date(data.startDatetime);
      const end = new Date(data.endDatetime);
      return end > start;
    },
    {
      message: 'End time must be after start time',
      path: ['endDatetime'],
    }
  );

export type RescheduleEventInput = z.infer<typeof rescheduleEventSchema>;

// =============================================================================
// Cancel/Complete Event Schema
// =============================================================================

/**
 * Schema for canceling an event
 */
export const cancelEventSchema = z.object({
  id: uuidSchema,
  version: z.number().int().positive('Version must be a positive integer'),
});

export type CancelEventInput = z.infer<typeof cancelEventSchema>;

/**
 * Schema for completing an event
 */
export const completeEventSchema = z.object({
  id: uuidSchema,
  version: z.number().int().positive('Version must be a positive integer'),
});

export type CompleteEventInput = z.infer<typeof completeEventSchema>;

// =============================================================================
// List/Query Schemas
// =============================================================================

/**
 * Schema for fetching events in a date range (calendar view)
 */
export const getEventsInRangeSchema = z.object({
  start: datetimeSchema.describe('Start of date range (inclusive)'),
  end: datetimeSchema.describe('End of date range (inclusive)'),
  customerId: uuidSchema.optional().describe('Filter by customer'),
  status: z.enum(CALENDAR_EVENT_STATUSES).optional(),
  eventType: z.enum(CALENDAR_EVENT_TYPES).optional(),
});

export type GetEventsInRangeInput = z.infer<typeof getEventsInRangeSchema>;

/**
 * Schema for listing events with pagination
 */
export const listCalendarEventsSchema = z.object({
  customerId: uuidSchema.optional(),
  status: z.enum(CALENDAR_EVENT_STATUSES).optional(),
  eventType: z.enum(CALENDAR_EVENT_TYPES).optional(),
  from: datetimeSchema.optional(),
  to: datetimeSchema.optional(),
  limit: z.number().int().min(1).max(100).default(25),
  cursor: z.string().optional().nullable(),
});

export type ListCalendarEventsInput = z.infer<typeof listCalendarEventsSchema>;

/**
 * Schema for getting a single event by ID
 */
export const getCalendarEventSchema = z.object({
  id: uuidSchema,
});

export type GetCalendarEventInput = z.infer<typeof getCalendarEventSchema>;

/**
 * Schema for deleting an event
 */
export const deleteCalendarEventSchema = z.object({
  id: uuidSchema,
});

export type DeleteCalendarEventInput = z.infer<typeof deleteCalendarEventSchema>;

// =============================================================================
// Utility Functions
// =============================================================================

/**
 * Get the display label for an event type
 */
export function getEventTypeLabel(type: CalendarEventType): string {
  const option = eventTypeOptions.find((o) => o.value === type);
  return option?.label ?? type;
}

/**
 * Get the display label for an event status
 */
export function getEventStatusLabel(status: CalendarEventStatus): string {
  const option = eventStatusOptions.find((o) => o.value === status);
  return option?.label ?? status;
}

/**
 * Check if a status transition is valid
 */
export function isValidStatusTransition(
  currentStatus: CalendarEventStatus,
  newStatus: CalendarEventStatus
): boolean {
  const validTransitions: Record<CalendarEventStatus, CalendarEventStatus[]> = {
    scheduled: ['completed', 'canceled'],
    completed: [], // Terminal state
    canceled: ['scheduled'], // Can reopen
  };

  return validTransitions[currentStatus]?.includes(newStatus) ?? false;
}
