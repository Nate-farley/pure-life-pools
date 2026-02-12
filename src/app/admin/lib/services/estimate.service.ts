/**
 * Estimate Service
 *
 * Service layer for all estimate-related database operations.
 * Handles CRUD operations for estimates with line items and totals calculation.
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database, Estimate, EstimateStatus, EstimateLineItem } from '@/lib/types/database';
import type {
  EstimateWithDetails,
  EstimateSummary,
} from '@/lib/types/estimate';
import type {
  CreateEstimateInput,
  UpdateEstimateInput,
  LineItem,
  LineItemInput,
} from '@/lib/validations/estimate';
import {
  isValidStatusTransition,
  calculateEstimateTotals,
  calculateLineItemTotal,
} from '@/lib/validations/estimate';

type DbClient = SupabaseClient<Database>;

/**
 * Estimate with customer information
 */
export interface EstimateWithCustomer extends Estimate {
  customer: {
    id: string;
    name: string;
    phone: string;
    email: string | null;
  };
  pool?: {
    id: string;
    type: string;
    property: {
      id: string;
      address_line1: string;
      city: string;
      state: string;
    };
  } | null;
}

/**
 * Estimate list result with pagination info
 */
export interface EstimateListResult {
  estimates: EstimateWithCustomer[];
  hasMore: boolean;
  nextCursor: string | null;
}

/**
 * Options for listing estimates
 */
export interface EstimateListOptions {
  limit?: number;
  cursor?: string;
  customerId?: string;
  status?: EstimateStatus;
  search?: string;
}

export class EstimateService {
  constructor(private supabase: DbClient) {}

