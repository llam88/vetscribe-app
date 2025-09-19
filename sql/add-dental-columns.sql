-- Add dental chart columns to appointments table
-- Run this in your Supabase SQL Editor

-- Add dental chart columns if they don't exist
DO $$ 
BEGIN
  -- Check if dental_chart_data column exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'appointments' 
    AND column_name = 'dental_chart_data'
  ) THEN
    ALTER TABLE public.appointments 
    ADD COLUMN dental_chart_data JSONB;
    
    RAISE NOTICE 'Added dental_chart_data column to appointments table';
  ELSE
    RAISE NOTICE 'dental_chart_data column already exists';
  END IF;
  
  -- Check if dental_findings column exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'appointments' 
    AND column_name = 'dental_findings'
  ) THEN
    ALTER TABLE public.appointments 
    ADD COLUMN dental_findings JSONB;
    
    RAISE NOTICE 'Added dental_findings column to appointments table';
  ELSE
    RAISE NOTICE 'dental_findings column already exists';
  END IF;
END $$;

-- Verify columns were added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'appointments' 
AND column_name IN ('dental_chart_data', 'dental_findings')
ORDER BY column_name;
