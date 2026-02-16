/**
 * Property Service
 *
 * Service layer for all property-related database operations.
 * Handles CRUD operations for customer properties.
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database, Property, Pool } from '@/lib/types/database';

type DbClient = SupabaseClient<Database>;

/**
 * Property with associated pool data
 */
export interface PropertyWithPool extends Property {
  pool: Pool | null;
}

/**
 * Property list result
 */
export interface PropertyListResult {
  properties: PropertyWithPool[];
  total: number;
}

export class PropertyService {
  constructor(private supabase: DbClient) {}

  /**
   * Creates a new property for a customer.
   *
   * @param input - Property creation data
   * @returns Created property
   */
  async create(input: {
    customerId: string;
    addressLine1: string;
    addressLine2?: string | null;
    city: string;
    state: string;
    zipCode: string;
    gateCode?: string | null;
    accessNotes?: string | null;
  }): Promise<Property> {
    console.log('PropertyService.create called with input:', input);

    const { data, error } = await this.supabase
      .from('properties')
      .insert({
        customer_id: input.customerId,
        address_line1: input.addressLine1,
        address_line2: input.addressLine2 ?? null,
        city: input.city,
        state: input.state,
        zip_code: input.zipCode,
        gate_code: input.gateCode ?? null,
        access_notes: input.accessNotes ?? null,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating property:', error);
      throw new Error(`Failed to create property: ${error.message}`);
    }

    return data;
  }

  /**
   * Gets a property by ID with its associated pool.
   *
   * @param id - Property UUID
   * @returns Property with pool or null if not found
   */
  async getById(id: string): Promise<PropertyWithPool | null> {
    const { data: property, error } = await this.supabase
      .from('properties')
      .select(`
        *,
        pools (*)
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code !== 'PGRST116') {
        console.error('Error fetching property:', error);
      }
      return null;
    }

    // Transform the nested pool array to single pool object
    const pools = property.pools as Pool[] | null;
    return {
      ...property,
      pool: pools && pools.length > 0 ? pools[0] : null,
    } as PropertyWithPool;
  }

  /**
   * Lists all properties for a customer.
   *
   * @param customerId - Customer UUID
   * @returns List of properties with pools
   */
  async listByCustomer(customerId: string): Promise<PropertyListResult> {
    const { data: properties, error, count } = await this.supabase
      .from('properties')
      .select(`
        *,
        pools (*)
      `, { count: 'exact' })
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error listing properties:', error);
      return { properties: [], total: 0 };
    }

    // Transform each property to include pool as single object
    const propertiesWithPools: PropertyWithPool[] = (properties ?? []).map((prop: any) => {
      const pools = prop.pools as Pool[] | null;
      return {
        ...prop,
        pool: pools && pools.length > 0 ? pools[0] : null,
      };
    });

    return {
      properties: propertiesWithPools,
      total: count ?? 0,
    };
  }

  /**
   * Updates a property by ID.
   *
   * @param id - Property UUID
   * @param input - Fields to update
   * @returns Updated property
   */
  async update(
    id: string,
    input: {
      addressLine1?: string;
      addressLine2?: string | null;
      city?: string;
      state?: string;
      zipCode?: string;
      gateCode?: string | null;
      accessNotes?: string | null;
    }
  ): Promise<Property> {
    const updateData: Record<string, unknown> = {};

    if (input.addressLine1 !== undefined) {
      updateData.address_line1 = input.addressLine1;
    }
    if (input.addressLine2 !== undefined) {
      updateData.address_line2 = input.addressLine2;
    }
    if (input.city !== undefined) {
      updateData.city = input.city;
    }
    if (input.state !== undefined) {
      updateData.state = input.state;
    }
    if (input.zipCode !== undefined) {
      updateData.zip_code = input.zipCode;
    }
    if (input.gateCode !== undefined) {
      updateData.gate_code = input.gateCode;
    }
    if (input.accessNotes !== undefined) {
      updateData.access_notes = input.accessNotes;
    }

    const { data, error } = await this.supabase
      .from('properties')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating property:', error);
      throw new Error(`Failed to update property: ${error.message}`);
    }

    return data;
  }

  /**
   * Deletes a property by ID.
   *
   * This is a hard delete that also cascades to the associated pool.
   *
   * @param id - Property UUID
   * @returns true if deleted, false if not foundexport async function deleteProperty(
*/
  async delete(id: string): Promise<boolean> {
    // First, delete associated pool (if any)
    await this.supabase
      .from('pools')
      .delete()
      .eq('property_id', id);

    // Then delete the property
    const { error, count } = await this.supabase
      .from('properties')
      .delete({ count: "exact" })
      .eq('id', id);

    if (error) {
      console.log("Throw error deleting")
      console.error('Error deleting property:', error);
      throw new Error(`Failed to delete property: ${error.message}`);
    }

    return (count ?? 0) > 0;
  }

  /**
   * Checks if a customer exists and is not deleted.
   *
   * @param customerId - Customer UUID
   * @returns true if customer exists
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
   * Checks if a property belongs to a specific customer.
   *
   * @param propertyId - Property UUID
   * @param customerId - Customer UUID
   * @returns true if property belongs to customer
   */
  async belongsToCustomer(propertyId: string, customerId: string): Promise<boolean> {
    const { data, error } = await this.supabase
      .from('properties')
      .select('id')
      .eq('id', propertyId)
      .eq('customer_id', customerId)
      .single();

    return !error && !!data;
  }

  /**
   * Gets a Google Maps URL for a property address.
   *
   * @param property - Property with address fields
   * @returns Google Maps URL
   */
  getGoogleMapsUrl(property: {
    addressLine1: string;
    addressLine2?: string | null;
    city: string;
    state: string;
    zipCode: string;
  }): string {
    const address = [
      property.addressLine1,
      property.addressLine2,
      property.city,
      property.state,
      property.zipCode,
    ]
      .filter(Boolean)
      .join(', ');

    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
  }
}
