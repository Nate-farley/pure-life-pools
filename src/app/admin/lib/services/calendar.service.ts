/**
 * Calendar Service
 *
 * @file src/lib/services/admin/calendar.service.ts
 *
 * Service layer for all calendar event database operations.
 * Handles CRUD, date range queries, optimistic locking, and status transitions.
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import type {
  Database,
  CalendarEvent,
  Customer,
  Property,
  Pool,
  Admin,
} from '@/lib/types/database';
import type {
  CalendarEventWithCustomer,
  CalendarEventListResult,
} from '@/lib/types/admin/calendar';
import type {
  CreateCalendarEventInput,
  UpdateCalendarEventInput,
  RescheduleEventInput,
  GetEventsInRangeInput,
  ListCalendarEventsInput,
  CalendarEventStatus,
} from '@/lib/validations/admin/calendar';
import { ConflictError, NotFoundError, ValidationError } from '@/lib/utils/errors';

type DbClient = SupabaseClient<Database>;

// =============================================================================
// Service Class
// =============================================================================

export class CalendarService {
  constructor(private supabase: DbClient) {}

  // ===========================================================================
  // Create Operations
  // ===========================================================================

  /**
   * Creates a new calendar event
   *
   * @param input - Validated event data
   * @param adminId - ID of the admin creating the event
   * @returns Created event with customer info
   */
  async create(
    input: CreateCalendarEventInput,
    adminId: string
  ): Promise<CalendarEventWithCustomer> {
    // Verify customer exists
    const { data: customer, error: customerError } = await this.supabase
      .from('customers')
      .select('id, name, phone, phone_normalized')
      .eq('id', input.customerId)
      .is('deleted_at', null)
      .single();

    if (customerError || !customer) {
      throw new NotFoundError('Customer not found');
    }

    // Build insert data
    const insertData: Database['public']['Tables']['calendar_events']['Insert'] = {
      customer_id: input.customerId,
      property_id: input.propertyId ?? null,
      pool_id: input.poolId ?? null,
      title: input.title,
      description: input.description ?? null,
      event_type: input.eventType,
      start_datetime: input.startDatetime,
      end_datetime: input.endDatetime,
      all_day: input.allDay,
      location_url: input.locationUrl || null,
      created_by: adminId,
    };

    // Insert event
    const { data: event, error: insertError } = await this.supabase
      .from('calendar_events')
      .insert(insertData)
      .select(this.getSelectQuery())
      .single();

    if (insertError) {
      console.error('Failed to create calendar event:', insertError);
      throw new Error('Failed to create calendar event');
    }

    return this.transformEvent(event);
  }

  // ===========================================================================
  // Read Operations
  // ===========================================================================

  /**
   * Gets a single event by ID with all related data
   *
   * @param id - Event UUID
   * @returns Event with customer, property, and pool info
   */
  async getById(id: string): Promise<CalendarEventWithCustomer> {
    const { data, error } = await this.supabase
      .from('calendar_events')
      .select(this.getSelectQuery())
      .eq('id', id)
      .single();

    if (error || !data) {
      throw new NotFoundError('Calendar event not found');
    }

    return this.transformEvent(data);
  }

  /**
   * Gets all events within a date range (for calendar view)
   * Optimized for fetching events across month/week views
   *
   * @param input - Date range and optional filters
   * @returns Array of events for the calendar
   */
  async getInRange(input: GetEventsInRangeInput): Promise<CalendarEventWithCustomer[]> {
    let query = this.supabase
      .from('calendar_events')
      .select(this.getSelectQuery())
      .gte('start_datetime', input.start)
      .lte('start_datetime', input.end)
      .order('start_datetime', { ascending: true });

    // Apply optional filters
    if (input.customerId) {
      query = query.eq('customer_id', input.customerId);
    }

    if (input.status) {
      query = query.eq('status', input.status);
    }

    if (input.eventType) {
      query = query.eq('event_type', input.eventType);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Failed to fetch events in range:', error);
      throw new Error('Failed to fetch calendar events');
    }

    return (data ?? []).map((event) => this.transformEvent(event));
  }

  /**
   * Lists events with pagination and filters
   *
   * @param input - Pagination and filter options
   * @returns Paginated list of events
   */
  async list(input: ListCalendarEventsInput): Promise<CalendarEventListResult> {
    const limit = input.limit ?? 25;

    let query = this.supabase
      .from('calendar_events')
      .select(this.getSelectQuery())
      .order('start_datetime', { ascending: true })
      .limit(limit + 1); // Fetch one extra to detect hasMore

    // Apply filters
    if (input.customerId) {
      query = query.eq('customer_id', input.customerId);
    }

    if (input.status) {
      query = query.eq('status', input.status);
    }

    if (input.eventType) {
      query = query.eq('event_type', input.eventType);
    }

    if (input.from) {
      query = query.gte('start_datetime', input.from);
    }

    if (input.to) {
      query = query.lte('start_datetime', input.to);
    }

    // Handle cursor-based pagination
    if (input.cursor) {
      const cursorData = this.decodeCursor(input.cursor);
      if (cursorData) {
        query = query.gt('start_datetime', cursorData.datetime);
      }
    }

    const { data, error } = await query;

    if (error) {
      console.error('Failed to list calendar events:', error);
      throw new Error('Failed to list calendar events');
    }

    const events = data ?? [];
    const hasMore = events.length > limit;
    const resultEvents = hasMore ? events.slice(0, limit) : events;

    const transformedEvents = resultEvents.map((event) => this.transformEvent(event));

    return {
      events: transformedEvents,
      hasMore,
      nextCursor: hasMore && resultEvents.length > 0
        ? this.encodeCursor(resultEvents[resultEvents.length - 1])
        : null,
    };
  }

  /**
   * Gets events for a specific customer
   *
   * @param customerId - Customer UUID
   * @param options - Filter options
   * @returns Array of events
   */
  async getByCustomer(
    customerId: string,
    options: {
      status?: CalendarEventStatus;
      limit?: number;
      upcoming?: boolean;
    } = {}
  ): Promise<CalendarEventWithCustomer[]> {
    const { status, limit = 10, upcoming = true } = options;

    let query = this.supabase
      .from('calendar_events')
      .select(this.getSelectQuery())
      .eq('customer_id', customerId)
      .order('start_datetime', { ascending: upcoming })
      .limit(limit);

    if (status) {
      query = query.eq('status', status);
    }

    if (upcoming) {
      query = query.gte('start_datetime', new Date().toISOString());
    }

    const { data, error } = await query;

    if (error) {
      console.error('Failed to fetch customer events:', error);
      throw new Error('Failed to fetch customer events');
    }

    return (data ?? []).map((event) => this.transformEvent(event));
  }

  // ===========================================================================
  // Update Operations
  // ===========================================================================

  /**
   * Updates an event with optimistic locking
   *
   * @param input - Update data including version for conflict detection
   * @returns Updated event
   */
  async update(input: UpdateCalendarEventInput): Promise<CalendarEventWithCustomer> {
    // Build update data - only include fields that were provided
    const updateData: Partial<Database['public']['Tables']['calendar_events']['Update']> = {};

    if (input.customerId !== undefined) updateData.customer_id = input.customerId;
    if (input.propertyId !== undefined) updateData.property_id = input.propertyId;
    if (input.poolId !== undefined) updateData.pool_id = input.poolId;
    if (input.title !== undefined) updateData.title = input.title;
    if (input.description !== undefined) updateData.description = input.description;
    if (input.eventType !== undefined) updateData.event_type = input.eventType;
    if (input.status !== undefined) updateData.status = input.status;
    if (input.startDatetime !== undefined) updateData.start_datetime = input.startDatetime;
    if (input.endDatetime !== undefined) updateData.end_datetime = input.endDatetime;
    if (input.allDay !== undefined) updateData.all_day = input.allDay;
    if (input.locationUrl !== undefined) updateData.location_url = input.locationUrl || null;

    // Use optimistic locking - only update if version matches
    const { data, error } = await this.supabase
      .from('calendar_events')
      .update(updateData)
      .eq('id', input.id)
      .eq('version', input.version)
      .select(this.getSelectQuery())
      .single();

    if (error) {
      // Check if it's a conflict (no rows updated due to version mismatch)
      if (error.code === 'PGRST116') {
        // Check if event exists
        const { data: existing } = await this.supabase
          .from('calendar_events')
          .select('id, version')
          .eq('id', input.id)
          .single();

        if (!existing) {
          throw new NotFoundError('Calendar event not found');
        }

        // Event exists but version doesn't match - conflict
        throw new ConflictError(
          'This event was modified by another user. Please refresh and try again.'
        );
      }

      console.error('Failed to update calendar event:', error);
      throw new Error('Failed to update calendar event');
    }

    if (!data) {
      throw new ConflictError(
        'This event was modified by another user. Please refresh and try again.'
      );
    }

    return this.transformEvent(data);
  }

  /**
   * Reschedules an event (optimized for drag/drop)
   * Only updates datetime fields with optimistic locking
   *
   * @param input - New schedule with version
   * @returns Updated event
   */
  async reschedule(input: RescheduleEventInput): Promise<CalendarEventWithCustomer> {
    const updateData = {
      start_datetime: input.startDatetime,
      end_datetime: input.endDatetime,
      all_day: input.allDay ?? false,
    };

    // Use optimistic locking
    const { data, error } = await this.supabase
      .from('calendar_events')
      .update(updateData)
      .eq('id', input.id)
      .eq('version', input.version)
      .eq('status', 'scheduled') // Can only reschedule scheduled events
      .select(this.getSelectQuery())
      .single();

    if (error || !data) {
      // Check the actual state of the event
      const { data: existing } = await this.supabase
        .from('calendar_events')
        .select('id, version, status')
        .eq('id', input.id)
        .single();

      if (!existing) {
        throw new NotFoundError('Calendar event not found');
      }

      if (existing.status !== 'scheduled') {
        throw new ValidationError(
          `Cannot reschedule a ${existing.status} event. Only scheduled events can be moved.`
        );
      }

      throw new ConflictError(
        'This event was modified by another user. Please refresh and try again.'
      );
    }

    return this.transformEvent(data);
  }

  /**
   * Cancels an event
   *
   * @param id - Event UUID
   * @param version - Current version for optimistic locking
   * @returns Updated event
   */
  async cancel(id: string, version: number): Promise<CalendarEventWithCustomer> {
    const { data, error } = await this.supabase
      .from('calendar_events')
      .update({ status: 'canceled' })
      .eq('id', id)
      .eq('version', version)
      .eq('status', 'scheduled') // Can only cancel scheduled events
      .select(this.getSelectQuery())
      .single();

    if (error || !data) {
      const { data: existing } = await this.supabase
        .from('calendar_events')
        .select('id, version, status')
        .eq('id', id)
        .single();

      if (!existing) {
        throw new NotFoundError('Calendar event not found');
      }

      if (existing.status !== 'scheduled') {
        throw new ValidationError(`Cannot cancel a ${existing.status} event`);
      }

      throw new ConflictError(
        'This event was modified by another user. Please refresh and try again.'
      );
    }

    return this.transformEvent(data);
  }

  /**
   * Marks an event as completed
   *
   * @param id - Event UUID
   * @param version - Current version for optimistic locking
   * @returns Updated event
   */
  async complete(id: string, version: number): Promise<CalendarEventWithCustomer> {
    const { data, error } = await this.supabase
      .from('calendar_events')
      .update({ status: 'completed' })
      .eq('id', id)
      .eq('version', version)
      .eq('status', 'scheduled') // Can only complete scheduled events
      .select(this.getSelectQuery())
      .single();

    if (error || !data) {
      const { data: existing } = await this.supabase
        .from('calendar_events')
        .select('id, version, status')
        .eq('id', id)
        .single();

      if (!existing) {
        throw new NotFoundError('Calendar event not found');
      }

      if (existing.status !== 'scheduled') {
        throw new ValidationError(`Cannot complete a ${existing.status} event`);
      }

      throw new ConflictError(
        'This event was modified by another user. Please refresh and try again.'
      );
    }

    return this.transformEvent(data);
  }

  // ===========================================================================
  // Delete Operations
  // ===========================================================================

  /**
   * Deletes an event (hard delete)
   *
   * @param id - Event UUID
   */
  async delete(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('calendar_events')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Failed to delete calendar event:', error);
      throw new Error('Failed to delete calendar event');
    }
  }

  // ===========================================================================
  // Helper Methods
  // ===========================================================================

  /**
   * Get the select query with all relations
   */
  private getSelectQuery(): string {
    return `
      *,
      customer:customers!inner (
        id,
        name,
        phone,
        phone_normalized
      ),
      property:properties (
        id,
        address_line1,
        city,
        state
      ),
      pool:pools (
        id,
        type
      ),
      created_by_admin:admins!calendar_events_created_by_fkey (
        id,
        full_name,
        email
      )
    `;
  }

  /**
   * Transform raw database result to typed event
   */
  private transformEvent(data: Record<string, unknown>): CalendarEventWithCustomer {
    // Extract nested relations
    const customer = data.customer as Pick<Customer, 'id' | 'name' | 'phone' | 'phone_normalized'>;
    const property = data.property as Pick<Property, 'id' | 'address_line1' | 'city' | 'state'> | null;
    const pool = data.pool as Pick<Pool, 'id' | 'type'> | null;
    const createdByAdmin = data.created_by_admin as Pick<Admin, 'id' | 'full_name' | 'email'> | null;

    // Build the event object
    const event: CalendarEventWithCustomer = {
      id: data.id as string,
      customer_id: data.customer_id as string,
      property_id: data.property_id as string | null,
      pool_id: data.pool_id as string | null,
      title: data.title as string,
      description: data.description as string | null,
      event_type: data.event_type as CalendarEvent['event_type'],
      status: data.status as CalendarEvent['status'],
      start_datetime: data.start_datetime as string,
      end_datetime: data.end_datetime as string,
      all_day: data.all_day as boolean,
      location_url: data.location_url as string | null,
      reminder_24h_sent: data.reminder_24h_sent as boolean,
      reminder_2h_sent: data.reminder_2h_sent as boolean,
      created_by: data.created_by as string,
      version: data.version as number,
      created_at: data.created_at as string,
      updated_at: data.updated_at as string,
      customer,
      property,
      pool,
      created_by_admin: createdByAdmin,
    };

    return event;
  }

  /**
   * Encode a cursor for pagination
   */
  private encodeCursor(event: Record<string, unknown>): string {
    const cursorData = {
      datetime: event.start_datetime as string,
      id: event.id as string,
    };
    return Buffer.from(JSON.stringify(cursorData)).toString('base64');
  }

  /**
   * Decode a pagination cursor
   */
  private decodeCursor(cursor: string): { datetime: string; id: string } | null {
    try {
      const decoded = Buffer.from(cursor, 'base64').toString('utf-8');
      return JSON.parse(decoded);
    } catch {
      return null;
    }
  }
}
