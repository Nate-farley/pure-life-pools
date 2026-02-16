'use server';

/**
 * Estimate Server Actions
 *
 * Server actions for estimate CRUD operations.
 * Each action validates input, checks authentication, and calls the service layer.
 */

import { revalidatePath } from 'next/cache';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import {
  EstimateService,
  type EstimateWithCustomer,
  type EstimateListResult,
  type EstimateListOptions,
} from '@/lib/services/estimate.service';
import {
  createEstimateSchema,
  updateEstimateSchema,
  updateEstimateStatusSchema,
  type CreateEstimateInput,
  type UpdateEstimateInput,
  type UpdateEstimateStatusInput,
} from '@/lib/validations/estimate';
import { AppError, errorResult, getErrorMessage, isAppError, successResult, type ActionResult } from '@/lib/types/api';
import type { Estimate, EstimateStatus } from '@/lib/types/database';
import { EstimateWithDetails } from '@/lib/types/customer';


/**
 * Gets the current admin user from the session.
 * Throws if not authenticated or not an admin.
 */
async function getCurrentAdmin(): Promise<{ id: string; email: string }> {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw AppError.unauthorized('Not authenticated');
  }

  // Verify user is an admin
  const adminClient = createAdminClient();
  const { data: admin, error: adminError } = await adminClient
    .from('admins')
    .select('id, email')
    .eq('id', user.id)
    .single();

  if (adminError || !admin) {
    throw AppError.forbidden('Not an administrator');
  }

  return admin;
}


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
// Create Estimate
// ============================================================================

/**
 * Gets estimates for a specific customer.
 */
export async function getCustomerEstimates(
  customerId: string,
  options: Omit<EstimateListOptions, 'customerId'> = {}
): Promise<ActionResult<EstimateListResult>> {
  try {
    await getCurrentAdmin();

    const supabase = await createClient();
    const estimateService = new EstimateService(supabase);

    const result = await estimateService.list({
      ...options,
      customerId,
    });

    return successResult(result);
  } catch (error) {
    console.error('Error in getCustomerEstimates:', error);

    if (isAppError(error)) {
      return errorResult(error.message, error.code);
    }

    return errorResult(getErrorMessage(error), 'INTERNAL_ERROR');
  }
}

/**
 * Creates a new estimate.
 */
export async function createEstimate(
  input: CreateEstimateInput
): Promise<ActionResult<Estimate>> {
  try {
    const admin = await getCurrentAdmin();

    // Validate input
    const validation = createEstimateSchema.safeParse(input);
    if (!validation.success) {
      const errorMessage = validation.error.errors
        .map((e) => e.message)
        .join(', ');
      return errorResult(errorMessage, 'VALIDATION_ERROR');
    }

    const supabase = await createClient();
    const estimateService = new EstimateService(supabase);

    // Verify customer exists
    const customerExists = await estimateService.customerExists(input.customerId);
    if (!customerExists) {
      return errorResult('Customer not found', 'NOT_FOUND');
    }

    // Verify pool exists and belongs to customer (if provided)
    if (input.pool_id) {
      const poolExists = await estimateService.poolExists(
        input.pool_id,
        input.customerId
      );
      if (!poolExists) {
        return errorResult(
          'Pool not found or does not belong to this customer',
          'NOT_FOUND'
        );
      }
    }

    const estimate = await estimateService.create(validation.data, admin.id);

    // Revalidate related paths
    revalidatePath('/admin/estimates');
    revalidatePath(`/admin/customers/${input.customerId}`);

    return successResult(estimate);
  } catch (error) {
    console.error('Error in createEstimate:', error);

    if (isAppError(error)) {
      return errorResult(error.message, error.code);
    }

    return errorResult(getErrorMessage(error), 'INTERNAL_ERROR');
  }
}

// ============================================================================
// Get Estimate
// ============================================================================

/**
 * Gets an estimate by estimate number (e.g., "EST-0001").
 */
export async function getEstimateByNumber(
  estimateNumber: string
): Promise<ActionResult<EstimateWithDetails>> {
  try {
    await getCurrentAdmin();

    const supabase = await createClient();
    const estimateService = new EstimateService(supabase);

    const estimate = await estimateService.getByNumber(estimateNumber);

    if (!estimate) {
      return errorResult('Estimate not found', 'NOT_FOUND');
    }

    return successResult(estimate);
  } catch (error) {
    console.error('Error in getEstimateByNumber:', error);

    if (isAppError(error)) {
      return errorResult(error.message, error.code);
    }

    return errorResult(getErrorMessage(error), 'INTERNAL_ERROR');
  }
}

