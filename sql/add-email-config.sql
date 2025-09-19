-- Add email_config column to profiles table for user email settings
DO $$ 
BEGIN
  -- Check if email_config column exists
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
END $$;
