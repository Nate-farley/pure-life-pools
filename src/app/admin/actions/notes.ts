'use server';

/**
 * Note Server Actions
 *
 * Server actions for customer note CRUD operations.
 * Each action validates input, checks authentication, and calls the service layer.
 */

import { revalidatePath } from 'next/cache';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import { NoteService, type NoteWithAuthor, type NoteListResult } from '@/lib/services/note.service';
import {
  createNoteSchema,
  updateNoteSchema,
  type CreateNoteInput,
  type UpdateNoteInput,
} from '@/lib/validations/note';
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
// Create Note
// ============================================================================

/**
 * Creates a new note for a customer.
 *
 * @param input - Note creation data including customerId and content
 * @returns Created note with author info or error
 */
export async function createNote(
  input: CreateNoteInput
): Promise<ActionResult<NoteWithAuthor>> {
  try {
    const adminId = await getAuthenticatedAdminId();
    if (!adminId) {
      return {
        success: false,
        error: 'You must be logged in to create notes',
        code: 'UNAUTHORIZED',
      };
    }

    // Validate input
    const validationResult = createNoteSchema.safeParse(input);
    if (!validationResult.success) {
      return {
        success: false,
        error: validationResult.error.errors[0]?.message ?? 'Validation failed',
        code: 'VALIDATION_ERROR',
      };
    }

    const data = validationResult.data;

    const adminClient = createAdminClient();
    const service = new NoteService(adminClient);

    // Verify customer exists
    const customerExists = await service.customerExists(data.customerId);
    if (!customerExists) {
      return {
        success: false,
        error: 'Customer not found',
        code: 'NOT_FOUND',
      };
    }

    const note = await service.create(
      {
        customerId: data.customerId,
        content: data.content,
      },
      adminId
    );

    // Revalidate customer detail page
    revalidatePath(`/admin/customers/${data.customerId}`);

    return {
      success: true,
      data: note,
    };
  } catch (error) {
    console.error('Error creating note:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create note',
      code: 'INTERNAL_ERROR',
    };
  }
}

// ============================================================================
// Get Note
// ============================================================================

/**
 * Gets a note by ID with author and attachments.
 *
 * @param id - Note UUID
 * @returns Note with details or error
 */
export async function getNote(
  id: string
): Promise<ActionResult<NoteWithAuthor>> {
  try {
    const adminId = await getAuthenticatedAdminId();
    if (!adminId) {
      return {
        success: false,
        error: 'You must be logged in to view notes',
        code: 'UNAUTHORIZED',
      };
    }

    const adminClient = createAdminClient();
    const service = new NoteService(adminClient);

    const note = await service.getById(id);

    if (!note) {
      return {
        success: false,
        error: 'Note not found',
        code: 'NOT_FOUND',
      };
    }

    return {
      success: true,
      data: note,
    };
  } catch (error) {
    console.error('Error fetching note:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch note',
      code: 'INTERNAL_ERROR',
    };
  }
}

// ============================================================================
// List Notes by Customer
// ============================================================================

/**
 * Lists notes for a customer with pagination.
 *
 * @param customerId - Customer UUID
 * @param options - Pagination options
 * @returns List of notes with author info
 */
export async function listNotesByCustomer(
  customerId: string,
  options?: {
    limit?: number;
    cursor?: string;
  }
): Promise<ActionResult<NoteListResult>> {
  try {
    const adminId = await getAuthenticatedAdminId();
    if (!adminId) {
      return {
        success: false,
        error: 'You must be logged in to view notes',
        code: 'UNAUTHORIZED',
      };
    }

    const adminClient = createAdminClient();
    const service = new NoteService(adminClient);

    const result = await service.listByCustomer(customerId, options);

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    console.error('Error listing notes:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to list notes',
      code: 'INTERNAL_ERROR',
    };
  }
}

// ============================================================================
// Update Note
// ============================================================================

/**
 * Updates a note's content.
 *
 * @param id - Note UUID
 * @param customerId - Customer UUID (for validation and path revalidation)
 * @param input - Updated content
 * @returns Updated note or error
 */
export async function updateNote(
  id: string,
  customerId: string,
  input: UpdateNoteInput
): Promise<ActionResult<NoteWithAuthor>> {
  try {
    const adminId = await getAuthenticatedAdminId();
    if (!adminId) {
      return {
        success: false,
        error: 'You must be logged in to update notes',
        code: 'UNAUTHORIZED',
      };
    }

    // Validate input
    const validationResult = updateNoteSchema.safeParse(input);
    if (!validationResult.success) {
      return {
        success: false,
        error: validationResult.error.errors[0]?.message ?? 'Validation failed',
        code: 'VALIDATION_ERROR',
      };
    }

    const data = validationResult.data;

    const adminClient = createAdminClient();
    const service = new NoteService(adminClient);

    // Verify note belongs to customer
    const belongsToCustomer = await service.belongsToCustomer(id, customerId);
    if (!belongsToCustomer) {
      return {
        success: false,
        error: 'Note not found',
        code: 'NOT_FOUND',
      };
    }

    const note = await service.update(id, data.content);

    // Revalidate customer detail page
    revalidatePath(`/admin/customers/${customerId}`);

    return {
      success: true,
      data: note,
    };
  } catch (error) {
    console.error('Error updating note:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update note',
      code: 'INTERNAL_ERROR',
    };
  }
}

// ============================================================================
// Delete Note
// ============================================================================

/**
 * Deletes a note by ID.
 *
 * Also deletes any attachments linked to the note.
 *
 * @param id - Note UUID
 * @param customerId - Customer UUID (for validation and path revalidation)
 * @returns Success indicator or error
 */
export async function deleteNote(
  id: string,
  customerId: string
): Promise<ActionResult<{ deleted: boolean }>> {
  try {
    const adminId = await getAuthenticatedAdminId();
    if (!adminId) {
      return {
        success: false,
        error: 'You must be logged in to delete notes',
        code: 'UNAUTHORIZED',
      };
    }

    const adminClient = createAdminClient();
    const service = new NoteService(adminClient);

    // Verify note belongs to customer
    const belongsToCustomer = await service.belongsToCustomer(id, customerId);
    if (!belongsToCustomer) {
      return {
        success: false,
        error: 'Note not found',
        code: 'NOT_FOUND',
      };
    }

    const deleted = await service.delete(id);

    if (!deleted) {
      return {
        success: false,
        error: 'Note not found',
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
    console.error('Error deleting note:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete note',
      code: 'INTERNAL_ERROR',
    };
  }
}
