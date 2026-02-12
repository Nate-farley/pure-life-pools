/**
 * Calendar Server Actions
 *
 * @file src/app/actions/admin/calendar.ts
 *
 * Server actions for all calendar event operations.
 * These actions validate input, authenticate the user, and delegate to the service layer.
 */

'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { CalendarService } from '@/lib/services/calendar.service';
import { getCurrentAdmin } from '@/app/actions/auth';
import type { ActionResult } from '@/lib/types/api';
import type { CalendarEventWithCustomer, CalendarEventListResult } from '@/lib/types/calendar';
import {
  createCalendarEventSchema,
  updateCalendarEventSchema,
  rescheduleEventSchema,
  cancelEventSchema,
  completeEventSchema,
  getEventsInRangeSchema,
  listCalendarEventsSchema,
  deleteCalendarEventSchema,
  type CreateCalendarEventInput,
  type UpdateCalendarEventInput,
  type RescheduleEventInput,
  type GetEventsInRangeInput,
  type ListCalendarEventsInput,
} from '@/lib/validations/calendar';

// =============================================================================
// Create Event
// =============================================================================

/**
 * Creates a new calendar event
 *
 * @param input - Event data
 * @returns Created event or error
 */
export async function createCalendarEvent(
  input: CreateCalendarEventInput
): Promise<ActionResult<CalendarEventWithCustomer>> {
  try {
    // Validate input
    const validated = createCalendarEventSchema.parse(input);

    // Get authenticated admin
    const { admin, supabase } = await getCurrentAdmin();

    // Create event via service
    const service = new CalendarService(supabase);
    const event = await service.create(validated, admin.id);

    // Revalidate calendar and customer pages
    revalidatePath('/admin/calendar');
    revalidatePath(`/admin/customers/${validated.customerId}`);

    return { success: true, data: event };
  } catch (error) {
    console.error('Failed to create calendar event:', error);

    if (error instanceof Error) {
      return { success: false, error: error.message };
    }

    return { success: false, error: 'Failed to create calendar event' };
  }
}

// =============================================================================
// Read Operations
// =============================================================================

/**
 * Gets a single calendar event by ID
 *
 * @param id - Event UUID
 * @returns Event or error
 */
export async function getCalendarEvent(
  id: string
): Promise<ActionResult<CalendarEventWithCustomer>> {
  try {
    // Get authenticated admin
    const { supabase } = await getCurrentAdmin();

    // Fetch event via service
    const service = new CalendarService(supabase);
    const event = await service.getById(id);

    return { success: true, data: event };
  } catch (error) {
    console.error('Failed to get calendar event:', error);

    if (error instanceof Error) {
      return { success: false, error: error.message };
    }

    return { success: false, error: 'Failed to get calendar event' };
  }
}

/**
 * Gets events within a date range (for calendar view)
 *
 * @param input - Date range and optional filters
 * @returns Array of events or error
 */
export async function getEventsInRange(
  input: GetEventsInRangeInput
): Promise<ActionResult<CalendarEventWithCustomer[]>> {
  try {
    // Validate input
    const validated = getEventsInRangeSchema.parse(input);

    // Get authenticated admin
    const { supabase } = await getCurrentAdmin();

    // Fetch events via service
    const service = new CalendarService(supabase);
    const events = await service.getInRange(validated);

    return { success: true, data: events };
  } catch (error) {
    console.error('Failed to get events in range:', error);

    if (error instanceof Error) {
      return { success: false, error: error.message };
    }

    return { success: false, error: 'Failed to get calendar events' };
  }
}

/**
 * Lists calendar events with pagination and filters
 *
 * @param input - Pagination and filter options
 * @returns Paginated list of events or error
 */
export async function listCalendarEvents(
  input: ListCalendarEventsInput = {}
): Promise<ActionResult<CalendarEventListResult>> {
  try {
    // Validate input
    const validated = listCalendarEventsSchema.parse(input);

    // Get authenticated admin
    const { supabase } = await getCurrentAdmin();

    // Fetch events via service
    const service = new CalendarService(supabase);
    const result = await service.list(validated);

    return { success: true, data: result };
  } catch (error) {
    console.error('Failed to list calendar events:', error);

    if (error instanceof Error) {
      return { success: false, error: error.message };
    }

    return { success: false, error: 'Failed to list calendar events' };
  }
}

/**
 * Gets upcoming events for a specific customer
 *
 * @param customerId - Customer UUID
 * @param limit - Maximum number of events to return
 * @returns Array of events or error
 */
export async function getCustomerEvents(
  customerId: string,
  limit: number = 5
): Promise<ActionResult<CalendarEventWithCustomer[]>> {
  try {
    // Get authenticated admin
    const { supabase } = await getCurrentAdmin();

    // Fetch events via service
    const service = new CalendarService(supabase);
    const events = await service.getByCustomer(customerId, {
      limit,
      upcoming: true,
    });

    return { success: true, data: events };
  } catch (error) {
    console.error('Failed to get customer events:', error);

    if (error instanceof Error) {
      return { success: false, error: error.message };
    }

    return { success: false, error: 'Failed to get customer events' };
  }
}

