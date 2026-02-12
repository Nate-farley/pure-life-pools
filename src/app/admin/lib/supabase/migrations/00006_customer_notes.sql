-- ============================================================================
-- Migration: 00006_customer_notes.sql
-- Description: Customer notes with admin authorship tracking
-- Pool Service CRM - Database Schema
-- ============================================================================

-- ============================================================================
-- Table: customer_notes
-- Description: Internal notes attached to customers. Notes track authorship
--              and support editing history via timestamps.
-- ============================================================================
CREATE TABLE customer_notes (
    -- Primary key
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Parent customer (required)
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    
    -- Note content
    content TEXT NOT NULL,
    
    -- Admin who created the note
    created_by UUID NOT NULL REFERENCES admins(id) ON DELETE SET NULL,
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT customer_notes_content_not_empty CHECK (char_length(trim(content)) >= 1),
    CONSTRAINT customer_notes_content_max_length CHECK (char_length(content) <= 10000)
);

-- ============================================================================
-- Indexes
-- ============================================================================

-- For listing notes by customer (most recent first)
CREATE INDEX idx_customer_notes_customer_id ON customer_notes (customer_id, created_at DESC);

-- For listing notes by author
CREATE INDEX idx_customer_notes_created_by ON customer_notes (created_by);

-- ============================================================================
-- Triggers
-- ============================================================================

-- Auto-update updated_at timestamp
CREATE TRIGGER trg_customer_notes_updated_at
    BEFORE UPDATE ON customer_notes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- Comments
-- ============================================================================
COMMENT ON TABLE customer_notes IS 'Internal notes attached to customers';
COMMENT ON COLUMN customer_notes.id IS 'Primary key (UUID)';
COMMENT ON COLUMN customer_notes.customer_id IS 'Parent customer this note belongs to';
COMMENT ON COLUMN customer_notes.content IS 'Note text content (max 10,000 chars)';
COMMENT ON COLUMN customer_notes.created_by IS 'Admin who authored this note';
COMMENT ON COLUMN customer_notes.created_at IS 'When the note was created';
COMMENT ON COLUMN customer_notes.updated_at IS 'Last edit timestamp';
