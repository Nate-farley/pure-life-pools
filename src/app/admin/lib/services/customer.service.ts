/**
 * Customer Service
 *
 * Service layer for all customer-related database operations.
 * This service encapsulates business logic and database queries,
 * keeping server actions thin and focused on request handling.
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import type { Customer, Database } from '@/lib/types/database';
import { normalizePhone, extractDigits } from '@/lib/utils/phone';
import type {
  CustomerWithDetails,
  CustomerSummary,
  CustomerListResult,
  CustomerListOptions,
  DuplicateCustomerResult,
} from '@/lib/types/customer';


type SupabaseClientType = SupabaseClient<Database>;
type DbClient = SupabaseClient<Database>;


interface CreateCustomerData {
  phone: string;
  phone_normalized: string;
  name: string;
  email?: string | null;
  source?: string | null;
  created_by?: string | null;
}

interface UpdateCustomerData {
  phone?: string;
  phone_normalized?: string;
  name?: string;
  email?: string | null;
  source?: string | null;
}

interface ListCustomersParams {
  limit?: number;
  cursor?: string | null;
  search?: string;
  tags?: string[];
  source?: string;
  includeDeleted?: boolean;
}

interface ListCustomersResult {
  items: Customer[];
  hasMore: boolean;
  nextCursor: string | null;
}

export class CustomerService {
  constructor(private supabase: DbClient) {}

  /**
   * Checks if a phone number already exists in the system.
   *
   * @param phone - Phone number to check
   * @param excludeId - Optional customer ID to exclude (for updates)
   * @returns Existing customer info or null
   */
  async checkDuplicatePhone(
    phone: string,
    excludeId?: string
  ): Promise<DuplicateCustomerResult | null> {
    const phoneNormalized = normalizePhone(phone);

    let query = this.supabase
      .from('customers')
      .select('id, name, phone, email')
      .eq('phone_normalized', phoneNormalized)
      .is('deleted_at', null)
      .limit(1);

    if (excludeId) {
      query = query.neq('id', excludeId);
    }

    const { data, error } = await query.maybeSingle();

    if (error) {
      console.error('Error checking duplicate phone:', error);
      return null;
    }

    return data;
  }

  /**
   * Global search for customers by phone or name.
   *
   * This is optimized for the header search dropdown:
   * - Fast, limited results
   * - Searches both phone (digits) and name (pattern)
   *
   * @param query - Search query string
   * @param limit - Maximum results to return
   * @returns Array of matching customer summaries
   */
  async globalSearch(
    query: string,
    limit: number = 10
  ): Promise<CustomerSummary[]> {
    const trimmedQuery = query.trim();
    if (!trimmedQuery || trimmedQuery.length < 2) {
      return [];
    }

    const digitsOnly = extractDigits(trimmedQuery);

    // If query looks like a phone number (4+ digits), search phone_normalized
    if (digitsOnly.length >= 4) {
      const { data: customers } = await this.supabase
        .from('customers')
        .select('id, name, phone, phone_normalized, email, source, created_at')
        .is('deleted_at', null)
        .ilike('phone_normalized', `%${digitsOnly}%`)
        .order('name', { ascending: true })
        .limit(limit);

      return customers ?? [];
    }

    // Otherwise search by name, also check if any part matches phone
    const { data: customers } = await this.supabase
      .from('customers')
      .select('id, name, phone, phone_normalized, email, source, created_at')
      .is('deleted_at', null)
      .or(`name.ilike.%${trimmedQuery}%,phone.ilike.%${trimmedQuery}%`)
      .order('name', { ascending: true })
      .limit(limit);

    return customers ?? [];
  }

  /**
   * Gets total customer count.
   *
   * @param includeDeleted - Whether to include soft-deleted customers
   * @returns Customer count
   */
  async getCount(includeDeleted: boolean = false): Promise<number> {
    let query = this.supabase
      .from('customers')
      .select('*', { count: 'exact', head: true });

    if (!includeDeleted) {
      query = query.is('deleted_at', null);
    }

    const { count } = await query;
    return count ?? 0;
  }


  /**
   * Create a new customer
   */
  async create(
    input: {
      phone: string;
      name: string;
      email?: string | null;
      source?: string | null;
    },
    createdBy?: string
  ): Promise<Customer> {
    const data: CreateCustomerData = {
      phone: input.phone,
      phone_normalized: normalizePhone(input.phone),
      name: input.name,
      email: input.email || null,
      source: input.source || null,
      created_by: createdBy || null,
    };

    const { data: customer, error } = await this.supabase
      .from('customers')
      .insert(data)
      .select()
      .single();

    if (error) {
      console.error('Failed to create customer:', error);
      throw new Error(`Failed to create customer: ${error.message}`);
    }

    return customer;
  }

  // ---------------------------------------------------------------------------
  // Read
  // ---------------------------------------------------------------------------

  /**
   * Get a customer by ID with all related data
   */
  async getById(id: string): Promise<CustomerWithDetails | null> {
    // Fetch customer with tags
    const { data: customer, error: customerError } = await this.supabase
      .from('customers')
      .select(
        `
        *,
        tags:customer_tag_links(
          tag:customer_tags(*)
        )
      `
      )
      .eq('id', id)
      .is('deleted_at', null)
      .single();

    if (customerError) {
      if (customerError.code === 'PGRST116') {
        return null;
      }
      console.error('Failed to get customer:', customerError);
      throw new Error(`Failed to get customer: ${customerError.message}`);
    }

    // Fetch related entities in parallel
    const [propertiesResult, communicationsResult, estimatesResult, notesResult] =
      await Promise.all([
        // Properties with pools
        this.supabase
          .from('properties')
          .select('*, pool:pools(*)')
          .eq('customer_id', id)
          .order('created_at', { ascending: false }),

        // Communications with logger info
        this.supabase
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
          .eq('customer_id', id)
          .order('occurred_at', { ascending: false })
          .limit(50),

        // Estimates
        this.supabase
          .from('estimates')
          .select('*')
          .eq('customer_id', id)
          .order('created_at', { ascending: false })
          .limit(50),

        // Notes with author info
        this.supabase
          .from('customer_notes')
          .select(
            `
            *,
            author:admins!customer_notes_created_by_fkey(
              id,
              email,
              full_name
            )
          `
          )
          .eq('customer_id', id)
          .order('created_at', { ascending: false })
          .limit(50),
      ]);

    // Transform tags from nested structure
    const tags = customer.tags?.map((link: any) => link.tag).filter(Boolean) ?? [];

    return {
      ...customer,
      tags,
      properties: propertiesResult.data ?? [],
      communications: communicationsResult.data ?? [],
      estimates: estimatesResult.data ?? [],
      notes: notesResult.data ?? [],
    } as CustomerWithDetails;
  }

  /**
   * List customers with pagination and filters
   */
  async list(params: ListCustomersParams = {}): Promise<ListCustomersResult> {
    const { limit = 25, cursor, search, tags, source, includeDeleted = false } = params;

    let query = this.supabase
      .from('customers')
      .select('*', { count: 'exact' })
      .order('updated_at', { ascending: false })
      .limit(limit + 1);

    // Filter deleted
    if (!includeDeleted) {
      query = query.is('deleted_at', null);
    }

    // Search by phone or name
    if (search) {
      const normalized = normalizePhone(search);
      if (normalized.length >= 4) {
        // Phone search
        query = query.ilike('phone_normalized', `%${normalized.slice(-10)}%`);
      } else {
        // Name search
        query = query.ilike('name', `%${search}%`);
      }
    }

    // Filter by source
    if (source) {
      query = query.eq('source', source);
    }

    // Cursor pagination
    if (cursor) {
      const decoded = this.decodeCursor(cursor);
      if (decoded) {
        query = query.lt('updated_at', decoded.updatedAt);
      }
    }

    const { data, error } = await query;

    if (error) {
      console.error('Failed to list customers:', error);
      throw new Error(`Failed to list customers: ${error.message}`);
    }

    const items = data ?? [];
    const hasMore = items.length > limit;
    const resultItems = hasMore ? items.slice(0, limit) : items;

    let nextCursor: string | null = null;
    if (hasMore && resultItems.length > 0) {
      const lastItem = resultItems[resultItems.length - 1];
      nextCursor = this.encodeCursor({
        updatedAt: lastItem.updated_at,
        id: lastItem.id,
      });
    }

    return {
      items: resultItems,
      hasMore,
      nextCursor,
    };
  }

  /**
   * Search customers by phone or name
   */
  async search(query: string, limit = 10): Promise<Customer[]> {
    console.log(query)
    const normalized = normalizePhone(query);
    console.log(query)
    const isPhoneSearch = /^\d+$/.test(query.replace(/[\s\-().+]/g, ''));

    let dbQuery = this.supabase
      .from('customers')
      .select('*')
      .is('deleted_at', null)
      .limit(limit);

    if (isPhoneSearch && normalized.length >= 4) {
      // Phone number search - use normalized phone
      dbQuery = dbQuery.ilike('phone_normalized', `%${normalized.slice(-10)}%`);
    } else {
      // Name search - use trigram similarity
      dbQuery = dbQuery.ilike('name', `%${query}%`);
    }

    const { data, error } = await dbQuery;

    if (error) {
      console.error('Failed to search customers:', error);
      throw new Error(`Failed to search customers: ${error.message}`);
    }

    return data ?? [];
  }

  /**
   * Check if phone number already exists
   */
  async checkPhoneExists(phone: string, excludeId?: string): Promise<boolean> {
    const normalized = normalizePhone(phone);

    let query = this.supabase
      .from('customers')
      .select('id')
      .eq('phone_normalized', normalized)
      .is('deleted_at', null)
      .limit(1);

    if (excludeId) {
      query = query.neq('id', excludeId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Failed to check phone exists:', error);
      throw new Error(`Failed to check phone exists: ${error.message}`);
    }

    return (data?.length ?? 0) > 0;
  }

  // ---------------------------------------------------------------------------
  // Update
  // ---------------------------------------------------------------------------

  /**
   * Update a customer
   */
  async update(
    id: string,
    input: {
      phone?: string;
      name?: string;
      email?: string | null;
      source?: string | null;
    }
  ): Promise<Customer> {
    const data: UpdateCustomerData = {};

    if (input.phone !== undefined) {
      data.phone = input.phone;
      data.phone_normalized = normalizePhone(input.phone);
    }
    if (input.name !== undefined) {
      data.name = input.name;
    }
    if (input.email !== undefined) {
      data.email = input.email;
    }
    if (input.source !== undefined) {
      data.source = input.source;
    }

    const { data: customer, error } = await this.supabase
      .from('customers')
      .update(data)
      .eq('id', id)
      .is('deleted_at', null)
      .select()
      .single();

    if (error) {
      console.error('Failed to update customer:', error);
      throw new Error(`Failed to update customer: ${error.message}`);
    }

    return customer;
  }

  // ---------------------------------------------------------------------------
  // Delete
  // ---------------------------------------------------------------------------

  /**
   * Soft delete a customer
   */
  async delete(id: string): Promise<boolean> {
    const { error } = await this.supabase
      .from('customers')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
      .is('deleted_at', null);

    if (error) {
      console.error('Failed to delete customer:', error);
      throw new Error(`Failed to delete customer: ${error.message}`);
    }

    return true;
  }

  /**
   * Restore a soft-deleted customer
   */
  async restore(id: string): Promise<Customer> {
    const { data: customer, error } = await this.supabase
      .from('customers')
      .update({ deleted_at: null })
      .eq('id', id)
      .not('deleted_at', 'is', null)
      .select()
      .single();

    if (error) {
      console.error('Failed to restore customer:', error);
      throw new Error(`Failed to restore customer: ${error.message}`);
    }

    return customer;
  }

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------

  private encodeCursor(data: { updatedAt: string; id: string }): string {
    return Buffer.from(JSON.stringify(data)).toString('base64');
  }

  private decodeCursor(cursor: string): { updatedAt: string; id: string } | null {
    try {
      const decoded = Buffer.from(cursor, 'base64').toString('utf-8');
      return JSON.parse(decoded);
    } catch {
      return null;
    }
  }
}
