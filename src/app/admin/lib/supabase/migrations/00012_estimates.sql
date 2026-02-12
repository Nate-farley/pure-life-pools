-- ============================================================================
-- Migration: 00012_estimates.sql
-- Description: Internal-only estimates with JSONB line items
-- Pool Service CRM - Database Schema
-- ============================================================================

-- ============================================================================
-- Type: estimate_status
-- Description: Enum for estimate statuses (internal workflow)
-- ============================================================================
CREATE TYPE estimate_status AS ENUM ('draft', 'sent', 'internal_final', 'converted', 'declined');

-- ============================================================================
-- Table: estimates
-- Description: Internal-only quotes with line items stored as JSONB for
--              flexibility. Totals are auto-calculated via trigger.
-- ============================================================================
CREATE TABLE estimates (
    -- Primary key
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Human-readable estimate number (e.g., EST-0001)
    estimate_number TEXT NOT NULL,
    
    -- Related entities
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    pool_id UUID REFERENCES pools(id) ON DELETE SET NULL,
    
    -- Status workflow
    status estimate_status NOT NULL DEFAULT 'draft',
    
    -- Line items as JSONB array
    -- Structure: [{ id, description, quantity, unit_price_cents, total_cents }]
    line_items JSONB NOT NULL DEFAULT '[]'::jsonb,
    
    -- Calculated totals (in cents to avoid floating point issues)
    subtotal_cents INTEGER NOT NULL DEFAULT 0,
    tax_rate NUMERIC(5,4) NOT NULL DEFAULT 0,
    tax_amount_cents INTEGER NOT NULL DEFAULT 0,
    total_cents INTEGER NOT NULL DEFAULT 0,
    
    -- Additional details
    notes TEXT,
    valid_until DATE,
    
    -- Admin who created
    created_by UUID NOT NULL REFERENCES admins(id) ON DELETE SET NULL,
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT estimates_number_unique UNIQUE (estimate_number),
    CONSTRAINT estimates_number_format CHECK (estimate_number ~ '^EST-\d{4,}$'),
    CONSTRAINT estimates_tax_rate_range CHECK (tax_rate >= 0 AND tax_rate <= 1),
    CONSTRAINT estimates_subtotal_non_negative CHECK (subtotal_cents >= 0),
    CONSTRAINT estimates_tax_non_negative CHECK (tax_amount_cents >= 0),
    CONSTRAINT estimates_total_non_negative CHECK (total_cents >= 0),
    CONSTRAINT estimates_notes_length CHECK (notes IS NULL OR char_length(notes) <= 5000)
);

-- ============================================================================
-- Indexes
-- ============================================================================

-- For listing estimates by customer
CREATE INDEX idx_estimates_customer_id ON estimates (customer_id, created_at DESC);

-- For filtering by status
CREATE INDEX idx_estimates_status ON estimates (status);

-- For finding by estimate number
CREATE INDEX idx_estimates_number ON estimates (estimate_number);

-- For listing by date
CREATE INDEX idx_estimates_created_at ON estimates (created_at DESC);

-- For expiring quotes
CREATE INDEX idx_estimates_valid_until ON estimates (valid_until) 
    WHERE valid_until IS NOT NULL AND status = 'sent';

-- Foreign key indexes
CREATE INDEX idx_estimates_pool_id ON estimates (pool_id) WHERE pool_id IS NOT NULL;
CREATE INDEX idx_estimates_created_by ON estimates (created_by);

-- ============================================================================
-- Functions
-- ============================================================================

-- Generate next estimate number
CREATE OR REPLACE FUNCTION generate_estimate_number()
RETURNS TEXT AS $$
DECLARE
    next_num INTEGER;
    result TEXT;
