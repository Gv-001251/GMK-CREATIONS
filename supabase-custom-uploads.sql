-- ============================================================
-- GMK-CREATIONS: Custom reference uploads (images / PDFs)
-- Run this in Supabase Dashboard -> SQL Editor -> New Query -> Run
--
-- Smaller reference files (jpg, jpeg, png, webp, pdf up to 25MB) that customers
-- attach when requesting a custom quote are stored in Supabase Storage (cheaper
-- for small files) instead of Backblaze B2. Large 3D models keep going to B2.
-- ============================================================

-- 1. Track which storage backend each uploaded file lives in.
--    Existing rows are all B2; new Supabase files record 'supabase'.
ALTER TABLE public.uploads
  ADD COLUMN IF NOT EXISTS storage_provider TEXT NOT NULL DEFAULT 'b2';

-- 2. Private bucket for the reference uploads.
INSERT INTO storage.buckets (id, name, public)
VALUES ('custom-uploads', 'custom-uploads', false)
ON CONFLICT (id) DO NOTHING;

-- 3. Storage RLS: customers may upload to / read their own folder (path is
--    prefixed with their user id). The admin uses the service role, which
--    bypasses RLS, for listing, signed downloads, and deletes.
CREATE POLICY "Users can upload own custom files"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'custom-uploads'
    AND auth.uid() IS NOT NULL
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can read own custom files"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'custom-uploads'
    AND auth.uid() IS NOT NULL
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