/**
 * Gets an estimate by ID.
 *
 * @param id - Estimate UUID
 * @returns Estimate with details or error
 */
export async function getEstimate(
  id: string
): Promise<ActionResult<EstimateWithCustomer>> {
  try {
    const adminId = await getAuthenticatedAdminId();
    if (!adminId) {
      return {
        success: false,
        error: 'You must be logged in to view estimates',
        code: 'UNAUTHORIZED',
      };
    }

    const adminClient = createAdminClient();
    const service = new EstimateService(adminClient);

    const estimate = await service.getById(id);

    if (!estimate) {
      return {
        success: false,
        error: 'Estimate not found',
        code: 'NOT_FOUND',
      };
    }

    return {
      success: true,
      data: estimate,
    };
  } catch (error) {
    console.error('Error fetching estimate:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch estimate',
      code: 'INTERNAL_ERROR',
    };
  }
}

// ============================================================================
// List Estimates
// ============================================================================

/**
 * Lists estimates with pagination and filters.
 *
 * @param options - List options
 * @returns List of estimates with pagination info
 */
export async function listEstimates(
  options?: EstimateListOptions
): Promise<ActionResult<EstimateListResult>> {
  try {
    const adminId = await getAuthenticatedAdminId();
    if (!adminId) {
      return {
        success: false,
        error: 'You must be logged in to view estimates',
        code: 'UNAUTHORIZED',
      };
    }

    const adminClient = createAdminClient();
    const service = new EstimateService(adminClient);

    const result = await service.list(options);

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    console.error('Error listing estimates:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to list estimates',
      code: 'INTERNAL_ERROR',
    };
  }
}

// ============================================================================
// Update Estimate
// ============================================================================

/**
 * Updates an estimate.
 *
 * @param id - Estimate UUID
 * @param input - Fields to update
 * @returns Updated estimate or error
 */
export async function updateEstimate(
  id: string,
  input: UpdateEstimateInput
): Promise<ActionResult<EstimateWithCustomer>> {
  try {
    const adminId = await getAuthenticatedAdminId();
    if (!adminId) {
      return {
        success: false,
        error: 'You must be logged in to update estimates',
        code: 'UNAUTHORIZED',
      };
    }

    // Validate input
    const validationResult = updateEstimateSchema.safeParse(input);
    if (!validationResult.success) {
      return {
        success: false,
        error: validationResult.error.errors[0]?.message ?? 'Validation failed',
        code: 'VALIDATION_ERROR',
      };
    }

    const data = validationResult.data;

    const adminClient = createAdminClient();
    const service = new EstimateService(adminClient);

    // Check estimate exists
    const existing = await service.getById(id);
    if (!existing) {
      return {
        success: false,
        error: 'Estimate not found',
        code: 'NOT_FOUND',
      };
    }

    const estimate = await service.update(id, {
      poolId: data.poolId,
      lineItems: data.lineItems,
      taxRate: data.taxRate,
      notes: data.notes,
      validUntil: data.validUntil,
    });

    // Revalidate paths
    revalidatePath('/admin/estimates');
    revalidatePath(`/admin/estimates/${id}`);
    revalidatePath(`/admin/customers/${existing.customer_id}`);

    return {
      success: true,
      data: estimate,
    };
  } catch (error) {
    console.error('Error updating estimate:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update estimate',
      code: 'INTERNAL_ERROR',
    };
  }
}

// ============================================================================
// Update Estimate Status
// ============================================================================

/**
 * Updates an estimate's status.
 *
 * @param id - Estimate UUID
 * @param input - New status
 * @returns Updated estimate or error
 */
