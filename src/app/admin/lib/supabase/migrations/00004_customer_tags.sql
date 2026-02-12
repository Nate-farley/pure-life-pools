-- ============================================================================
-- Migration: 00004_customer_tags.sql
-- Description: Tag catalog for categorizing customers
-- Pool Service CRM - Database Schema
-- ============================================================================

-- ============================================================================
-- Table: customer_tags
-- Description: Tag catalog for categorizing customers. Tags can be assigned
--              to multiple customers via customer_tag_links.
-- ============================================================================
CREATE TABLE customer_tags (
    -- Primary key
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Tag display name (must be unique)
    name TEXT NOT NULL,
    
    -- Hex color for UI display (e.g., #3182ce)
    color TEXT NOT NULL DEFAULT '#3182ce',
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT customer_tags_name_unique UNIQUE (name),
    CONSTRAINT customer_tags_name_length CHECK (char_length(name) >= 1 AND char_length(name) <= 50),
    CONSTRAINT customer_tags_color_format CHECK (color ~ '^#[0-9A-Fa-f]{6}$')
);

-- ============================================================================
-- Indexes
-- ============================================================================

-- For alphabetical tag listing
CREATE INDEX idx_customer_tags_name ON customer_tags (name);

-- ============================================================================
-- Comments
-- ============================================================================
COMMENT ON TABLE customer_tags IS 'Tag catalog for categorizing customers';
COMMENT ON COLUMN customer_tags.id IS 'Primary key (UUID)';
COMMENT ON COLUMN customer_tags.name IS 'Tag display name (unique, 1-50 chars)';
COMMENT ON COLUMN customer_tags.color IS 'Hex color for UI display (e.g., #3182ce)';
COMMENT ON COLUMN customer_tags.created_at IS 'When the tag was created';
