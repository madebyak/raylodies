-- Supabase Storage: product-files bucket policies (admin upload only)
-- This is required if you upload product files directly from the admin UI (browser)
-- using the regular Supabase client.
--
-- Prereqs:
-- - Bucket `product-files` exists (Private)
-- - Function `public.is_admin()` exists (see docs/db-migrations-2025-12-22.sql)

-- Allow admins to upload product files to the private bucket.
-- (We use unique paths, so INSERT is sufficient; no UPDATE policy needed.)
CREATE POLICY IF NOT EXISTS "Admin Upload Private (product-files)"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'product-files' AND public.is_admin());


