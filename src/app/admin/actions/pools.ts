'use server';

/**
 * Pool Server Actions
 *
 * Server actions for pool CRUD operations.
 * Each action validates input, checks authentication, and calls the service layer.
 */

import { revalidatePath } from 'next/cache';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import { PoolService } from '@/lib/services/pool.service';
import {
  createPoolSchema,
  updatePoolSchema,
  type CreatePoolInput,
  type UpdatePoolInput,
} from '@/lib/validations/pool';
import type { Pool } from '@/lib/types/database';
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
// Create Pool
// ============================================================================

/**
 * Creates a new pool for a property.
 *
 * Each property can have exactly one pool (1:1 relationship).
 *
 * @param input - Pool creation data including propertyId
 * @returns Created pool or error
 */
export async function createPool(
  input: CreatePoolInput
): Promise<ActionResult<Pool>> {
  try {
    const adminId = await getAuthenticatedAdminId();
    if (!adminId) {
      return {
        success: false,
        error: 'You must be logged in to create pools',
        code: 'UNAUTHORIZED',
      };
    }

    console.log('Creating pool with input:', input);

    const clean = Object.fromEntries(
  Object.entries(input).map(([k, v]) => [k, v === null ? undefined : v])
);

    // Validate input
    const validationResult = createPoolSchema.safeParse(clean);
    console.log('Validation Result:', validationResult);
    if (!validationResult.success) {
      return {
        success: false,
        error: validationResult.error.errors[0]?.message ?? 'Validation failed',
        code: 'VALIDATION_ERROR',
      };
    }

    const data = validationResult.data;

    const adminClient = createAdminClient();
    const service = new PoolService(adminClient);

    // Verify property exists
    const propertyExists = await service.propertyExists(data.propertyId);
    if (!propertyExists) {
      return {
        success: false,
        error: 'Property not found',
        code: 'NOT_FOUND',
      };
    }

    // Get customer ID for revalidation
    const customerId = await service.getCustomerIdForProperty(data.propertyId);

    const pool = await service.create({
      propertyId: data.propertyId,
      type: data.type,
      surfaceType: data.surfaceType,
      lengthFt: data.lengthFt,
      widthFt: data.widthFt,
      depthShallowFt: data.depthShallowFt,
      depthDeepFt: data.depthDeepFt,
      volumeGallons: data.volumeGallons,
      equipmentNotes: data.equipmentNotes,
    });

    // Revalidate customer detail page
    if (customerId) {
      revalidatePath(`/admin/customers/${customerId}`);
    }

    return {
      success: true,
      data: pool,
    };
  } catch (error) {
    console.error('Error creating pool:', error);

    // Handle specific error for duplicate pool
    if (error instanceof Error && error.message.includes('already exists')) {
      return {
        success: false,
        error: 'A pool already exists for this property',
        code: 'CONFLICT',
      };
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create pool',
      code: 'INTERNAL_ERROR',
    };
  }
}

// ============================================================================
// Get Pool
// ============================================================================

/**
 * Gets a pool by ID.
 *
 * @param id - Pool UUID
 * @returns Pool or error
 */
export async function getPool(id: string): Promise<ActionResult<Pool>> {
  try {
    const adminId = await getAuthenticatedAdminId();
    if (!adminId) {
      return {
        success: false,
        error: 'You must be logged in to view pools',
        code: 'UNAUTHORIZED',
      };
    }

    const adminClient = createAdminClient();
    const service = new PoolService(adminClient);

    const pool = await service.getById(id);

    if (!pool) {
      return {
        success: false,
        error: 'Pool not found',
        code: 'NOT_FOUND',
      };
    }

    return {
      success: true,
      data: pool,
    };
  } catch (error) {
    console.error('Error fetching pool:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch pool',
      code: 'INTERNAL_ERROR',
    };
  }
}

// ============================================================================
// Get Pool by Property
// ============================================================================