// =============================================================================
// Update Operations
// =============================================================================

/**
 * Updates a calendar event
 *
 * @param input - Update data with version for optimistic locking
 * @returns Updated event or error
 */
export async function updateCalendarEvent(
  input: UpdateCalendarEventInput
): Promise<ActionResult<CalendarEventWithCustomer>> {
  try {
    // Validate input
    const validated = updateCalendarEventSchema.parse(input);

    // Get authenticated admin
    const { supabase } = await getCurrentAdmin();

    // Update event via service
    const service = new CalendarService(supabase);
    const event = await service.update(validated);

    // Revalidate calendar and customer pages
    revalidatePath('/admin/calendar');
    revalidatePath(`/admin/customers/${event.customer_id}`);

    return { success: true, data: event };
  } catch (error) {
    console.error('Failed to update calendar event:', error);

    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
        code: error.name === 'ConflictError' ? 'CONFLICT' : undefined,
      };
    }

    return { success: false, error: 'Failed to update calendar event' };
  }
}

/**
 * Reschedules a calendar event (optimized for drag/drop)
 *
 * @param input - New schedule with version for optimistic locking
 * @returns Updated event or error
 */
export async function rescheduleCalendarEvent(
  input: RescheduleEventInput
): Promise<ActionResult<CalendarEventWithCustomer>> {
  try {
    // Validate input
    const validated = rescheduleEventSchema.parse(input);

    // Get authenticated admin
    const { supabase } = await getCurrentAdmin();

    // Reschedule event via service
    const service = new CalendarService(supabase);
    const event = await service.reschedule(validated);

    // Revalidate calendar page
    revalidatePath('/admin/calendar');
    revalidatePath(`/admin/customers/${event.customer_id}`);

    return { success: true, data: event };
  } catch (error) {
    console.error('Failed to reschedule calendar event:', error);

    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
        code: error.name === 'ConflictError' ? 'CONFLICT' : undefined,
      };
    }

    return { success: false, error: 'Failed to reschedule calendar event' };
  }
}

/**
 * Cancels a calendar event
 *
 * @param id - Event UUID
 * @param version - Current version for optimistic locking
 * @returns Updated event or error
 */
export async function cancelCalendarEvent(
  id: string,
  version: number
): Promise<ActionResult<CalendarEventWithCustomer>> {
  try {
    // Validate input
    cancelEventSchema.parse({ id, version });

    // Get authenticated admin
    const { supabase } = await getCurrentAdmin();

    // Cancel event via service
    const service = new CalendarService(supabase);
    const event = await service.cancel(id, version);

    // Revalidate calendar page
    revalidatePath('/admin/calendar');
    revalidatePath(`/admin/customers/${event.customer_id}`);

    return { success: true, data: event };
  } catch (error) {
    console.error('Failed to cancel calendar event:', error);

    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
        code: error.name === 'ConflictError' ? 'CONFLICT' : undefined,
      };
    }

    return { success: false, error: 'Failed to cancel calendar event' };
  }
}

/**
 * Marks a calendar event as completed
 *
 * @param id - Event UUID
 * @param version - Current version for optimistic locking
 * @returns Updated event or error
 */
export async function completeCalendarEvent(
  id: string,
  version: number
): Promise<ActionResult<CalendarEventWithCustomer>> {
  try {
    // Validate input
    completeEventSchema.parse({ id, version });

    // Get authenticated admin
    const { supabase } = await getCurrentAdmin();

    // Complete event via service
    const service = new CalendarService(supabase);
    const event = await service.complete(id, version);

    // Revalidate calendar page
    revalidatePath('/admin/calendar');
    revalidatePath(`/admin/customers/${event.customer_id}`);

    return { success: true, data: event };
  } catch (error) {
    console.error('Failed to complete calendar event:', error);

    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
        code: error.name === 'ConflictError' ? 'CONFLICT' : undefined,
      };
    }

    return { success: false, error: 'Failed to complete calendar event' };
  }
}

// =============================================================================
// Delete Operations
// =============================================================================

/**
 * Deletes a calendar event (hard delete)
 *
 * @param id - Event UUID
 * @returns Success or error
 */
export async function deleteCalendarEvent(
  id: string
): Promise<ActionResult<{ deleted: true }>> {
  try {
    // Validate input
    deleteCalendarEventSchema.parse({ id });

    // Get authenticated admin
    const { supabase } = await getCurrentAdmin();

    // Get event to know which customer page to revalidate
    const service = new CalendarService(supabase);
    const event = await service.getById(id);
    const customerId = event.customer_id;

    // Delete event via service
    await service.delete(id);

    // Revalidate calendar and customer pages
    revalidatePath('/admin/calendar');
    revalidatePath(`/admin/customers/${customerId}`);

    return { success: true, data: { deleted: true } };
  } catch (error) {
    console.error('Failed to delete calendar event:', error);

    if (error instanceof Error) {
      return { success: false, error: error.message };
    }

    return { success: false, error: 'Failed to delete calendar event' };
  }
}
