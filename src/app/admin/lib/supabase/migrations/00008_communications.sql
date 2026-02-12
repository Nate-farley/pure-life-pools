-- ============================================================================
-- Migration: 00008_communications.sql
-- Description: Communication history log with full-text search
-- Pool Service CRM - Database Schema
-- ============================================================================

-- ============================================================================
-- Type: communication_type
-- Description: Enum for communication channel types
-- ============================================================================
CREATE TYPE communication_type AS ENUM ('call', 'text', 'email');

-- ============================================================================
-- Type: communication_direction
-- Description: Enum for communication direction
-- ============================================================================
CREATE TYPE communication_direction AS ENUM ('inbound', 'outbound');

-- ============================================================================
-- Table: communications
-- Description: Manual interaction log for calls, texts, and emails with
--              customers. Supports full-text search on summary field.
-- ============================================================================
CREATE TABLE communications (
    -- Primary key
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Related customer (required)
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    
    -- Communication details
    type communication_type NOT NULL,
    direction communication_direction NOT NULL,
    summary TEXT NOT NULL,
    
    -- When the interaction occurred (not when it was logged)
    occurred_at TIMESTAMPTZ NOT NULL,
    
    -- Admin who logged this communication
    logged_by UUID NOT NULL REFERENCES admins(id) ON DELETE SET NULL,
    
    -- Record creation timestamp
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Full-text search vector (auto-generated)
    search_vector TSVECTOR GENERATED ALWAYS AS (to_tsvector('english', summary)) STORED,
    
    -- Constraints
    CONSTRAINT communications_summary_not_empty CHECK (char_length(trim(summary)) >= 1),
    CONSTRAINT communications_summary_max_length CHECK (char_length(summary) <= 5000)
);

-- ============================================================================
-- Indexes
-- ============================================================================

-- For listing communications by customer (most recent first)
CREATE INDEX idx_communications_customer_id ON communications (customer_id, occurred_at DESC);

-- Full-text search on summary
CREATE INDEX idx_communications_fts ON communications USING gin(search_vector);

-- For filtering by type and direction
CREATE INDEX idx_communications_type ON communications (type);
CREATE INDEX idx_communications_direction ON communications (direction);

-- For listing by date range
CREATE INDEX idx_communications_occurred_at ON communications (occurred_at DESC);

-- For listing by who logged
CREATE INDEX idx_communications_logged_by ON communications (logged_by);

-- ============================================================================
-- Comments
-- ============================================================================
COMMENT ON TABLE communications IS 'Manual log of customer interactions (calls, texts, emails)';
COMMENT ON COLUMN communications.id IS 'Primary key (UUID)';
COMMENT ON COLUMN communications.customer_id IS 'Customer this communication is about';
COMMENT ON COLUMN communications.type IS 'Communication channel: call, text, email';
COMMENT ON COLUMN communications.direction IS 'Whether inbound (from customer) or outbound (to customer)';
COMMENT ON COLUMN communications.summary IS 'Description of the interaction (searchable)';
COMMENT ON COLUMN communications.occurred_at IS 'When the interaction actually happened';
COMMENT ON COLUMN communications.logged_by IS 'Admin who recorded this communication';
COMMENT ON COLUMN communications.created_at IS 'When this record was created in the system';
COMMENT ON COLUMN communications.search_vector IS 'Auto-generated tsvector for full-text search';