BEGIN
    -- Get the highest existing number
    SELECT COALESCE(
        MAX(
            NULLIF(regexp_replace(estimate_number, '^EST-0*', ''), '')::INTEGER
        ),
        0
    ) + 1
    INTO next_num
    FROM estimates;
    
    -- Format with leading zeros (minimum 4 digits)
    result := 'EST-' || LPAD(next_num::TEXT, 4, '0');
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Calculate estimate totals from line items
CREATE OR REPLACE FUNCTION calculate_estimate_totals()
RETURNS TRIGGER AS $$
DECLARE
    item JSONB;
    subtotal BIGINT := 0;
    item_quantity NUMERIC;
    item_unit_price INTEGER;
    item_total INTEGER;
BEGIN
    -- Calculate subtotal from line items
    FOR item IN SELECT * FROM jsonb_array_elements(NEW.line_items)
    LOOP
        item_quantity := (item->>'quantity')::NUMERIC;
        item_unit_price := (item->>'unit_price_cents')::INTEGER;
        item_total := ROUND(item_quantity * item_unit_price)::INTEGER;
        subtotal := subtotal + item_total;
    END LOOP;
    
    -- Set calculated values
    NEW.subtotal_cents := subtotal;
    NEW.tax_amount_cents := ROUND(subtotal * NEW.tax_rate)::INTEGER;
    NEW.total_cents := NEW.subtotal_cents + NEW.tax_amount_cents;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- Triggers
-- ============================================================================

-- Auto-generate estimate number on insert
CREATE OR REPLACE FUNCTION set_estimate_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.estimate_number IS NULL OR NEW.estimate_number = '' THEN
        NEW.estimate_number := generate_estimate_number();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_estimates_set_number
    BEFORE INSERT ON estimates
    FOR EACH ROW
    EXECUTE FUNCTION set_estimate_number();

-- Auto-calculate totals on insert/update
CREATE TRIGGER trg_estimates_calculate_totals
    BEFORE INSERT OR UPDATE OF line_items, tax_rate ON estimates
    FOR EACH ROW
    EXECUTE FUNCTION calculate_estimate_totals();

-- Auto-update updated_at timestamp
CREATE TRIGGER trg_estimates_updated_at
    BEFORE UPDATE ON estimates
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- Comments
-- ============================================================================
COMMENT ON TABLE estimates IS 'Internal-only quotes with JSONB line items. Totals auto-calculated.';
COMMENT ON COLUMN estimates.id IS 'Primary key (UUID)';
COMMENT ON COLUMN estimates.estimate_number IS 'Human-readable ID (EST-0001, EST-0002, etc.)';
COMMENT ON COLUMN estimates.customer_id IS 'Related customer (required)';
COMMENT ON COLUMN estimates.pool_id IS 'Related pool (optional)';
COMMENT ON COLUMN estimates.status IS 'Workflow status: draft → sent → internal_final/converted/declined';
COMMENT ON COLUMN estimates.line_items IS 'JSONB array: [{id, description, quantity, unit_price_cents, total_cents}]';
COMMENT ON COLUMN estimates.subtotal_cents IS 'Sum of line item totals (in cents). Auto-calculated.';
COMMENT ON COLUMN estimates.tax_rate IS 'Tax rate as decimal (e.g., 0.07 for 7%)';
COMMENT ON COLUMN estimates.tax_amount_cents IS 'Calculated tax amount (in cents). Auto-calculated.';
COMMENT ON COLUMN estimates.total_cents IS 'Final total including tax (in cents). Auto-calculated.';
COMMENT ON COLUMN estimates.notes IS 'Internal notes (max 5000 chars)';
COMMENT ON COLUMN estimates.valid_until IS 'Quote expiration date';
COMMENT ON COLUMN estimates.created_by IS 'Admin who created the estimate';
COMMENT ON COLUMN estimates.created_at IS 'When the estimate was created';
COMMENT ON COLUMN estimates.updated_at IS 'Last modification timestamp';
COMMENT ON FUNCTION generate_estimate_number() IS 'Generates next sequential estimate number (EST-0001, etc.)';
COMMENT ON FUNCTION calculate_estimate_totals() IS 'Auto-calculates subtotal, tax, and total from line items';
