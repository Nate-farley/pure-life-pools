'use server';

/**
 * Property Server Actions
 *
 * Server actions for property CRUD operations.
 * Each action validates input, checks authentication, and calls the service layer.
 */

import { revalidatePath } from 'next/cache';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import { PropertyService, type PropertyWithPool, type PropertyListResult } from '@/lib/services/property.service';
import {
  createPropertySchema,
  updatePropertySchema,
  type CreatePropertyInput,
  type UpdatePropertyInput,
} from '@/lib/validations/property';
import type { Property } from '@/lib/types/database';
import type { ActionResult } from '@/lib/types/api';

// ============================================================================
// Helper: Get authenticated admin ID
// ============================================================================

async function getAuthenticatedAdminId(): Promise<string | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  // Verify user is an admin
  const adminClient = createAdminClient();
  const { data: admin } = await adminClient
    .from('admins')
    .select('id')
    .eq('id', user.id)
    .single();

  return admin?.id ?? null;
}

// ============================================================================
// Create Property
// ============================================================================

/**
 * Creates a new property for a customer.
 *
 * @param input - Property creation data including customerId
 * @returns Created property or error
 */
export async function createProperty(
  input: CreatePropertyInput
): Promise<ActionResult<Property>> {
  try {
    console.log("Creating property with input:", input);
    const adminId = await getAuthenticatedAdminId();
    if (!adminId) {
      return {
        success: false,
        error: 'You must be logged in to create properties',
        code: 'UNAUTHORIZED',
      };
    }

    console.log(input)
    // Validate input
    const validationResult = createPropertySchema.safeParse(input);
  console.log("Validation result:", validationResult);
    if (!validationResult.success) {
      return {
        success: false,
        error: validationResult.error.errors[0]?.message ?? 'Validation failed',
        code: 'VALIDATION_ERROR',
      };
    }


    const data = validationResult.data;

    const adminClient = createAdminClient();
    console.log("Server admin client created");
    const service = new PropertyService(adminClient);

    // Verify customer exists
    const customerExists = await service.customerExists(data.customerId);

    console.log('Customer exists:', customerExists);
    if (!customerExists) {
      return {
        success: false,
        error: 'Customer not found',
        code: 'NOT_FOUND',
      };
    }

    console.log('Creating property for customer:', data.customerId);
    const property = await service.create({
      customerId: data.customerId,
      addressLine1: data.addressLine1,
      addressLine2: data.addressLine2,
      city: data.city,
      state: data.state,
      zipCode: data.zipCode,
      gateCode: data.gateCode,
      accessNotes: data.accessNotes,
    });

    console.log('Property created:', property);
    // Revalidate customer detail page
    revalidatePath(`/admin/customers/${data.customerId}`);

    return {
      success: true,
      data: property,
    };
  } catch (error) {
    console.error('Error creating property:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create property',
      code: 'INTERNAL_ERROR',
    };
  }
}

// ============================================================================
// Get Property
// ============================================================================

/**
 * Gets a property by ID with its associated pool.
 *
 * @param id - Property UUID
 * @returns Property with pool or error
 */
export async function getProperty(
  id: string
): Promise<ActionResult<PropertyWithPool>> {
  try {
    const adminId = await getAuthenticatedAdminId();
    if (!adminId) {
      return {
        success: false,
        error: 'You must be logged in to view properties',
        code: 'UNAUTHORIZED',
      };
    }

    const adminClient = createAdminClient();
    const service = new PropertyService(adminClient);

    const property = await service.getById(id);

    if (!property) {
      return {
        success: false,
        error: 'Property not found',
        code: 'NOT_FOUND',
      };
    }

    return {
      success: true,
      data: property,
    };
  } catch (error) {
    console.error('Error fetching property:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch property',
      code: 'INTERNAL_ERROR',
    };
  }
}

// ============================================================================
// List Properties by Customer
// ============================================================================