export async function updateEstimateStatus(
  id: string,
  input: UpdateEstimateStatusInput
): Promise<ActionResult<EstimateWithCustomer>> {
  try {
    const adminId = await getAuthenticatedAdminId();
    if (!adminId) {
      return {
        success: false,
        error: 'You must be logged in to update estimate status',
        code: 'UNAUTHORIZED',
      };
    }

    // Validate input
    const validationResult = updateEstimateStatusSchema.safeParse(input);
    if (!validationResult.success) {
      return {
        success: false,
        error: validationResult.error.errors[0]?.message ?? 'Validation failed',
        code: 'VALIDATION_ERROR',
      };
    }

    const data = validationResult.data;

    const adminClient = createAdminClient();
    const service = new EstimateService(adminClient);

    // Check estimate exists
    const existing = await service.getById(id);
    if (!existing) {
      return {
        success: false,
        error: 'Estimate not found',
        code: 'NOT_FOUND',
      };
    }

    const estimate = await service.updateStatus(id, data.status as EstimateStatus);

    // Revalidate paths
    revalidatePath('/admin/estimates');
    revalidatePath(`/admin/estimates/${id}`);
    revalidatePath(`/admin/customers/${existing.customer_id}`);

    return {
      success: true,
      data: estimate,
    };
  } catch (error) {
    console.error('Error updating estimate status:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update estimate status',
      code: 'INTERNAL_ERROR',
    };
  }
}

// ============================================================================
// Duplicate Estimate
// ============================================================================

/**
 * Duplicates an estimate.
 */
export async function duplicateEstimate(
  id: string
): Promise<ActionResult<Estimate>> {
  try {
    const admin = await getCurrentAdmin();

    const supabase = await createClient();
    const estimateService = new EstimateService(supabase);

    const estimate = await estimateService.duplicate(id, admin.id);

    // Revalidate related paths
    revalidatePath('/admin/estimates');

    return successResult(estimate);
  } catch (error) {
    console.error('Error in duplicateEstimate:', error);

    if (isAppError(error)) {
      return errorResult(error.message, error.code);
    }

    if (error instanceof Error && error.message === 'Estimate not found') {
      return errorResult(error.message, 'NOT_FOUND');
    }

    return errorResult(getErrorMessage(error), 'INTERNAL_ERROR');
  }
}

// ============================================================================
// Delete Estimate
// ============================================================================

/**
 * Deletes an estimate.
 *
 * @param id - Estimate UUID
 * @returns Success indicator or error
 */
export async function deleteEstimate(
  id: string
): Promise<ActionResult<{ deleted: boolean }>> {
  try {
    const adminId = await getAuthenticatedAdminId();
    if (!adminId) {
      return {
        success: false,
        error: 'You must be logged in to delete estimates',
        code: 'UNAUTHORIZED',
      };
    }

    const adminClient = createAdminClient();
    const service = new EstimateService(adminClient);

    // Get estimate for revalidation
    const existing = await service.getById(id);
    if (!existing) {
      return {
        success: false,
        error: 'Estimate not found',
        code: 'NOT_FOUND',
      };
    }

    const deleted = await service.delete(id);

    if (!deleted) {
      return {
        success: false,
        error: 'Estimate not found',
        code: 'NOT_FOUND',
      };
    }

    // Revalidate paths
    revalidatePath('/admin/estimates');
    revalidatePath(`/admin/customers/${existing.customer_id}`);

    return {
      success: true,
      data: { deleted: true },
    };
  } catch (error) {
    console.error('Error deleting estimate:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete estimate',
      code: 'INTERNAL_ERROR',
    };
  }
}

// ============================================================================
// Get Pools for Customer
// ============================================================================

/**
 * Gets pools for a customer (for the pool selector in estimate form).
 *
 * @param customerId - Customer UUID
 * @returns List of pools with property info
 */
export async function getPoolsForCustomer(
  customerId: string
): Promise<ActionResult<Array<{
  id: string;
  type: string;
  property: {
    id: string;
    address_line1: string;
    city: string;
    state: string;
  };
}>>> {
  try {
    const adminId = await getAuthenticatedAdminId();
    if (!adminId) {
      return {
        success: false,
        error: 'You must be logged in',
        code: 'UNAUTHORIZED',
      };
    }

    const adminClient = createAdminClient();
    const service = new EstimateService(adminClient);

    const pools = await service.getPoolsForCustomer(customerId);

    return {
      success: true,
      data: pools,
    };
  } catch (error) {
    console.error('Error fetching pools for customer:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch pools',
      code: 'INTERNAL_ERROR',
    };
  }
}