  /**
   * Creates a new estimate.
   *
   * @param input - Estimate creation data
   * @param adminId - ID of the admin creating the estimate
   * @returns Created estimate with customer info
   */
  async create(
    input: {
      customerId: string;
      poolId?: string | null;
      lineItems: LineItemInput[];
      taxRate?: number;
      notes?: string | null;
      validUntil?: string | null;
    },
    adminId: string
  ): Promise<EstimateWithCustomer> {
    // Generate estimate number
    const estimateNumber = await this.generateEstimateNumber();

    // Calculate line items with totals
    const lineItemsWithTotals: EstimateLineItem[] = input.lineItems.map((item) => ({
      id: item.id,
      description: item.description,
      quantity: item.quantity,
      unit_price_cents: item.unitPriceCents,
      total_cents: calculateLineItemTotal(item.quantity, item.unitPriceCents),
    }));

    // Calculate estimate totals
    const { subtotalCents, taxAmountCents, totalCents } = calculateEstimateTotals(
      input.lineItems.map((item) => ({
        quantity: item.quantity,
        unitPriceCents: item.unitPriceCents,
      })),
      input.taxRate ?? 0
    );

    const { data, error } = await this.supabase
      .from('estimates')
      .insert({
        estimate_number: estimateNumber,
        customer_id: input.customerId,
        pool_id: input.poolId ?? null,
        status: 'draft',
        line_items: lineItemsWithTotals as any,
        subtotal_cents: subtotalCents,
        tax_rate: input.taxRate ?? 0,
        tax_amount_cents: taxAmountCents,
        total_cents: totalCents,
        notes: input.notes ?? null,
        valid_until: input.validUntil ?? null,
        created_by: adminId,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating estimate:', error);
      throw new Error(`Failed to create estimate: ${error.message}`);
    }

    // Fetch with customer info
    return this.getById(data.id) as Promise<EstimateWithCustomer>;
  }

  /**
   * Gets an estimate by ID with all related entities.
   *
   * @param id - Estimate UUID
   * @returns Estimate with customer, pool, and creator details
   */
  async getById(id: string): Promise<EstimateWithDetails | null> {
    const { data, error } = await this.supabase
      .from('estimates')
      .select(
        `
        *,
        customer:customers!estimates_customer_id_fkey (
          id,
          name,
          phone,
          phone_normalized,
          email
        ),
        pool:pools!estimates_pool_id_fkey (
          id,
          property_id,
          type,
          surface_type,
          volume_gallons,
          property:properties!pools_property_id_fkey (
            id,
            address_line1,
            address_line2,
            city,
            state,
            zip_code
          )
        ),
        created_by_admin:admins!estimates_created_by_fkey (
          id,
          full_name,
          email
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
      console.error('Error fetching estimate:', error);
      throw new Error(`Failed to fetch estimate: ${error.message}`);
    }

    // Type assertion after validation
    return data as unknown as EstimateWithDetails;
  }


  /**
   * Gets an estimate by estimate number (e.g., "EST-0001").
   *
   * @param estimateNumber - Human-readable estimate number
   * @returns Estimate with customer, pool, and creator details
   */
  async getByNumber(estimateNumber: string): Promise<EstimateWithDetails | null> {
    const { data, error } = await this.supabase
      .from('estimates')
      .select(
        `
        *,
        customer:customers!estimates_customer_id_fkey (
          id,
          name,
          phone,
          phone_normalized,
          email
        ),
        pool:pools!estimates_pool_id_fkey (
          id,
          property_id,
          type,
          surface_type,
          volume_gallons,
          property:properties!pools_property_id_fkey (
            id,
            address_line1,
            address_line2,
            city,
            state,
            zip_code
          )
        ),
        created_by_admin:admins!estimates_created_by_fkey (
          id,
          full_name,
          email
        )
      `
      )
      .eq('estimate_number', estimateNumber)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      console.error('Error fetching estimate by number:', error);
      throw new Error(`Failed to fetch estimate: ${error.message}`);
    }

    return data as unknown as EstimateWithDetails;
  }

  /**
   * Lists estimates with filtering and pagination.
   *
   * @param options - Filtering and pagination options
   * @returns Paginated list of estimate summaries
   */
  async list(options: EstimateListOptions = {}): Promise<EstimateListResult> {
    const {
      limit = 25,
      offset = 0,
      customerId,
      status,
      sortBy = 'created_at',
      sortOrder = 'desc',
    } = options;

    // Build query
    let query = this.supabase
      .from('estimates')
      .select(
        `
        id,
        estimate_number,
        customer_id,
        status,
        total_cents,
        valid_until,
        created_at,
        customer:customers!estimates_customer_id_fkey (
          id,
          name,
          phone
        )
      `,
        { count: 'exact' }
      );

    // Apply filters
    if (customerId) {
      query = query.eq('customer_id', customerId);
    }

    if (status) {
      if (Array.isArray(status)) {
        query = query.in('status', status);
      } else {
        query = query.eq('status', status);
      }
    }

    // Apply sorting
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error('Error listing estimates:', error);
      throw new Error(`Failed to list estimates: ${error.message}`);
    }

    const total = count ?? 0;

    return {
      estimates: (data ?? []) as unknown as EstimateSummary[],
      total,
      hasMore: offset + limit < total,
    };
  }

  /**
   * Updates an estimate.
   *
   * @param id - Estimate UUID
   * @param input - Fields to update
   * @returns Updated estimate
   */
  async update(
    id: string,
    input: {
      poolId?: string | null;
      lineItems?: LineItemInput[];
      taxRate?: number;
      notes?: string | null;
      validUntil?: string | null;
    }
  ): Promise<EstimateWithCustomer> {
    const updateData: Record<string, unknown> = {};

    if (input.poolId !== undefined) {
      updateData.pool_id = input.poolId;
    }

    if (input.notes !== undefined) {
      updateData.notes = input.notes;
    }

    if (input.validUntil !== undefined) {
      updateData.valid_until = input.validUntil;
    }

    // Recalculate totals if line items or tax rate changed
    if (input.lineItems !== undefined || input.taxRate !== undefined) {
      // Get current estimate for existing values
      const current = await this.getById(id);
      if (!current) {
        throw new Error('Estimate not found');
      }

      const lineItems = input.lineItems ?? current.line_items.map((item) => ({
        id: item.id,
        description: item.description,
        quantity: item.quantity,
        unitPriceCents: item.unit_price_cents,
      }));
      const taxRate = input.taxRate ?? current.tax_rate;

      // Calculate line items with totals
      const lineItemsWithTotals: EstimateLineItem[] = lineItems.map((item) => ({
        id: item.id,
        description: item.description,
        quantity: item.quantity,
        unit_price_cents: item.unitPriceCents,
        total_cents: calculateLineItemTotal(item.quantity, item.unitPriceCents),
      }));

      // Calculate estimate totals
      const { subtotalCents, taxAmountCents, totalCents } = calculateEstimateTotals(
        lineItems.map((item) => ({
          quantity: item.quantity,
          unitPriceCents: item.unitPriceCents,
        })),
        taxRate
      );

      updateData.line_items = lineItemsWithTotals as any;
      updateData.tax_rate = taxRate;
      updateData.subtotal_cents = subtotalCents;
      updateData.tax_amount_cents = taxAmountCents;
      updateData.total_cents = totalCents;
    }

    const { error } = await this.supabase
      .from('estimates')
      .update(updateData)
      .eq('id', id);

    if (error) {
      console.error('Error updating estimate:', error);
      throw new Error(`Failed to update estimate: ${error.message}`);
    }

    return this.getById(id) as Promise<EstimateWithCustomer>;
  }

  /**
   * Gets estimates for a specific customer.
   *
   * @param customerId - Customer UUID
   * @param options - Additional filtering options
   * @returns List of estimate summaries
   */
  async getByCustomerId(
    customerId: string,
    options: Omit<EstimateListOptions, 'customerId'> = {}
  ): Promise<EstimateSummary[]> {
    const result = await this.list({
      ...options,
      customerId,
    });
    return result.estimates;
  }

  /**
   * Updates an estimate's status with transition validation.
   *
   * @param id - Estimate UUID
   * @param newStatus - Target status
   * @returns Updated estimate
   */
  async updateStatus(id: string, newStatus: EstimateStatus): Promise<Estimate> {
    // First, get the current status
    const { data: current, error: fetchError } = await this.supabase
      .from('estimates')
      .select('status')
      .eq('id', id)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        throw new Error('Estimate not found');
      }
      throw new Error(`Failed to fetch estimate: ${fetchError.message}`);
    }

    const currentStatus = current.status as EstimateStatus;

    // Validate transition
    if (!isValidStatusTransition(currentStatus, newStatus)) {
      throw new Error(
        `Invalid status transition from '${currentStatus}' to '${newStatus}'`
      );
    }

    // Update the status
    const { data, error } = await this.supabase
      .from('estimates')
      .update({ status: newStatus })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating estimate status:', error);
      throw new Error(`Failed to update status: ${error.message}`);
    }

    return data as Estimate;
  }

   /**
   * Duplicates an estimate with a new number and draft status.
   *
   * @param id - Source estimate UUID
   * @param createdBy - Admin UUID who is creating the duplicate
   * @returns New duplicated estimate
   */
  async duplicate(id: string, createdBy: string): Promise<Estimate> {
    // Get the source estimate
    const source = await this.getById(id);

    if (!source) {
      throw new Error('Estimate not found');
    }

    // Create a copy with draft status and new line item IDs
    const lineItems = source.line_items.map((item) => ({
      ...item,
      id: crypto.randomUUID(), // New ID for each line item
    }));

    const { data, error } = await this.supabase
      .from('estimates')
      .insert({
        customer_id: source.customer_id,
        pool_id: source.pool_id,
        status: 'draft', // Always reset to draft
        line_items: lineItems,
        tax_rate: source.tax_rate,
        notes: source.notes,
        valid_until: null, // Reset expiration
        created_by: createdBy,
        // Totals will be auto-calculated
      })
      .select()
      .single();

    if (error) {
      console.error('Error duplicating estimate:', error);
      throw new Error(`Failed to duplicate estimate: ${error.message}`);
    }

    return data as Estimate;
  }

  /**
   * Deletes an estimate.
   *
   * @param id - Estimate UUID
   * @returns true if deleted, false if not found
   */
  async delete(id: string): Promise<boolean> {
    const { error, count } = await this.supabase
      .from('estimates')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting estimate:', error);
      throw new Error(`Failed to delete estimate: ${error.message}`);
    }

    return (count ?? 0) > 0;
  }


  /**
   * Generates a unique estimate number.
   *
   * Format: EST-XXXX (sequential padded to 4 digits)
   * Per API spec: Human-readable ID like EST-0001
   */
  private async generateEstimateNumber(): Promise<string> {
    // Find the highest sequence number
    const { data } = await this.supabase
      .from('estimates')
      .select('estimate_number')
      .like('estimate_number', 'EST-%')
      .order('estimate_number', { ascending: false })
      .limit(1);

    let sequence = 1;
    if (data && data.length > 0) {
      const lastNumber = data[0].estimate_number;
      // Extract the numeric part after "EST-"
      const match = lastNumber.match(/^EST-(\d+)$/);
      if (match) {
        const lastSequence = parseInt(match[1], 10);
        if (!isNaN(lastSequence)) {
          sequence = lastSequence + 1;
        }
      }
    }

    return `EST-${String(sequence).padStart(4, '0')}`;
  }

  /**
   * Checks if a customer exists.
   */
  async customerExists(customerId: string): Promise<boolean> {
    const { data, error } = await this.supabase
      .from('customers')
      .select('id')
      .eq('id', customerId)
      .is('deleted_at', null)
      .single();

    return !error && !!data;
  }

  /**
   * Gets pools for a customer (through their properties).
   */
  async getPoolsForCustomer(customerId: string): Promise<Array<{
    id: string;
    type: string;
    property: {
      id: string;
      address_line1: string;
      city: string;
      state: string;
    };
  }>> {
    const { data, error } = await this.supabase
      .from('pools')
      .select(`
        id,
        type,
        properties!inner (
          id,
          address_line1,
          city,
          state,
          customer_id
        )
      `)
      .eq('properties.customer_id', customerId);

    if (error) {
      console.error('Error fetching pools for customer:', error);
      return [];
    }

    return (data ?? []).map((pool: any) => ({
      id: pool.id,
      type: pool.type,
      property: pool.properties,
    }));
  }


  /**
   * Checks if a pool exists and optionally belongs to a customer.
   *
   * @param poolId - Pool UUID
   * @param customerId - Optional customer UUID to verify ownership
   * @returns true if pool exists (and belongs to customer if specified)
   */
  async poolExists(poolId: string, customerId?: string): Promise<boolean> {
    let query = this.supabase
      .from('pools')
      .select(
        `
        id,
        property:properties!pools_property_id_fkey (
          customer_id
        )
      `
      )
      .eq('id', poolId);

    const { data, error } = await query.single();

    if (error || !data) {
      return false;
    }

    if (customerId) {
      const property = data.property as { customer_id: string } | null;
      return property?.customer_id === customerId;
    }

    return true;
  }
}
