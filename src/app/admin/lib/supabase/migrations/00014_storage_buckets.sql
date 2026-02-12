-- ============================================================================
-- Migration: 00014_storage_buckets.sql
-- Description: Create Supabase Storage buckets for customer attachments
-- Pool Service CRM - Database Schema
-- ============================================================================

-- ============================================================================
-- Storage Bucket: customer-attachments
-- Description: Stores customer-related files (photos, PDFs)
-- Access: Private (requires authentication)
-- Limits: 10MB max file size, specific MIME types only
-- ============================================================================

-- Create the storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'customer-attachments',
    'customer-attachments',
    FALSE,  -- Private bucket - requires authentication
    10485760,  -- 10MB in bytes
    ARRAY[
        'image/jpeg',
        'image/png',
        'image/webp',
        'application/pdf'
    ]
)
ON CONFLICT (id) DO UPDATE SET
    public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- ============================================================================
-- Storage Policies (Admin-only access)
-- ============================================================================

-- Policy: Admins can upload files
CREATE POLICY "Admins can upload attachments"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'customer-attachments'
    AND EXISTS (SELECT 1 FROM admins WHERE id = auth.uid())
);

-- Policy: Admins can view/download files
CREATE POLICY "Admins can view attachments"
ON storage.objects
FOR SELECT
TO authenticated
USING (
    bucket_id = 'customer-attachments'
    AND EXISTS (SELECT 1 FROM admins WHERE id = auth.uid())
);

-- Policy: Admins can update file metadata
CREATE POLICY "Admins can update attachments"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
    bucket_id = 'customer-attachments'
    AND EXISTS (SELECT 1 FROM admins WHERE id = auth.uid())
)
WITH CHECK (
    bucket_id = 'customer-attachments'
    AND EXISTS (SELECT 1 FROM admins WHERE id = auth.uid())
);

-- Policy: Admins can delete files
CREATE POLICY "Admins can delete attachments"
ON storage.objects
FOR DELETE
TO authenticated
USING (
    bucket_id = 'customer-attachments'
    AND EXISTS (SELECT 1 FROM admins WHERE id = auth.uid())
);

-- ============================================================================
-- Comments
-- ============================================================================
COMMENT ON COLUMN storage.buckets.id IS 'Bucket identifier used in storage paths';

-- ============================================================================
-- Notes on Usage
-- ============================================================================
-- File path convention: {customer_id}/{uuid}.{ext}
-- Example: 550e8400-e29b-41d4-a716-446655440000/a1b2c3d4.jpg
--
-- Upload via Supabase client:
--   const { data, error } = await supabase.storage
--     .from('customer-attachments')
--     .upload(`${customerId}/${fileId}.${ext}`, file);
--
-- Download URL (signed, expires):
--   const { data } = await supabase.storage
--     .from('customer-attachments')
--     .createSignedUrl(path, 3600); // 1 hour expiry
-- ============================================================================
