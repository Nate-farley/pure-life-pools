-- ============================================================================
-- Migration: 00011_calendar_events.sql
-- Description: Calendar/scheduling with optimistic locking for drag/drop
-- Pool Service CRM - Database Schema
-- ============================================================================

-- ============================================================================
-- Type: calendar_event_type
-- Description: Enum for event types
-- ============================================================================
CREATE TYPE calendar_event_type AS ENUM ('consultation', 'estimate_visit', 'follow_up', 'other');

-- ============================================================================
-- Type: calendar_event_status
-- Description: Enum for event statuses
-- ============================================================================
CREATE TYPE calendar_event_status AS ENUM ('scheduled', 'completed', 'canceled');

-- ============================================================================
-- Table: calendar_events
-- Description: Appointments and follow-ups with precise date/time scheduling.
--              Supports drag/drop rescheduling via optimistic locking (version).
-- ============================================================================
CREATE TABLE calendar_events (
    -- Primary key
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Related entities (customer required, property/pool optional)
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    property_id UUID REFERENCES properties(id) ON DELETE SET NULL,
    pool_id UUID REFERENCES pools(id) ON DELETE SET NULL,
    
    -- Event details
    title TEXT NOT NULL,
    description TEXT,
    event_type calendar_event_type NOT NULL,
    status calendar_event_status NOT NULL DEFAULT 'scheduled',
    
    -- Scheduling (stored in UTC)
    start_datetime TIMESTAMPTZ NOT NULL,
    end_datetime TIMESTAMPTZ NOT NULL,
    all_day BOOLEAN NOT NULL DEFAULT FALSE,
    
    -- Location
    location_url TEXT,
    
    -- Reminder tracking (for notification system)
    reminder_24h_sent BOOLEAN NOT NULL DEFAULT FALSE,
    reminder_2h_sent BOOLEAN NOT NULL DEFAULT FALSE,
    
    -- Admin who created the event
    created_by UUID NOT NULL REFERENCES admins(id) ON DELETE SET NULL,
    
    -- Optimistic locking for drag/drop
    version INTEGER NOT NULL DEFAULT 1,
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT calendar_events_title_length CHECK (
        char_length(title) >= 1 AND char_length(title) <= 200
    ),
    CONSTRAINT calendar_events_description_length CHECK (
        description IS NULL OR char_length(description) <= 2000
    ),
    CONSTRAINT calendar_events_end_after_start CHECK (
        end_datetime > start_datetime
    ),
    CONSTRAINT calendar_events_location_url_format CHECK (
        location_url IS NULL OR location_url ~ '^https?://'
    ),
    CONSTRAINT calendar_events_version_positive CHECK (version >= 1)
);

-- ============================================================================
-- Indexes
-- ============================================================================

-- For calendar view: events in date range
CREATE INDEX idx_calendar_events_date_range ON calendar_events (start_datetime, end_datetime);

-- For listing events by customer
CREATE INDEX idx_calendar_events_customer_id ON calendar_events (customer_id, start_datetime);

-- For filtering by status
CREATE INDEX idx_calendar_events_status ON calendar_events (status);

-- For filtering by type
CREATE INDEX idx_calendar_events_type ON calendar_events (event_type);

-- For notification processing: upcoming reminders not yet sent
CREATE INDEX idx_calendar_events_pending_24h ON calendar_events (start_datetime)
    WHERE status = 'scheduled' AND reminder_24h_sent = FALSE;

CREATE INDEX idx_calendar_events_pending_2h ON calendar_events (start_datetime)
    WHERE status = 'scheduled' AND reminder_2h_sent = FALSE;

-- Foreign key indexes
CREATE INDEX idx_calendar_events_property_id ON calendar_events (property_id) 
    WHERE property_id IS NOT NULL;
CREATE INDEX idx_calendar_events_pool_id ON calendar_events (pool_id) 
    WHERE pool_id IS NOT NULL;
CREATE INDEX idx_calendar_events_created_by ON calendar_events (created_by);

-- ============================================================================
-- Triggers
-- ============================================================================

-- Auto-update updated_at timestamp and increment version on update
CREATE OR REPLACE FUNCTION update_calendar_event_version()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    -- Only increment version if scheduling-related fields change
    IF (
        OLD.start_datetime IS DISTINCT FROM NEW.start_datetime OR
        OLD.end_datetime IS DISTINCT FROM NEW.end_datetime OR
        OLD.status IS DISTINCT FROM NEW.status
    ) THEN
        NEW.version = OLD.version + 1;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_calendar_events_version
    BEFORE UPDATE ON calendar_events
    FOR EACH ROW
    EXECUTE FUNCTION update_calendar_event_version();

-- ============================================================================
-- Comments
-- ============================================================================
COMMENT ON TABLE calendar_events IS 'Appointments and follow-ups. Supports drag/drop with optimistic locking.';
COMMENT ON COLUMN calendar_events.id IS 'Primary key (UUID)';
COMMENT ON COLUMN calendar_events.customer_id IS 'Related customer (required)';
COMMENT ON COLUMN calendar_events.property_id IS 'Related property (optional)';
COMMENT ON COLUMN calendar_events.pool_id IS 'Related pool (optional)';
COMMENT ON COLUMN calendar_events.title IS 'Event title displayed in calendar';
COMMENT ON COLUMN calendar_events.description IS 'Event details/notes';
COMMENT ON COLUMN calendar_events.event_type IS 'Type: consultation, estimate_visit, follow_up, other';
COMMENT ON COLUMN calendar_events.status IS 'Status: scheduled, completed, canceled';
COMMENT ON COLUMN calendar_events.start_datetime IS 'Start time (stored in UTC)';
COMMENT ON COLUMN calendar_events.end_datetime IS 'End time (stored in UTC)';
COMMENT ON COLUMN calendar_events.all_day IS 'Whether this is an all-day event';
COMMENT ON COLUMN calendar_events.location_url IS 'Google Maps or other location URL';
COMMENT ON COLUMN calendar_events.reminder_24h_sent IS 'Whether 24-hour reminder was sent';
COMMENT ON COLUMN calendar_events.reminder_2h_sent IS 'Whether 2-hour reminder was sent';
COMMENT ON COLUMN calendar_events.created_by IS 'Admin who created the event';
COMMENT ON COLUMN calendar_events.version IS 'Version for optimistic locking (increments on schedule changes)';
COMMENT ON COLUMN calendar_events.created_at IS 'When the event was created';
COMMENT ON COLUMN calendar_events.updated_at IS 'Last modification timestamp';
