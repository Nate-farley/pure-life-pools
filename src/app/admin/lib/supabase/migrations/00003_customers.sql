-- ============================================================================
-- Migration: 00003_customers.sql
-- Description: Core customer entity with phone normalization
-- Pool Service CRM - Database Schema
-- ============================================================================

-- ============================================================================
-- Table: customers
-- Description: Core customer entity. Phone number is the primary business
--              identifier for search and deduplication.
-- ============================================================================
CREATE TABLE customers (
    -- Primary key
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Phone number (primary business identifier)
    phone TEXT NOT NULL,
    phone_normalized TEXT NOT NULL,
    
    -- Customer details
    name TEXT NOT NULL,
    email TEXT,
    source TEXT,
    
    -- Soft delete support
    deleted_at TIMESTAMPTZ,
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Admin who created the record
    created_by UUID REFERENCES admins(id) ON DELETE SET NULL,
    
    -- Constraints
    CONSTRAINT customers_phone_length CHECK (char_length(phone) >= 7 AND char_length(phone) <= 30),
    CONSTRAINT customers_phone_normalized_format CHECK (phone_normalized ~ '^\+?[0-9]+$'),
    CONSTRAINT customers_name_length CHECK (char_length(name) >= 1 AND char_length(name) <= 200),
    CONSTRAINT customers_email_format CHECK (
        email IS NULL 
        OR email = '' 
        OR email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
    ),
    CONSTRAINT customers_source_length CHECK (source IS NULL OR char_length(source) <= 100)
);

-- ============================================================================
-- Indexes
-- ============================================================================

-- Trigram index for fuzzy phone search (partial matching)
CREATE INDEX idx_customers_phone_trgm ON customers 
    USING gin (phone_normalized gin_trgm_ops);

-- Trigram index for fuzzy name search
CREATE INDEX idx_customers_name_trgm ON customers 
    USING gin (name gin_trgm_ops);

-- Exact match on normalized phone (fastest for lookups)
CREATE INDEX idx_customers_phone_normalized ON customers (phone_normalized);

-- Filter for active (non-deleted) customers
CREATE INDEX idx_customers_active ON customers (id) 
    WHERE deleted_at IS NULL;

-- Sort by updated_at for pagination
CREATE INDEX idx_customers_updated_at ON customers (updated_at DESC);

-- Foreign key index
CREATE INDEX idx_customers_created_by ON customers (created_by);

-- ============================================================================
-- Functions
-- ============================================================================

-- Phone normalization function: converts various formats to E.164
-- Handles: (555) 123-4567, 555-123-4567, 5551234567, +1 555 123 4567
CREATE OR REPLACE FUNCTION normalize_phone(phone_input TEXT)
RETURNS TEXT AS $$
DECLARE
    digits TEXT;
BEGIN
    -- Extract only digits
    digits := regexp_replace(phone_input, '[^0-9]', '', 'g');
    
    -- Handle different lengths
    IF char_length(digits) = 10 THEN
        -- US number without country code: add +1
        RETURN '+1' || digits;
    ELSIF char_length(digits) = 11 AND digits LIKE '1%' THEN
        -- US number with country code 1: add +
        RETURN '+' || digits;
    ELSIF char_length(digits) >= 7 THEN
        -- International or other: keep as-is with +
        IF phone_input LIKE '+%' THEN
            RETURN '+' || digits;
        ELSE
            RETURN '+1' || digits; -- Default to US
        END IF;
    ELSE
        -- Too short to normalize, store digits only
        RETURN digits;
    END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ============================================================================
-- Triggers
-- ============================================================================

-- Auto-normalize phone number on insert/update
CREATE OR REPLACE FUNCTION normalize_customer_phone()
RETURNS TRIGGER AS $$
BEGIN
    NEW.phone_normalized := normalize_phone(NEW.phone);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_customers_normalize_phone
    BEFORE INSERT OR UPDATE OF phone ON customers
    FOR EACH ROW
    EXECUTE FUNCTION normalize_customer_phone();

-- Auto-update updated_at timestamp
CREATE TRIGGER trg_customers_updated_at
    BEFORE UPDATE ON customers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- Comments
-- ============================================================================
COMMENT ON TABLE customers IS 'Core customer entity. Phone is primary identifier for search/dedup.';
COMMENT ON COLUMN customers.id IS 'Primary key (UUID)';
COMMENT ON COLUMN customers.phone IS 'Phone number in original format as entered';
COMMENT ON COLUMN customers.phone_normalized IS 'E.164 normalized phone for search. Auto-generated.';
COMMENT ON COLUMN customers.name IS 'Customer full name';
COMMENT ON COLUMN customers.email IS 'Optional email address';
COMMENT ON COLUMN customers.source IS 'Lead source (referral, website, phone, walk-in, other)';
COMMENT ON COLUMN customers.deleted_at IS 'Soft delete timestamp. NULL = active.';
COMMENT ON COLUMN customers.created_by IS 'Admin who created this customer record';
COMMENT ON FUNCTION normalize_phone(TEXT) IS 'Converts phone numbers to E.164 format';
