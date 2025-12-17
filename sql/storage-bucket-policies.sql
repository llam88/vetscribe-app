-- ========================================
-- SUPABASE STORAGE BUCKET POLICIES
-- For audio-recordings bucket
-- ========================================

-- IMPORTANT: Run these policies in the Supabase Dashboard
-- Go to: Storage > Policies > audio-recordings bucket

-- ========================================
-- 1. SELECT Policy (Required for signed URLs and downloads)
-- ========================================
-- Policy Name: "Users can view own recordings"
-- Allowed operation: SELECT
-- Target roles: authenticated
-- WITH CHECK expression:
--   (bucket_id = 'audio-recordings'::text) AND ((auth.uid())::text = (storage.foldername(name))[1])

-- ========================================
-- 2. INSERT Policy (Required for uploads)  
-- ========================================
-- Policy Name: "Users can upload own recordings"
-- Allowed operation: INSERT
-- Target roles: authenticated
-- WITH CHECK expression:
--   (bucket_id = 'audio-recordings'::text) AND ((auth.uid())::text = (storage.foldername(name))[1])

-- ========================================
-- 3. UPDATE Policy (Required for overwrites)
-- ========================================
-- Policy Name: "Users can update own recordings"
-- Allowed operation: UPDATE
-- Target roles: authenticated  
-- USING expression:
--   (bucket_id = 'audio-recordings'::text) AND ((auth.uid())::text = (storage.foldername(name))[1])

-- ========================================
-- 4. DELETE Policy (Required for re-recording)
-- ========================================
-- Policy Name: "Users can delete own recordings"
-- Allowed operation: DELETE
-- Target roles: authenticated
-- USING expression:
--   (bucket_id = 'audio-recordings'::text) AND ((auth.uid())::text = (storage.foldername(name))[1])

-- ========================================
-- ALTERNATIVE: SQL Version (run in SQL Editor)
-- ========================================

-- Enable storage extension if not already
-- CREATE EXTENSION IF NOT EXISTS "storage";

-- Create policies using SQL
INSERT INTO storage.policies (name, bucket_id, operation, definition, check_expression)
SELECT 
  'Users can view own recordings',
  'audio-recordings',
  'SELECT',
  '((auth.uid())::text = (storage.foldername(name))[1])',
  NULL
WHERE NOT EXISTS (
  SELECT 1 FROM storage.policies 
  WHERE bucket_id = 'audio-recordings' AND operation = 'SELECT'
);

INSERT INTO storage.policies (name, bucket_id, operation, definition, check_expression)
SELECT 
  'Users can upload own recordings',
  'audio-recordings',
  'INSERT',
  NULL,
  '((auth.uid())::text = (storage.foldername(name))[1])'
WHERE NOT EXISTS (
  SELECT 1 FROM storage.policies 
  WHERE bucket_id = 'audio-recordings' AND operation = 'INSERT'
);

INSERT INTO storage.policies (name, bucket_id, operation, definition, check_expression)
SELECT 
  'Users can update own recordings',
  'audio-recordings',
  'UPDATE',
  '((auth.uid())::text = (storage.foldername(name))[1])',
  NULL
WHERE NOT EXISTS (
  SELECT 1 FROM storage.policies 
  WHERE bucket_id = 'audio-recordings' AND operation = 'UPDATE'
);

INSERT INTO storage.policies (name, bucket_id, operation, definition, check_expression)
SELECT 
  'Users can delete own recordings',
  'audio-recordings',
  'DELETE',
  '((auth.uid())::text = (storage.foldername(name))[1])',
  NULL
WHERE NOT EXISTS (
  SELECT 1 FROM storage.policies 
  WHERE bucket_id = 'audio-recordings' AND operation = 'DELETE'
);

-- ========================================
-- VERIFICATION
-- ========================================
SELECT 
  name,
  operation,
  definition,
  check_expression
FROM storage.policies
WHERE bucket_id = 'audio-recordings';

