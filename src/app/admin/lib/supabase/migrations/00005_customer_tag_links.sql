-- ============================================================================
-- Migration: 00005_customer_tag_links.sql
-- Description: Many-to-many relationship between customers and tags
-- Pool Service CRM - Database Schema
-- ============================================================================

-- ============================================================================
-- Table: customer_tag_links
-- Description: Junction table linking customers to tags. Composite primary key
--              prevents duplicate assignments.
-- ============================================================================
CREATE TABLE customer_tag_links (
    -- Composite primary key
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES customer_tags(id) ON DELETE CASCADE,
    
    -- When the tag was assigned
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Composite primary key
    PRIMARY KEY (customer_id, tag_id)
);

-- ============================================================================
-- Indexes
-- ============================================================================

-- For listing tags by customer (covered by PK)
-- For listing customers by tag
CREATE INDEX idx_customer_tag_links_tag_id ON customer_tag_links (tag_id);

-- ============================================================================
-- Comments
-- ============================================================================
COMMENT ON TABLE customer_tag_links IS 'Many-to-many junction between customers and tags';
COMMENT ON COLUMN customer_tag_links.customer_id IS 'Customer being tagged';
COMMENT ON COLUMN customer_tag_links.tag_id IS 'Tag being assigned';
COMMENT ON COLUMN customer_tag_links.created_at IS 'When the tag was assigned to this customer';
