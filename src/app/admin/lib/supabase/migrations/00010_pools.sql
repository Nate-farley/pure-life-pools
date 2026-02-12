-- ============================================================================
-- Migration: 00010_pools.sql
-- Description: Pool details with 1:1 relationship to properties
-- Pool Service CRM - Database Schema
-- ============================================================================

-- ============================================================================
-- Type: pool_type
-- Description: Enum for pool types
-- ============================================================================
CREATE TYPE pool_type AS ENUM ('inground', 'above_ground', 'spa', 'other');

-- ============================================================================
-- Type: pool_surface_type
-- Description: Enum for pool surface materials
-- ============================================================================
CREATE TYPE pool_surface_type AS ENUM ('plaster', 'pebble', 'tile', 'vinyl', 'fiberglass');

-- ============================================================================
-- Table: pools
-- Description: Pool details for a property. Each property has exactly one pool
--              (enforced by UNIQUE constraint on property_id).
-- ============================================================================
CREATE TABLE pools (
    -- Primary key
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Parent property (1:1 relationship enforced by UNIQUE)
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    
    -- Pool characteristics
    type pool_type NOT NULL,
    surface_type pool_surface_type,
    
    -- Dimensions (all optional, in feet)
    length_ft NUMERIC(6,2),
    width_ft NUMERIC(6,2),
    depth_shallow_ft NUMERIC(4,2),
    depth_deep_ft NUMERIC(4,2),
    
    -- Volume (can be entered or calculated)
    volume_gallons INTEGER,
    
    -- Equipment information
    equipment_notes TEXT,
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT pools_property_unique UNIQUE (property_id), -- Enforces 1:1
    CONSTRAINT pools_length_positive CHECK (length_ft IS NULL OR length_ft > 0),
    CONSTRAINT pools_width_positive CHECK (width_ft IS NULL OR width_ft > 0),
    CONSTRAINT pools_depth_shallow_positive CHECK (depth_shallow_ft IS NULL OR depth_shallow_ft > 0),
    CONSTRAINT pools_depth_deep_positive CHECK (depth_deep_ft IS NULL OR depth_deep_ft > 0),
    CONSTRAINT pools_depth_order CHECK (
        depth_shallow_ft IS NULL OR depth_deep_ft IS NULL 
        OR depth_shallow_ft <= depth_deep_ft
    ),
    CONSTRAINT pools_volume_positive CHECK (volume_gallons IS NULL OR volume_gallons > 0),
    CONSTRAINT pools_equipment_notes_length CHECK (
        equipment_notes IS NULL OR char_length(equipment_notes) <= 2000
    )
);

-- ============================================================================
-- Indexes
-- ============================================================================

-- For looking up pool by property (also enforced as unique)
-- The UNIQUE constraint creates an implicit index

-- For filtering by pool type
CREATE INDEX idx_pools_type ON pools (type);

-- ============================================================================
-- Triggers
-- ============================================================================

-- Auto-update updated_at timestamp
CREATE TRIGGER trg_pools_updated_at
    BEFORE UPDATE ON pools
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- Comments
-- ============================================================================
COMMENT ON TABLE pools IS 'Pool details. Each property has exactly one pool (1:1 relationship).';
COMMENT ON COLUMN pools.id IS 'Primary key (UUID)';
COMMENT ON COLUMN pools.property_id IS 'Parent property (UNIQUE enforces 1:1)';
COMMENT ON COLUMN pools.type IS 'Pool type: inground, above_ground, spa, other';
COMMENT ON COLUMN pools.surface_type IS 'Surface material: plaster, pebble, tile, vinyl, fiberglass';
COMMENT ON COLUMN pools.length_ft IS 'Pool length in feet (optional)';
COMMENT ON COLUMN pools.width_ft IS 'Pool width in feet (optional)';
COMMENT ON COLUMN pools.depth_shallow_ft IS 'Shallow end depth in feet (optional)';
COMMENT ON COLUMN pools.depth_deep_ft IS 'Deep end depth in feet (optional)';
COMMENT ON COLUMN pools.volume_gallons IS 'Pool volume in gallons (optional, can be calculated)';
COMMENT ON COLUMN pools.equipment_notes IS 'Equipment details: pump, filter, heater, etc.';
COMMENT ON COLUMN pools.created_at IS 'When the pool record was created';
COMMENT ON COLUMN pools.updated_at IS 'Last modification timestamp';
