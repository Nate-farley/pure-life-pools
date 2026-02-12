-- ============================================================================
-- Migration: 00013_audit_log.sql
-- Description: Audit log table for tracking changes (triggers added separately)
-- Pool Service CRM - Database Schema
-- ============================================================================

-- ============================================================================
-- Type: audit_action
-- Description: Enum for audit action types
-- ============================================================================
CREATE TYPE audit_action AS ENUM ('INSERT', 'UPDATE', 'DELETE');

-- ============================================================================
-- Table: audit_log
-- Description: Tracks changes to key entities for compliance and debugging.
--              Audit triggers will be added in a separate migration.
-- ============================================================================
CREATE TABLE audit_log (
    -- Primary key
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- What was changed
    table_name TEXT NOT NULL,
    record_id UUID NOT NULL,
    action audit_action NOT NULL,
    
    -- State before/after change
    old_values JSONB,
    new_values JSONB,
    
    -- Who made the change (NULL for system actions)
    changed_by UUID REFERENCES admins(id) ON DELETE SET NULL,
    
    -- When the change occurred
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT audit_log_table_name_valid CHECK (
        table_name IN (
            'customers',
            'properties', 
            'pools',
            'calendar_events',
            'estimates',
            'communications',
            'customer_notes',
            'customer_attachments',
            'customer_tags',
            'customer_tag_links'
        )
    )
);

-- ============================================================================
-- Indexes
-- ============================================================================

-- For viewing audit history of a specific record
CREATE INDEX idx_audit_log_record ON audit_log (table_name, record_id, created_at DESC);

-- For filtering by table
CREATE INDEX idx_audit_log_table ON audit_log (table_name, created_at DESC);

-- For filtering by action type
CREATE INDEX idx_audit_log_action ON audit_log (action, created_at DESC);

-- For filtering by admin
CREATE INDEX idx_audit_log_changed_by ON audit_log (changed_by, created_at DESC) 
    WHERE changed_by IS NOT NULL;

-- For time-based queries
CREATE INDEX idx_audit_log_created_at ON audit_log (created_at DESC);

-- ============================================================================
-- Comments
-- ============================================================================
COMMENT ON TABLE audit_log IS 'Tracks changes to key entities for compliance and debugging';
COMMENT ON COLUMN audit_log.id IS 'Primary key (UUID)';
COMMENT ON COLUMN audit_log.table_name IS 'Name of the table that was modified';
COMMENT ON COLUMN audit_log.record_id IS 'ID of the record that was modified';
COMMENT ON COLUMN audit_log.action IS 'Type of change: INSERT, UPDATE, DELETE';
COMMENT ON COLUMN audit_log.old_values IS 'Previous state (NULL for INSERT)';
COMMENT ON COLUMN audit_log.new_values IS 'New state (NULL for DELETE)';
COMMENT ON COLUMN audit_log.changed_by IS 'Admin who made the change (NULL for system actions)';
COMMENT ON COLUMN audit_log.created_at IS 'When the change occurred';

-- ============================================================================
-- Note: Audit triggers are excluded from this migration per requirements.
-- They will be added in a separate migration that creates triggers for
-- each audited table to automatically populate this log.
-- ============================================================================