/**
 * Lists all properties for a customer.
 *
 * @param customerId - Customer UUID
 * @returns List of properties with pools or error
 */
export async function listPropertiesByCustomer(
  customerId: string
): Promise<ActionResult<PropertyListResult>> {
  try {
    const adminId = await getAuthenticatedAdminId();
    if (!adminId) {
      return {
        success: false,
        error: 'You must be logged in to view properties',
        code: 'UNAUTHORIZED',
      };
    }

    const adminClient = createAdminClient();
    const service = new PropertyService(adminClient);

    const result = await service.listByCustomer(customerId);

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    console.error('Error listing properties:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to list properties',
      code: 'INTERNAL_ERROR',
    };
  }
}

// ============================================================================
// Update Property
// ============================================================================

/**
 * Updates a property by ID.
 *
 * @param id - Property UUID
 * @param customerId - Customer UUID (for path revalidation)
 * @param input - Fields to update
 * @returns Updated property or error
 */
export async function updateProperty(
  id: string,
  customerId: string,
  input: UpdatePropertyInput
): Promise<ActionResult<Property>> {
  try {
    console.log("Updating property:", id, "for customer:", customerId, "with input:", input);
    const adminId = await getAuthenticatedAdminId();
    if (!adminId) {
      return {
        success: false,
        error: 'You must be logged in to update properties',
        code: 'UNAUTHORIZED',
      };
    }

    // Validate input
    const validationResult = updatePropertySchema.safeParse(input);
    if (!validationResult.success) {
      return {
        success: false,
        error: validationResult.error.errors[0]?.message ?? 'Validation failed',
        code: 'VALIDATION_ERROR',
      };
    }

    const data = validationResult.data;

    const adminClient = createAdminClient();
    const service = new PropertyService(adminClient);

    // Verify property belongs to customer
    const belongsToCustomer = await service.belongsToCustomer(id, customerId);
    if (!belongsToCustomer) {
      return {
        success: false,
        error: 'Property not found',
        code: 'NOT_FOUND',
      };
    }

    const property = await service.update(id, {
      addressLine1: data.addressLine1,
      addressLine2: data.addressLine2,
      city: data.city,
      state: data.state,
      zipCode: data.zipCode,
      gateCode: data.gateCode,
      accessNotes: data.accessNotes,
    });

    // Revalidate customer detail page
    revalidatePath(`/admin/customers/${customerId}`);

    return {
      success: true,
      data: property,
    };
  } catch (error) {
    console.error('Error updating property:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update property',
      code: 'INTERNAL_ERROR',
    };
  }
}

// ============================================================================
// Delete Property
// ============================================================================

/**
 * Deletes a property by ID.
 *
 * This is a hard delete that also removes the associated pool.
 *
 * @param id - Property UUID
 * @param customerId - Customer UUID (for path revalidation)
 * @returns Success indicator or error
 */
export async function deleteProperty(
  id: string,
  customerId: string
): Promise<ActionResult<{ deleted: boolean }>> {
  try {
    const adminId = await getAuthenticatedAdminId();
    if (!adminId) {
      return {
        success: false,
        error: 'You must be logged in to delete properties',
        code: 'UNAUTHORIZED',
      };
    }

    const adminClient = createAdminClient();
    const service = new PropertyService(adminClient);

    // Verify property belongs to customer
    const belongsToCustomer = await service.belongsToCustomer(id, customerId);
    if (!belongsToCustomer) {
      return {
        success: false,
        error: 'Property not found',
        code: 'NOT_FOUND',
      };
    }

    const deleted = await service.delete(id);

    if (!deleted) {
      return {
        success: false,
        error: 'Property not found',
        code: 'NOT_FOUND',
      };
    }

    // Revalidate customer detail page
    revalidatePath(`/admin/customers/${customerId}`);

    return {
      success: true,
      data: { deleted: true },
    };
  } catch (error) {
    console.error('Error deleting property:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete property',
      code: 'INTERNAL_ERROR',
    };
  }
}
