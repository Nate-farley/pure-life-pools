'use server';

/**
 * Communication Server Actions
 *
 * @file src/app/actions/communications.ts
 *
 * Server actions for communication logging operations.
 * These actions validate input, check authentication, and delegate to the service layer.
 */

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { CommunicationService } from '@/lib/services/communication.service';
import {
  createCommunicationSchema,
  updateCommunicationSchema,
  deleteCommunicationSchema,
  listCommunicationsSchema,
  searchCommunicationsSchema,
  type CreateCommunicationInput,
  type UpdateCommunicationInput,
  type ListCommunicationsInput,
  type SearchCommunicationsInput,
} from '@/lib/validations/communication';
import type { ActionResult } from '@/lib/types/api';
import type {
  CommunicationWithLogger,
  CommunicationListResult,
  CommunicationSearchResult,
} from '@/lib/types/communication';

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Get the current authenticated admin or throw
 */
async function getCurrentAdmin() {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error('You must be logged in to perform this action');
  }

  // Verify user is an admin
  const { data: admin, error: adminError } = await supabase
    .from('admins')
    .select('id, email, full_name')
    .eq('id', user.id)
    .single();

  if (adminError || !admin) {
    throw new Error('You do not have permission to perform this action');
  }

  return { supabase, admin };
}

// =============================================================================
// Create Communication
// =============================================================================

/**
 * Log a new communication for a customer
 */
export async function createCommunication(
  input: CreateCommunicationInput
): Promise<ActionResult<CommunicationWithLogger>> {
  try {
    // Validate input
    const validated = createCommunicationSchema.parse(input);

    // Get authenticated admin
    const { supabase, admin } = await getCurrentAdmin();

    // Create communication
    const service = new CommunicationService(supabase);
    const communication = await service.create(validated, admin.id);

    // Revalidate customer detail page
    revalidatePath(`/admin/customers/${validated.customerId}`);

    return { success: true, data: communication };
  } catch (error) {
    console.error('Failed to create communication:', error);

    if (error instanceof Error) {
      return { success: false, error: error.message };
    }

    return { success: false, error: 'Failed to log communication' };
  }
}

// =============================================================================
// Get Communication
// =============================================================================

/**
 * Get a single communication by ID
 */
export async function getCommunication(
  id: string
): Promise<ActionResult<CommunicationWithLogger | null>> {
  try {
    const { supabase } = await getCurrentAdmin();

    const service = new CommunicationService(supabase);
    const communication = await service.getById(id);

    return { success: true, data: communication };
  } catch (error) {
    console.error('Failed to get communication:', error);

    if (error instanceof Error) {
      return { success: false, error: error.message };
    }

    return { success: false, error: 'Failed to get communication' };
  }
}

// =============================================================================
// List Communications
// =============================================================================

/**
 * List communications for a customer with filters and pagination
 */
export async function listCommunications(
  input: ListCommunicationsInput
): Promise<ActionResult<CommunicationListResult>> {
  try {
    // Validate input
    const validated = listCommunicationsSchema.parse(input);

    // Get authenticated admin
    const { supabase } = await getCurrentAdmin();

    // List communications
    const service = new CommunicationService(supabase);
    const result = await service.listByCustomer(validated);

    return { success: true, data: result };
  } catch (error) {
    console.error('Failed to list communications:', error);

    if (error instanceof Error) {
      return { success: false, error: error.message };
    }

    return { success: false, error: 'Failed to list communications' };
  }
}

// =============================================================================
// Search Communications
// =============================================================================

/**
 * Full-text search on communications
 */
export async function searchCommunications(
  input: SearchCommunicationsInput
): Promise<ActionResult<CommunicationSearchResult>> {
  try {
    // Validate input
    const validated = searchCommunicationsSchema.parse(input);

    // Get authenticated admin
    const { supabase } = await getCurrentAdmin();

    // Search communications
    const service = new CommunicationService(supabase);
    const result = await service.search(validated);

    return { success: true, data: result };
  } catch (error) {
    console.error('Failed to search communications:', error);

    if (error instanceof Error) {
      return { success: false, error: error.message };
    }

    return { success: false, error: 'Failed to search communications' };
  }
}

// =============================================================================
// Update Communication
// =============================================================================

/**
 * Update an existing communication
 */
export async function updateCommunication(
  input: UpdateCommunicationInput
): Promise<ActionResult<CommunicationWithLogger>> {
  try {
    // Validate input
    const validated = updateCommunicationSchema.parse(input);

    // Get authenticated admin
    const { supabase } = await getCurrentAdmin();

    // Update communication
    const service = new CommunicationService(supabase);
    const communication = await service.update(validated);

    // Revalidate customer detail page
    revalidatePath(`/admin/customers/${communication.customer_id}`);

    return { success: true, data: communication };
  } catch (error) {
    console.error('Failed to update communication:', error);

    if (error instanceof Error) {
      return { success: false, error: error.message };
    }

    return { success: false, error: 'Failed to update communication' };
  }
}

// =============================================================================
// Delete Communication
// =============================================================================

/**
 * Delete a communication (hard delete)
 */
export async function deleteCommunication(
  id: string,
  customerId: string
): Promise<ActionResult<boolean>> {
  try {
    // Validate input
    const validated = deleteCommunicationSchema.parse({ id });

    // Get authenticated admin
    const { supabase } = await getCurrentAdmin();

    // Delete communication
    const service = new CommunicationService(supabase);
    await service.delete(validated.id);

    // Revalidate customer detail page
    revalidatePath(`/admin/customers/${customerId}`);

    return { success: true, data: true };
  } catch (error) {
    console.error('Failed to delete communication:', error);

    if (error instanceof Error) {
      return { success: false, error: error.message };
    }

    return { success: false, error: 'Failed to delete communication' };
  }
}

// =============================================================================
// Get Communication Stats
// =============================================================================

/**
 * Get communication statistics for a customer
 */
export async function getCommunicationStats(customerId: string): Promise<
  ActionResult<{
    total: number;
    byType: Record<'call' | 'text' | 'email', number>;
    byDirection: Record<'inbound' | 'outbound', number>;
  }>
> {
  try {
    const { supabase } = await getCurrentAdmin();

    const service = new CommunicationService(supabase);
    const stats = await service.getStats(customerId);

    return { success: true, data: stats };
  } catch (error) {
    console.error('Failed to get communication stats:', error);

    if (error instanceof Error) {
      return { success: false, error: error.message };
    }

    return { success: false, error: 'Failed to get communication stats' };
  }
}
