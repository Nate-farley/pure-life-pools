-- ============================================================================
-- Migration: 00001_extensions.sql
-- Description: Enable required PostgreSQL extensions
-- Pool Service CRM - Database Schema
-- ============================================================================

-- UUID generation (built-in, but ensure available)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA extensions;

-- Trigram support for fuzzy text search (phone, name)
CREATE EXTENSION IF NOT EXISTS "pg_trgm" WITH SCHEMA extensions;

-- Note: pg_cron is excluded from this migration per requirements
-- It will be set up separately for notification scheduling

-- ============================================================================
-- Comments
-- ============================================================================
COMMENT ON EXTENSION "uuid-ossp" IS 'UUID generation functions for primary keys';
COMMENT ON EXTENSION "pg_trgm" IS 'Trigram matching for fuzzy text search on phone numbers and names';
