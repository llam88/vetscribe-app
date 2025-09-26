-- Add owner_phone column to appointments table for SMS functionality
-- Run this in your Supabase SQL Editor

-- Add owner_phone column if it doesn't exist
DO $$ 
BEGIN
  -- Check if owner_phone column exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'appointments' 
    AND column_name = 'owner_phone'
  ) THEN
    ALTER TABLE public.appointments 
    ADD COLUMN owner_phone TEXT;
    
    RAISE NOTICE 'Added owner_phone column to appointments table';
  ELSE
    RAISE NOTICE 'owner_phone column already exists';
  END IF;
  
  -- Also add owner_email if it doesn't exist (for completeness)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'appointments' 
    AND column_name = 'owner_email'
  ) THEN
    ALTER TABLE public.appointments 
    ADD COLUMN owner_email TEXT;
    
    RAISE NOTICE 'Added owner_email column to appointments table';
  ELSE
    RAISE NOTICE 'owner_email column already exists';
  END IF;
END $$;

-- Update the search vector to include phone and email (if you have full-text search)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'appointments' 
    AND column_name = 'search_vector'
  ) THEN
    -- Drop the existing generated column
    ALTER TABLE public.appointments DROP COLUMN IF EXISTS search_vector;
    
    -- Recreate with phone and email included
    ALTER TABLE public.appointments ADD COLUMN search_vector tsvector 
    GENERATED ALWAYS AS (
      to_tsvector('english', 
        coalesce(patient_name, '') || ' ' || 
        coalesce(owner_name, '') || ' ' || 
        coalesce(owner_phone, '') || ' ' || 
        coalesce(owner_email, '') || ' ' || 
        coalesce(species, '') || ' ' || 
        coalesce(breed, '') || ' ' ||
        coalesce(appointment_type, '')
      )
    ) STORED;
    
    RAISE NOTICE 'Updated search_vector to include phone and email';
  END IF;
END $$;

-- Verify columns were added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'appointments' 
AND column_name IN ('owner_phone', 'owner_email')
ORDER BY column_name;
