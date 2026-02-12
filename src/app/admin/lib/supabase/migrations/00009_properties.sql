-- ============================================================================
-- Migration: 00009_properties.sql
-- Description: Customer properties (service locations)
-- Pool Service CRM - Database Schema
-- ============================================================================

-- ============================================================================
-- Table: properties
-- Description: Physical locations belonging to customers. Each customer can
--              have multiple properties. Each property has exactly one pool
--              (enforced in pools table).
-- ============================================================================
CREATE TABLE properties (
    -- Primary key
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Owner customer (required)
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    
    -- Address fields
    address_line1 TEXT NOT NULL,
    address_line2 TEXT,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    zip_code TEXT NOT NULL,
    
    -- Access information
    gate_code TEXT,
    access_notes TEXT,
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT properties_address_line1_length CHECK (
        char_length(address_line1) >= 1 AND char_length(address_line1) <= 200
    ),
    CONSTRAINT properties_address_line2_length CHECK (
        address_line2 IS NULL OR char_length(address_line2) <= 100
    ),
    CONSTRAINT properties_city_length CHECK (
        char_length(city) >= 1 AND char_length(city) <= 100
    ),
    CONSTRAINT properties_state_format CHECK (
        state ~ '^[A-Z]{2}$'
    ),
    CONSTRAINT properties_zip_code_format CHECK (
        zip_code ~ '^\d{5}(-\d{4})?$'
    ),
    CONSTRAINT properties_gate_code_length CHECK (
        gate_code IS NULL OR char_length(gate_code) <= 20
    ),
    CONSTRAINT properties_access_notes_length CHECK (
        access_notes IS NULL OR char_length(access_notes) <= 500
    )
);

-- ============================================================================
-- Indexes
-- ============================================================================

-- For listing properties by customer
CREATE INDEX idx_properties_customer_id ON properties (customer_id);

-- For searching by address
CREATE INDEX idx_properties_address_trgm ON properties 
    USING gin ((address_line1 || ' ' || city || ' ' || state || ' ' || zip_code) gin_trgm_ops);

-- For filtering by state/city
CREATE INDEX idx_properties_location ON properties (state, city);

-- ============================================================================
-- Triggers
-- ============================================================================

-- Auto-update updated_at timestamp
CREATE TRIGGER trg_properties_updated_at
    BEFORE UPDATE ON properties
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- Comments
-- ============================================================================
COMMENT ON TABLE properties IS 'Customer properties (service locations). One customer can have many.';
COMMENT ON COLUMN properties.id IS 'Primary key (UUID)';
COMMENT ON COLUMN properties.customer_id IS 'Owner customer';
COMMENT ON COLUMN properties.address_line1 IS 'Street address (required)';
COMMENT ON COLUMN properties.address_line2 IS 'Apartment, suite, unit, etc. (optional)';
COMMENT ON COLUMN properties.city IS 'City name (required)';
COMMENT ON COLUMN properties.state IS 'US state code, 2 uppercase letters (required)';
COMMENT ON COLUMN properties.zip_code IS 'ZIP code: 5 digits or 5+4 format (required)';
COMMENT ON COLUMN properties.gate_code IS 'Access gate code (optional, max 20 chars)';
COMMENT ON COLUMN properties.access_notes IS 'Property access instructions (optional, max 500 chars)';
COMMENT ON COLUMN properties.created_at IS 'When the property was added';
COMMENT ON COLUMN properties.updated_at IS 'Last modification timestamp';
