/**
 * Note Service
 *
 * Service layer for all customer note-related database operations.
 * Handles CRUD operations for notes with author tracking.
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database, CustomerNote, CustomerAttachment, Admin } from '@/lib/types/database';

type DbClient = SupabaseClient<Database>;

/**
 * Note with author information
 */
export interface NoteWithAuthor extends CustomerNote {
  author: {
    id: string;
    full_name: string;
    email: string;
  } | null;
}

/**
 * Note with author and attachments
 */
export interface NoteWithDetails extends NoteWithAuthor {
  attachments: CustomerAttachment[];
}

/**
 * Note list result with pagination info
 */
export interface NoteListResult {
  notes: NoteWithAuthor[];
  hasMore: boolean;
  nextCursor: string | null;
}

export class NoteService {
  constructor(private supabase: DbClient) {}

  /**
   * Creates a new note for a customer.
   *
   * @param input - Note creation data
   * @param adminId - ID of the admin creating the note
   * @returns Created note with author info
   */
  async create(
    input: {
      customerId: string;
      content: string;
    },
    adminId: string
  ): Promise<NoteWithAuthor> {
    const { data, error } = await this.supabase
      .from('customer_notes')
      .insert({
        customer_id: input.customerId,
        content: input.content,
        created_by: adminId,
      })
      .select(`
        *,
        admins!customer_notes_created_by_fkey (
          id,
          full_name,
          email
        )
      `)
      .single();

    if (error) {
      console.error('Error creating note:', error);
      throw new Error(`Failed to create note: ${error.message}`);
    }

    // Transform the nested admin data
    const { admins, ...noteData } = data as any;
    return {
      ...noteData,
      author: admins,
    };
  }

  /**
   * Gets a note by ID with author and attachments.
   *
   * @param id - Note UUID
   * @returns Note with details or null if not found
   */
  async getById(id: string): Promise<NoteWithDetails | null> {
    const { data, error } = await this.supabase
      .from('customer_notes')
      .select(`
        *,
        admins!customer_notes_created_by_fkey (
          id,
          full_name,
          email
        ),
        customer_attachments (
          id,
          storage_path,
          filename,
          content_type,
          size_bytes,
          uploaded_by,
          created_at
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code !== 'PGRST116') {
        console.error('Error fetching note:', error);
      }
      return null;
    }

    // Transform the nested data
    const { admins, customer_attachments, ...noteData } = data as any;
    return {
      ...noteData,
      author: admins,
      attachments: customer_attachments ?? [],
    };
  }

  /**
   * Lists notes for a customer with pagination.
   *
   * @param customerId - Customer UUID
   * @param options - Pagination options
   * @returns List of notes with author info
   */
  async listByCustomer(
    customerId: string,
    options: {
      limit?: number;
      cursor?: string;
    } = {}
  ): Promise<NoteListResult> {
    const { limit = 25, cursor } = options;

    let query = this.supabase
      .from('customer_notes')
      .select(`
        *,
        admins!customer_notes_created_by_fkey (
          id,
          full_name,
          email
        )
      `)
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false })
      .limit(limit + 1);

    // Apply cursor-based pagination
    if (cursor) {
      try {
        const decoded = JSON.parse(Buffer.from(cursor, 'base64').toString());
        query = query.lt('created_at', decoded.createdAt);
      } catch (e) {
        // Invalid cursor, ignore
      }
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error listing notes:', error);
      throw new Error(`Failed to list notes: ${error.message}`);
    }

    const hasMore = data.length > limit;
    const notes = hasMore ? data.slice(0, -1) : data;

    // Transform the nested admin data
    const transformedNotes: NoteWithAuthor[] = notes.map((note: any) => {
      const { admins, ...noteData } = note;
      return {
        ...noteData,
        author: admins,
      };
    });

    // Generate next cursor
    let nextCursor: string | null = null;
    if (hasMore && notes.length > 0) {
      const lastNote = notes[notes.length - 1];
      nextCursor = Buffer.from(
        JSON.stringify({ createdAt: lastNote.created_at })
      ).toString('base64');
    }

    return {
      notes: transformedNotes,
      hasMore,
      nextCursor,
    };
  }

  /**
   * Updates a note's content.
   *
   * @param id - Note UUID
   * @param content - New note content
   * @returns Updated note with author info
   */
  async update(id: string, content: string): Promise<NoteWithAuthor> {
    const { data, error } = await this.supabase
      .from('customer_notes')
      .update({ content })
      .eq('id', id)
      .select(`
        *,
        admins!customer_notes_created_by_fkey (
          id,
          full_name,
          email
        )
      `)
      .single();

    if (error) {
      console.error('Error updating note:', error);
      throw new Error(`Failed to update note: ${error.message}`);
    }

    // Transform the nested admin data
    const { admins, ...noteData } = data as any;
    return {
      ...noteData,
      author: admins,
    };
  }

  /**
   * Deletes a note by ID.
   *
   * Also deletes any attachments linked to the note.
   *
   * @param id - Note UUID
   * @returns true if deleted, false if not found
   */
  async delete(id: string): Promise<boolean> {
    // First, get any attachments linked to this note
    const { data: attachments } = await this.supabase
      .from('customer_attachments')
      .select('storage_path')
      .eq('note_id', id);

    // Delete attachments from storage if any
    if (attachments && attachments.length > 0) {
      const paths = attachments.map((a) => a.storage_path);
      await this.supabase.storage.from('customer-attachments').remove(paths);

      // Delete attachment records
      await this.supabase
        .from('customer_attachments')
        .delete()
        .eq('note_id', id);
    }

    // Delete the note
    const { error, count } = await this.supabase
      .from('customer_notes')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting note:', error);
      throw new Error(`Failed to delete note: ${error.message}`);
    }

    return (count ?? 0) > 0;
  }

  /**
   * Checks if a customer exists.
   *
   * @param customerId - Customer UUID
   * @returns true if customer exists and is not deleted
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
   * Checks if a note belongs to a specific customer.
   *
   * @param noteId - Note UUID
   * @param customerId - Customer UUID
   * @returns true if note belongs to customer
   */
  async belongsToCustomer(noteId: string, customerId: string): Promise<boolean> {
    const { data, error } = await this.supabase
      .from('customer_notes')
      .select('id')
      .eq('id', noteId)
      .eq('customer_id', customerId)
      .single();

    return !error && !!data;
  }

  /**
   * Gets the customer ID for a note.
   *
   * @param noteId - Note UUID
   * @returns Customer ID or null
   */
  async getCustomerId(noteId: string): Promise<string | null> {
    const { data, error } = await this.supabase
      .from('customer_notes')
      .select('customer_id')
      .eq('id', noteId)
      .single();

    if (error || !data) {
      return null;
    }

    return data.customer_id;
  }
}
