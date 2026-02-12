/**
 * Communication Service
 *
 * @file src/lib/services/communication.service.ts
 *
 * Service layer for communication-related database operations.
 * Handles CRUD operations, full-text search, and filtering for communications.
 *
 * All methods receive a Supabase client instance for proper auth context.
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database, Communication } from '@/lib/types/database';
import type {
  CommunicationWithLogger,
  CommunicationWithCustomer,
  CommunicationListResult,
  CommunicationSearchResult,
} from '@/lib/types/communication';
import type {
  CreateCommunicationInput,
  UpdateCommunicationInput,
  ListCommunicationsInput,
  SearchCommunicationsInput,
} from '@/lib/validations/communication';

// =============================================================================
// Types
// =============================================================================

type SupabaseClientType = SupabaseClient<Database>;

interface CreateCommunicationData {
  customer_id: string;
  type: Communication['type'];
  direction: Communication['direction'];
  summary: string;
  occurred_at: string;
  logged_by: string;
}

interface UpdateCommunicationData {
  type?: Communication['type'];
  direction?: Communication['direction'];
  summary?: string;
  occurred_at?: string;
}

// =============================================================================
// Communication Service
// =============================================================================

export class CommunicationService {
  private supabase: SupabaseClientType;

  constructor(supabase: SupabaseClientType) {
    this.supabase = supabase;
  }

  // ---------------------------------------------------------------------------
  // Create
  // ---------------------------------------------------------------------------

  /**
   * Log a new communication for a customer
   *
   * @param input - Validated communication data
   * @param loggedBy - Admin ID who is logging this communication
   * @returns The created communication with logger info
   */
  async create(
    input: CreateCommunicationInput,
    loggedBy: string
  ): Promise<CommunicationWithLogger> {
    const data: CreateCommunicationData = {
      customer_id: input.customerId,
      type: input.type,
      direction: input.direction,
      summary: input.summary,
      occurred_at: input.occurredAt,
      logged_by: loggedBy,
    };

    const { data: communication, error } = await this.supabase
      .from('communications')
      .insert(data)
      .select(
        `
        *,
        logged_by_admin:admins!communications_logged_by_fkey(
          id,
          email,
          full_name
        )
      `
      )
      .single();

    if (error) {
      console.error('Failed to create communication:', error);
      throw new Error(`Failed to log communication: ${error.message}`);
    }

    return communication as CommunicationWithLogger;
  }

  // ---------------------------------------------------------------------------
  // Read
  // ---------------------------------------------------------------------------

  /**
   * Get a single communication by ID
   *
   * @param id - Communication ID
   * @returns The communication with logger info, or null if not found
   */
  async getById(id: string): Promise<CommunicationWithLogger | null> {
    const { data, error } = await this.supabase
      .from('communications')
      .select(
        `
        *,
        logged_by_admin:admins!communications_logged_by_fkey(
          id,
          email,
          full_name
        )
      `
      )
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned
        return null;
      }
      console.error('Failed to get communication:', error);
      throw new Error(`Failed to get communication: ${error.message}`);
    }

    return data as CommunicationWithLogger;
  }

  /**
   * List communications for a customer with filters and pagination
   *
   * @param input - Filter and pagination options
   * @returns Paginated list of communications
   */
  async listByCustomer(
    input: ListCommunicationsInput
  ): Promise<CommunicationListResult> {
    const { customerId, limit = 25, cursor, type, direction, search, dateFrom, dateTo } = input;

    let query = this.supabase
      .from('communications')
      .select(
        `
        *,
        logged_by_admin:admins!communications_logged_by_fkey(
          id,
          email,
          full_name
        )
      `,
        { count: 'exact' }
      )
      .eq('customer_id', customerId)
      .order('occurred_at', { ascending: false })
      .limit(limit + 1); // Fetch one extra to check if there are more

    // Apply type filter
    if (type) {
      query = query.eq('type', type);
    }

    // Apply direction filter
    if (direction) {
      query = query.eq('direction', direction);
    }

    // Apply date range filters
    if (dateFrom) {
      query = query.gte('occurred_at', dateFrom);
    }
    if (dateTo) {
      query = query.lte('occurred_at', dateTo);
    }

    // Apply full-text search
    if (search && search.trim()) {
      query = query.textSearch('search_vector', search.trim(), {
        type: 'websearch',
        config: 'english',
      });
    }

    // Apply cursor-based pagination
    if (cursor) {
      const decoded = this.decodeCursor(cursor);
      if (decoded) {
        query = query.lt('occurred_at', decoded.occurredAt);
      }
    }

    const { data, error, count } = await query;

    if (error) {
      console.error('Failed to list communications:', error);
      throw new Error(`Failed to list communications: ${error.message}`);
    }

    const items = data as CommunicationWithLogger[];
    const hasMore = items.length > limit;
    const resultItems = hasMore ? items.slice(0, limit) : items;

    // Create cursor for next page
    let nextCursor: string | null = null;
    if (hasMore && resultItems.length > 0) {
      const lastItem = resultItems[resultItems.length - 1];
      nextCursor = this.encodeCursor({
        occurredAt: lastItem.occurred_at,
        id: lastItem.id,
      });
    }

    return {
      items: resultItems,
      hasMore,
      nextCursor,
      total: count ?? undefined,
    };
  }

  /**
   * Search communications using full-text search
   *
   * @param input - Search query and options
   * @returns Search results with customer info
   */
  async search(input: SearchCommunicationsInput): Promise<CommunicationSearchResult> {
    const { customerId, query, limit = 10 } = input;

    let dbQuery = this.supabase
      .from('communications')
      .select(
        `
        *,
        customer:customers!communications_customer_id_fkey(
          id,
          name,
          phone
        ),
        logged_by_admin:admins!communications_logged_by_fkey(
          id,
          email,
          full_name
        )
      `,
        { count: 'exact' }
      )
      .textSearch('search_vector', query.trim(), {
        type: 'websearch',
        config: 'english',
      })
      .order('occurred_at', { ascending: false })
      .limit(limit);

    // Optionally filter by customer
    if (customerId) {
      dbQuery = dbQuery.eq('customer_id', customerId);
    }

    const { data, error, count } = await dbQuery;

    if (error) {
      console.error('Failed to search communications:', error);
      throw new Error(`Failed to search communications: ${error.message}`);
    }

    return {
      items: data as CommunicationWithCustomer[],
      total: count ?? 0,
    };
  }

  // ---------------------------------------------------------------------------
  // Update
  // ---------------------------------------------------------------------------

  /**
   * Update an existing communication
   *
   * @param input - Communication ID and fields to update
   * @returns The updated communication
   */
  async update(input: UpdateCommunicationInput): Promise<CommunicationWithLogger> {
    const { id, ...fields } = input;

    // Build update data object with only provided fields
    const data: UpdateCommunicationData = {};
    if (fields.type !== undefined) data.type = fields.type;
    if (fields.direction !== undefined) data.direction = fields.direction;
    if (fields.summary !== undefined) data.summary = fields.summary;
    if (fields.occurredAt !== undefined) data.occurred_at = fields.occurredAt;

    const { data: communication, error } = await this.supabase
      .from('communications')
      .update(data)
      .eq('id', id)
      .select(
        `
        *,
        logged_by_admin:admins!communications_logged_by_fkey(
          id,
          email,
          full_name
        )
      `
      )
      .single();

    if (error) {
      console.error('Failed to update communication:', error);
      throw new Error(`Failed to update communication: ${error.message}`);
    }

    return communication as CommunicationWithLogger;
  }

  // ---------------------------------------------------------------------------
  // Delete
  // ---------------------------------------------------------------------------

  /**
   * Delete a communication (hard delete)
   *
   * @param id - Communication ID to delete
   * @returns True if deleted successfully
   */
  async delete(id: string): Promise<boolean> {
    const { error } = await this.supabase
      .from('communications')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Failed to delete communication:', error);
      throw new Error(`Failed to delete communication: ${error.message}`);
    }

    return true;
  }

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------

  /**
   * Encode pagination cursor
   */
  private encodeCursor(data: { occurredAt: string; id: string }): string {
    return Buffer.from(JSON.stringify(data)).toString('base64');
  }

  /**
   * Decode pagination cursor
   */
  private decodeCursor(cursor: string): { occurredAt: string; id: string } | null {
    try {
      const decoded = Buffer.from(cursor, 'base64').toString('utf-8');
      return JSON.parse(decoded);
    } catch {
      return null;
    }
  }

  /**
   * Get communication statistics for a customer
   *
   * @param customerId - Customer ID
   * @returns Communication counts by type
   */
  async getStats(customerId: string): Promise<{
    total: number;
    byType: Record<Communication['type'], number>;
    byDirection: Record<Communication['direction'], number>;
  }> {
    const { data, error } = await this.supabase
      .from('communications')
      .select('type, direction')
      .eq('customer_id', customerId);

    if (error) {
      console.error('Failed to get communication stats:', error);
      throw new Error(`Failed to get communication stats: ${error.message}`);
    }

    const byType: Record<Communication['type'], number> = {
      call: 0,
      text: 0,
      email: 0,
    };
    const byDirection: Record<Communication['direction'], number> = {
      inbound: 0,
      outbound: 0,
    };

    for (const comm of data) {
      byType[comm.type]++;
      byDirection[comm.direction]++;
    }

    return {
      total: data.length,
      byType,
      byDirection,
    };
  }
}
