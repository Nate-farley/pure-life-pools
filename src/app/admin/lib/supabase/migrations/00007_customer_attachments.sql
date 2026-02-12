-- ============================================================================
-- Migration: 00007_customer_attachments.sql
-- Description: File attachment metadata for customer records
-- Pool Service CRM - Database Schema
-- ============================================================================

-- ============================================================================
-- Table: customer_attachments
-- Description: Metadata for files stored in Supabase Storage. Attachments
--              can be linked to customers and optionally to specific notes.
-- Allowed types: JPEG, PNG, WebP, PDF (10MB max)
-- Storage path convention: {customer_id}/{uuid}.{ext}
-- ============================================================================
CREATE TABLE customer_attachments (
    -- Primary key
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Parent customer (required)
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    
    -- Supabase Storage path
    storage_path TEXT NOT NULL,
    
    -- Original filename for display
    filename TEXT NOT NULL,
    
    -- MIME type for rendering
    content_type TEXT NOT NULL,
    
    -- File size for quota tracking
    size_bytes INTEGER NOT NULL,
    
    -- Optional link to a note
    note_id UUID REFERENCES customer_notes(id) ON DELETE SET NULL,
    
    -- Admin who uploaded
    uploaded_by UUID NOT NULL REFERENCES admins(id) ON DELETE SET NULL,
    
    -- Upload timestamp
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT customer_attachments_storage_path_unique UNIQUE (storage_path),
    CONSTRAINT customer_attachments_filename_length CHECK (char_length(filename) >= 1 AND char_length(filename) <= 255),
    CONSTRAINT customer_attachments_content_type_allowed CHECK (
        content_type IN ('image/jpeg', 'image/png', 'image/webp', 'application/pdf')
    ),
    CONSTRAINT customer_attachments_size_limit CHECK (size_bytes > 0 AND size_bytes <= 10485760) -- 10MB max
);

-- ============================================================================
-- Indexes
-- ============================================================================

-- For listing attachments by customer
CREATE INDEX idx_customer_attachments_customer_id ON customer_attachments (customer_id, created_at DESC);

-- For listing attachments by note
CREATE INDEX idx_customer_attachments_note_id ON customer_attachments (note_id) 
    WHERE note_id IS NOT NULL;

-- For storage cleanup queries
CREATE INDEX idx_customer_attachments_storage_path ON customer_attachments (storage_path);

-- ============================================================================
-- Comments
-- ============================================================================
COMMENT ON TABLE customer_attachments IS 'File attachment metadata. Files stored in Supabase Storage.';
COMMENT ON COLUMN customer_attachments.id IS 'Primary key (UUID)';
COMMENT ON COLUMN customer_attachments.customer_id IS 'Parent customer this attachment belongs to';
COMMENT ON COLUMN customer_attachments.storage_path IS 'Path in Supabase Storage bucket: {customer_id}/{uuid}.{ext}';
COMMENT ON COLUMN customer_attachments.filename IS 'Original filename for display purposes';
COMMENT ON COLUMN customer_attachments.content_type IS 'MIME type: image/jpeg, image/png, image/webp, application/pdf';
COMMENT ON COLUMN customer_attachments.size_bytes IS 'File size in bytes (max 10MB)';
COMMENT ON COLUMN customer_attachments.note_id IS 'Optional link to a customer note';
COMMENT ON COLUMN customer_attachments.uploaded_by IS 'Admin who uploaded this file';
COMMENT ON COLUMN customer_attachments.created_at IS 'Upload timestamp';
