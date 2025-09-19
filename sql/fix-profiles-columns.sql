-- Fix profiles table - add missing columns safely
-- Run this in Supabase SQL Editor

DO $$ 
BEGIN
  -- Add updated_at column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' 
    AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE public.profiles 
    ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    
    RAISE NOTICE 'Added updated_at column to profiles table';
  ELSE
    RAISE NOTICE 'updated_at column already exists';
  END IF;

  -- Add email_config column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' 
    AND column_name = 'email_config'
  ) THEN
    ALTER TABLE public.profiles 
    ADD COLUMN email_config JSONB DEFAULT '{"provider": "none"}'::jsonb;
    
    RAISE NOTICE 'Added email_config column to profiles table';
  ELSE
    RAISE NOTICE 'email_config column already exists';
  END IF;

  -- Add created_at column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' 
    AND column_name = 'created_at'
  ) THEN
    ALTER TABLE public.profiles 
    ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    
    RAISE NOTICE 'Added created_at column to profiles table';
  ELSE
    RAISE NOTICE 'created_at column already exists';
  END IF;
END $$;

SELECT 'Profiles table columns updated successfully! ✅' as message;