/**
 * Gets a pool by property ID.
 *
 * @param propertyId - Property UUID
 * @returns Pool or null (not an error if no pool exists)
 */
export async function getPoolByProperty(
  propertyId: string
): Promise<ActionResult<Pool | null>> {
  try {
    const adminId = await getAuthenticatedAdminId();
    if (!adminId) {
      return {
        success: false,
        error: 'You must be logged in to view pools',
        code: 'UNAUTHORIZED',
      };
    }

    const adminClient = createAdminClient();
    const service = new PoolService(adminClient);

    const pool = await service.getByPropertyId(propertyId);

    return {
      success: true,
      data: pool, // Can be null if no pool exists
    };
  } catch (error) {
    console.error('Error fetching pool by property:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch pool',
      code: 'INTERNAL_ERROR',
    };
  }
}

// ============================================================================
// Update Pool
// ============================================================================

/**
 * Updates a pool by ID.
 *
 * @param id - Pool UUID
 * @param propertyId - Property UUID (for validation and path revalidation)
 * @param customerId - Customer UUID (for path revalidation)
 * @param input - Fields to update
 * @returns Updated pool or error
 */
export async function updatePool(
  id: string,
  propertyId: string,
  customerId: string,
  input: UpdatePoolInput
): Promise<ActionResult<Pool>> {
  try {
    const adminId = await getAuthenticatedAdminId();
    if (!adminId) {
      return {
        success: false,
        error: 'You must be logged in to update pools',
        code: 'UNAUTHORIZED',
      };
    }

    // Validate input
    const validationResult = updatePoolSchema.safeParse(input);
    if (!validationResult.success) {
      return {
        success: false,
        error: validationResult.error.errors[0]?.message ?? 'Validation failed',
        code: 'VALIDATION_ERROR',
      };
    }

    const data = validationResult.data;

    const adminClient = createAdminClient();
    const service = new PoolService(adminClient);

    // Verify pool belongs to property
    const belongsToProperty = await service.belongsToProperty(id, propertyId);
    if (!belongsToProperty) {
      return {
        success: false,
        error: 'Pool not found',
        code: 'NOT_FOUND',
      };
    }

    const pool = await service.update(id, {
      type: data.type,
      surfaceType: data.surfaceType,
      lengthFt: data.lengthFt,
      widthFt: data.widthFt,
      depthShallowFt: data.depthShallowFt,
      depthDeepFt: data.depthDeepFt,
      volumeGallons: data.volumeGallons,
      equipmentNotes: data.equipmentNotes,
    });

    // Revalidate customer detail page
    revalidatePath(`/admin/customers/${customerId}`);

    return {
      success: true,
      data: pool,
    };
  } catch (error) {
    console.error('Error updating pool:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update pool',
      code: 'INTERNAL_ERROR',
    };
  }
}

// ============================================================================
// Delete Pool
// ============================================================================

/**
 * Deletes a pool by ID.
 *
 * @param id - Pool UUID
 * @param propertyId - Property UUID (for validation)
 * @param customerId - Customer UUID (for path revalidation)
 * @returns Success indicator or error
 */
export async function deletePool(
  id: string,
  propertyId: string,
  customerId: string
): Promise<ActionResult<{ deleted: boolean }>> {
  try {
    const adminId = await getAuthenticatedAdminId();
    if (!adminId) {
      return {
        success: false,
        error: 'You must be logged in to delete pools',
        code: 'UNAUTHORIZED',
      };
    }

    const adminClient = createAdminClient();
    const service = new PoolService(adminClient);

    // Verify pool belongs to property
    const belongsToProperty = await service.belongsToProperty(id, propertyId);
    if (!belongsToProperty) {
      return {
        success: false,
        error: 'Pool not found',
        code: 'NOT_FOUND',
      };
    }

    const deleted = await service.delete(id);

    if (!deleted) {
      return {
        success: false,
        error: 'Pool not found',
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
    console.error('Error deleting pool:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete pool',
      code: 'INTERNAL_ERROR',
    };
  }
}
