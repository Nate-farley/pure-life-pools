/**
 * Pool Service
 *
 * Service layer for all pool-related database operations.
 * Handles CRUD operations for pools with 1:1 relationship to properties.
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database, Pool, PoolType, PoolSurfaceType } from '@/lib/types/database';

type DbClient = SupabaseClient<Database>;

/**
 * Pool with property info for display
 */
export interface PoolWithProperty extends Pool {
  property?: {
    id: string;
    address_line1: string;
    city: string;
    state: string;
    customer_id: string;
  };
}

export class PoolService {
  constructor(private supabase: DbClient) {}

  /**
   * Creates a new pool for a property.
   *
   * Each property can have exactly one pool (1:1 relationship).
   * If a pool already exists for the property, this will fail.
   *
   * @param input - Pool creation data
   * @returns Created pool
   */
  async create(input: {
    propertyId: string;
    type: PoolType;
    surfaceType?: PoolSurfaceType | null;
    lengthFt?: number | null;
    widthFt?: number | null;
    depthShallowFt?: number | null;
    depthDeepFt?: number | null;
    volumeGallons?: number | null;
    equipmentNotes?: string | null;
  }): Promise<Pool> {
    // Check if pool already exists for this property
    const existing = await this.getByPropertyId(input.propertyId);
    if (existing) {
      throw new Error('A pool already exists for this property');
    }

    const { data, error } = await this.supabase
      .from('pools')
      .insert({
        property_id: input.propertyId,
        type: input.type,
        surface_type: input.surfaceType ?? null,
        length_ft: input.lengthFt ?? null,
        width_ft: input.widthFt ?? null,
        depth_shallow_ft: input.depthShallowFt ?? null,
        depth_deep_ft: input.depthDeepFt ?? null,
        volume_gallons: input.volumeGallons ?? null,
        equipment_notes: input.equipmentNotes ?? null,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating pool:', error);
      if (error.code === '23505') {
        throw new Error('A pool already exists for this property');
      }
      throw new Error(`Failed to create pool: ${error.message}`);
    }

    return data;
  }

  /**
   * Gets a pool by ID.
   *
   * @param id - Pool UUID
   * @returns Pool or null if not found
   */
  async getById(id: string): Promise<Pool | null> {
    const { data, error } = await this.supabase
      .from('pools')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code !== 'PGRST116') {
        console.error('Error fetching pool:', error);
      }
      return null;
    }

    return data;
  }

  /**
   * Gets a pool by property ID.
   *
   * Since each property has at most one pool, this returns a single pool or null.
   *
   * @param propertyId - Property UUID
   * @returns Pool or null if not found
   */
  async getByPropertyId(propertyId: string): Promise<Pool | null> {
    const { data, error } = await this.supabase
      .from('pools')
      .select('*')
      .eq('property_id', propertyId)
      .single();

    if (error) {
      if (error.code !== 'PGRST116') {
        console.error('Error fetching pool by property:', error);
      }
      return null;
    }

    return data;
  }

  /**
   * Gets a pool with its property information.
   *
   * @param id - Pool UUID
   * @returns Pool with property or null if not found
   */
  async getByIdWithProperty(id: string): Promise<PoolWithProperty | null> {
    const { data, error } = await this.supabase
      .from('pools')
      .select(`
        *,
        properties!inner (
          id,
          address_line1,
          city,
          state,
          customer_id
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code !== 'PGRST116') {
        console.error('Error fetching pool with property:', error);
      }
      return null;
    }

    // Transform the nested property
    const { properties, ...poolData } = data as any;
    return {
      ...poolData,
      property: properties,
    };
  }

  /**
   * Updates a pool by ID.
   *
   * @param id - Pool UUID
   * @param input - Fields to update
   * @returns Updated pool
   */
  async update(
    id: string,
    input: {
      type?: PoolType;
      surfaceType?: PoolSurfaceType | null;
      lengthFt?: number | null;
      widthFt?: number | null;
      depthShallowFt?: number | null;
      depthDeepFt?: number | null;
      volumeGallons?: number | null;
      equipmentNotes?: string | null;
    }
  ): Promise<Pool> {
    const updateData: Record<string, unknown> = {};

    if (input.type !== undefined) {
      updateData.type = input.type;
    }
    if (input.surfaceType !== undefined) {
      updateData.surface_type = input.surfaceType;
    }
    if (input.lengthFt !== undefined) {
      updateData.length_ft = input.lengthFt;
    }
    if (input.widthFt !== undefined) {
      updateData.width_ft = input.widthFt;
    }
    if (input.depthShallowFt !== undefined) {
      updateData.depth_shallow_ft = input.depthShallowFt;
    }
    if (input.depthDeepFt !== undefined) {
      updateData.depth_deep_ft = input.depthDeepFt;
    }
    if (input.volumeGallons !== undefined) {
      updateData.volume_gallons = input.volumeGallons;
    }
    if (input.equipmentNotes !== undefined) {
      updateData.equipment_notes = input.equipmentNotes;
    }

    const { data, error } = await this.supabase
      .from('pools')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating pool:', error);
      throw new Error(`Failed to update pool: ${error.message}`);
    }

    return data;
  }

  /**
   * Deletes a pool by ID.
   *
   * @param id - Pool UUID
   * @returns true if deleted, false if not found
   */
  async delete(id: string): Promise<boolean> {
    const { error, count } = await this.supabase
      .from('pools')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting pool:', error);
      throw new Error(`Failed to delete pool: ${error.message}`);
    }

    return (count ?? 0) > 0;
  }

  /**
   * Checks if a property exists.
   *
   * @param propertyId - Property UUID
   * @returns true if property exists
   */
  async propertyExists(propertyId: string): Promise<boolean> {
    const { data, error } = await this.supabase
      .from('properties')
      .select('id')
      .eq('id', propertyId)
      .single();

    return !error && !!data;
  }

  /**
   * Gets the customer ID for a property.
   *
   * @param propertyId - Property UUID
   * @returns Customer ID or null
   */
  async getCustomerIdForProperty(propertyId: string): Promise<string | null> {
    const { data, error } = await this.supabase
      .from('properties')
      .select('customer_id')
      .eq('id', propertyId)
      .single();

    if (error || !data) {
      return null;
    }

    return data.customer_id;
  }

  /**
   * Checks if a pool belongs to a specific property.
   *
   * @param poolId - Pool UUID
   * @param propertyId - Property UUID
   * @returns true if pool belongs to property
   */
  async belongsToProperty(poolId: string, propertyId: string): Promise<boolean> {
    const { data, error } = await this.supabase
      .from('pools')
      .select('id')
      .eq('id', poolId)
      .eq('property_id', propertyId)
      .single();

    return !error && !!data;
  }
}
