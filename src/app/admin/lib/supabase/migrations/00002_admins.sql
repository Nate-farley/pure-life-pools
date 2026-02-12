-- ============================================================================
-- Migration: 00002_admins.sql
-- Description: Admin users table linking to Supabase Auth
-- Pool Service CRM - Database Schema
-- ============================================================================

-- ============================================================================
-- Table: admins
-- Description: Links Supabase Auth users to admin profiles. Only users with
--              a row in this table can access the application.
-- ============================================================================
CREATE TABLE admins (
    -- Primary key linked to Supabase Auth user
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Admin email address (denormalized from auth for quick access)
    email TEXT NOT NULL,
    
    -- Display name for UI
    full_name TEXT NOT NULL,
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT admins_email_unique UNIQUE (email),
    CONSTRAINT admins_email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT admins_full_name_length CHECK (char_length(full_name) >= 1 AND char_length(full_name) <= 200)
);

-- ============================================================================
-- Indexes
-- ============================================================================
CREATE INDEX idx_admins_email ON admins (email);

-- ============================================================================
-- Triggers
-- ============================================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_admins_updated_at
    BEFORE UPDATE ON admins
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- Comments
-- ============================================================================
COMMENT ON TABLE admins IS 'Admin users with CRM access. Links to Supabase Auth.';
COMMENT ON COLUMN admins.id IS 'Supabase Auth user ID (UUID)';
COMMENT ON COLUMN admins.email IS 'Admin email address for display and notifications';
COMMENT ON COLUMN admins.full_name IS 'Display name shown in UI and audit logs';
COMMENT ON COLUMN admins.created_at IS 'When the admin account was created';
COMMENT ON COLUMN admins.updated_at IS 'Last modification timestamp';
