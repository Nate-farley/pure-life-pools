/**
 * Pool Service CRM - Database Types
 *
 * These types are manually authored to match the database schema.
 * After running migrations, regenerate with:
 *   npx supabase gen types typescript --linked > src/lib/database.types.ts
 *
 * This file serves as the reference implementation and can be used
 * before the database is set up.
 */

// =============================================================================
// Enums
// =============================================================================

export type CommunicationType = 'call' | 'text' | 'email';
export type CommunicationDirection = 'inbound' | 'outbound';
export type PoolType = 'inground' | 'above_ground' | 'spa' | 'other';
export type PoolSurfaceType = 'plaster' | 'pebble' | 'tile' | 'vinyl' | 'fiberglass';
export type CalendarEventType = 'consultation' | 'estimate_visit' | 'follow_up' | 'other';
export type CalendarEventStatus = 'scheduled' | 'completed' | 'canceled';
export type EstimateStatus = 'draft' | 'sent' | 'internal_final' | 'converted' | 'declined';
export type AuditAction = 'INSERT' | 'UPDATE' | 'DELETE';

// =============================================================================
// Table Row Types
// =============================================================================

export interface Admin {
  id: string;
  email: string;
  full_name: string;
  created_at: string;
  updated_at: string;
}

export interface Customer {
  id: string;
  phone: string;
  phone_normalized: string;
  name: string;
  email: string | null;
  source: string | null;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

export interface CustomerTag {
  id: string;
  name: string;
  color: string;
  created_at: string;
}

export interface CustomerTagLink {
  customer_id: string;
  tag_id: string;
  created_at: string;
}

export interface CustomerNote {
  id: string;
  customer_id: string;
  content: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface CustomerAttachment {
  id: string;
  customer_id: string;
  storage_path: string;
  filename: string;
  content_type: string;
  size_bytes: number;
  note_id: string | null;
  uploaded_by: string;
  created_at: string;
}

export interface Communication {
  id: string;
  customer_id: string;
  type: CommunicationType;
  direction: CommunicationDirection;
  summary: string;
  occurred_at: string;
  logged_by: string;
  created_at: string;
  search_vector: unknown; // tsvector - typically not used directly
}

export interface Property {
  id: string;
  customer_id: string;
  address_line1: string;
  address_line2: string | null;
  city: string;
  state: string;
  zip_code: string;
  gate_code: string | null;
  access_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Pool {
  id: string;
  property_id: string;
  type: PoolType;
  surface_type: PoolSurfaceType | null;
  length_ft: number | null;
  width_ft: number | null;
  depth_shallow_ft: number | null;
  depth_deep_ft: number | null;
  volume_gallons: number | null;
  equipment_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface CalendarEvent {
  id: string;
  customer_id: string;
  property_id: string | null;
  pool_id: string | null;
  title: string;
  description: string | null;
  event_type: CalendarEventType;
  status: CalendarEventStatus;
  start_datetime: string;
  end_datetime: string;
  all_day: boolean;
  location_url: string | null;
  reminder_24h_sent: boolean;
  reminder_2h_sent: boolean;
  created_by: string;
  version: number;
  created_at: string;
  updated_at: string;
}

export interface EstimateLineItem {
  id: string;
  description: string;
  quantity: number;
  unit_price_cents: number;
  total_cents?: number; // Calculated field
}

export interface Estimate {
  id: string;
  estimate_number: string;
  customer_id: string;
  pool_id: string | null;
  status: EstimateStatus;
  line_items: EstimateLineItem[];
  subtotal_cents: number;
  tax_rate: number;
  tax_amount_cents: number;
  total_cents: number;
  notes: string | null;
  valid_until: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface AuditLog {
  id: string;
  table_name: string;
  record_id: string;
  action: AuditAction;
  old_values: Record<string, unknown> | null;
  new_values: Record<string, unknown> | null;
  changed_by: string | null;
  created_at: string;
}

// =============================================================================
// Insert Types (for creating new records)
// =============================================================================

export interface AdminInsert {
  id: string; // Must match Supabase Auth user ID
  email: string;
  full_name: string;
  created_at?: string;
  updated_at?: string;
}

export interface CustomerInsert {
  id?: string;
  phone: string;
  name: string;
  email?: string | null;
  source?: string | null;
  deleted_at?: string | null;
  created_by?: string | null;
}

export interface CustomerTagInsert {
  id?: string;
  name: string;
  color?: string;
}

export interface CustomerTagLinkInsert {
  customer_id: string;
  tag_id: string;
}

export interface CustomerNoteInsert {
  id?: string;
  customer_id: string;
  content: string;
  created_by: string;
}

export interface CustomerAttachmentInsert {
  id?: string;
  customer_id: string;
  storage_path: string;
  filename: string;
  content_type: string;
  size_bytes: number;
  note_id?: string | null;
  uploaded_by: string;
}

export interface CommunicationInsert {
  id?: string;
  customer_id: string;
  type: CommunicationType;
  direction: CommunicationDirection;
  summary: string;
  occurred_at: string;
  logged_by: string;
}

export interface PropertyInsert {
  id?: string;
  customer_id: string;
  address_line1: string;
  address_line2?: string | null;
  city: string;
  state: string;
  zip_code: string;
  gate_code?: string | null;
  access_notes?: string | null;
}

export interface PoolInsert {
  id?: string;
  property_id: string;
  type: PoolType;
  surface_type?: PoolSurfaceType | null;
  length_ft?: number | null;
  width_ft?: number | null;
  depth_shallow_ft?: number | null;
  depth_deep_ft?: number | null;
  volume_gallons?: number | null;
  equipment_notes?: string | null;
}

export interface CalendarEventInsert {
  id?: string;
  customer_id: string;
  property_id?: string | null;
  pool_id?: string | null;
  title: string;
  description?: string | null;
  event_type: CalendarEventType;
  status?: CalendarEventStatus;
  start_datetime: string;
  end_datetime: string;
  all_day?: boolean;
  location_url?: string | null;
  created_by: string;
}

export interface EstimateInsert {
  id?: string;
  estimate_number?: string; // Auto-generated if not provided
  customer_id: string;
  pool_id?: string | null;
  status?: EstimateStatus;
  line_items: EstimateLineItem[];
  tax_rate?: number;
  notes?: string | null;
  valid_until?: string | null;
  created_by: string;
}

// =============================================================================
// Update Types (for updating existing records)
// =============================================================================

export interface CustomerUpdate {
  phone?: string;
  name?: string;
  email?: string | null;
  source?: string | null;
  deleted_at?: string | null;
}

export interface CustomerTagUpdate {
  name?: string;
  color?: string;
}

export interface CustomerNoteUpdate {
  content?: string;
}

export interface CommunicationUpdate {
  summary?: string;
  occurred_at?: string;
}

export interface PropertyUpdate {
  address_line1?: string;
  address_line2?: string | null;
  city?: string;
  state?: string;
  zip_code?: string;
  gate_code?: string | null;
  access_notes?: string | null;
}

export interface PoolUpdate {
  type?: PoolType;
  surface_type?: PoolSurfaceType | null;
  length_ft?: number | null;
  width_ft?: number | null;
  depth_shallow_ft?: number | null;
  depth_deep_ft?: number | null;
  volume_gallons?: number | null;
  equipment_notes?: string | null;
}

export interface CalendarEventUpdate {
  property_id?: string | null;
  pool_id?: string | null;
  title?: string;
  description?: string | null;
  event_type?: CalendarEventType;
  status?: CalendarEventStatus;
  start_datetime?: string;
  end_datetime?: string;
  all_day?: boolean;
  location_url?: string | null;
  version?: number; // For optimistic locking
}

export interface EstimateUpdate {
  pool_id?: string | null;
  status?: EstimateStatus;
  line_items?: EstimateLineItem[];
  tax_rate?: number;
  notes?: string | null;
  valid_until?: string | null;
}

// =============================================================================
// Supabase Database Type (for client initialization)
// =============================================================================

export interface Database {
  public: {
    Tables: {
      admins: {
        Row: Admin;
        Insert: AdminInsert;
        Update: Partial<AdminInsert>;
      };
      customers: {
        Row: Customer;
        Insert: CustomerInsert;
        Update: CustomerUpdate;
      };
      customer_tags: {
        Row: CustomerTag;
        Insert: CustomerTagInsert;
        Update: CustomerTagUpdate;
      };
      customer_tag_links: {
        Row: CustomerTagLink;
        Insert: CustomerTagLinkInsert;
        Update: never; // Junction table - delete and recreate
      };
      customer_notes: {
        Row: CustomerNote;
        Insert: CustomerNoteInsert;
        Update: CustomerNoteUpdate;
      };
      customer_attachments: {
        Row: CustomerAttachment;
        Insert: CustomerAttachmentInsert;
        Update: never; // Attachments are immutable
      };
      communications: {
        Row: Communication;
        Insert: CommunicationInsert;
        Update: CommunicationUpdate;
      };
      properties: {
        Row: Property;
        Insert: PropertyInsert;
        Update: PropertyUpdate;
      };
      pools: {
        Row: Pool;
        Insert: PoolInsert;
        Update: PoolUpdate;
      };
      calendar_events: {
        Row: CalendarEvent;
        Insert: CalendarEventInsert;
        Update: CalendarEventUpdate;
      };
      estimates: {
        Row: Estimate;
        Insert: EstimateInsert;
        Update: EstimateUpdate;
      };
      audit_log: {
        Row: AuditLog;
        Insert: never; // Populated by triggers only
        Update: never; // Immutable
      };
    };
    Enums: {
      communication_type: CommunicationType;
      communication_direction: CommunicationDirection;
      pool_type: PoolType;
      pool_surface_type: PoolSurfaceType;
      calendar_event_type: CalendarEventType;
      calendar_event_status: CalendarEventStatus;
      estimate_status: EstimateStatus;
      audit_action: AuditAction;
    };
    Functions: {
      normalize_phone: {
        Args: { phone_input: string };
        Returns: string;
      };
      generate_estimate_number: {
        Args: Record<string, never>;
        Returns: string;
      };
    };
  };
}

// =============================================================================
// Utility Types
// =============================================================================

/**
 * Customer with related data for detail views
 */
export interface CustomerWithRelations extends Customer {
  properties?: (Property & { pool?: Pool })[];
  tags?: CustomerTag[];
  notes?: CustomerNote[];
  communications?: Communication[];
  attachments?: CustomerAttachment[];
  estimates?: Estimate[];
  events?: CalendarEvent[];
}

/**
 * Calendar event with customer info for calendar display
 */
export interface CalendarEventWithCustomer extends CalendarEvent {
  customer: Pick<Customer, 'id' | 'name' | 'phone'>;
  property?: Pick<Property, 'id' | 'address_line1' | 'city'>;
}

/**
 * Estimate with customer and pool info
 */
export interface EstimateWithRelations extends Estimate {
  customer: Pick<Customer, 'id' | 'name' | 'phone' | 'email'>;
  pool?: Pool & { property?: Property };
}

/**
 * Tag with customer count for tag management
 */
export interface CustomerTagWithCount extends CustomerTag {
  customer_count: number;
}

/**
 * Pagination cursor for cursor-based pagination
 */
export interface PaginationCursor {
  updated_at: string;
  id: string;
}

/**
 * Paginated result wrapper
 */
export interface PaginatedResult<T> {
  items: T[];
  has_more: boolean;
  next_cursor: string | null;
}
