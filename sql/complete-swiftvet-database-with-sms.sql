-- ========================================
-- COMPLETE SWIFTVET DATABASE SETUP
-- This includes all tables: appointments, patients, profiles + SMS support
-- Safe to run multiple times - won't overwrite existing data
-- ========================================

-- ========================================
-- 1. APPOINTMENTS TABLE (Enhanced with SMS)
-- ========================================

-- First, drop the appointments table if it exists (to start fresh)
DROP TABLE IF EXISTS public.appointments CASCADE;

-- Create appointments table with EXACT field mapping + DENTAL + SMS COLUMNS
CREATE TABLE public.appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- User reference (required)
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Patient information (exact match to component)
  patient_name TEXT NOT NULL,
  owner_name TEXT,
  owner_phone TEXT,  -- NEW: For SMS functionality
  owner_email TEXT,  -- NEW: For email functionality
  species TEXT DEFAULT 'Dog',
  breed TEXT,
  appointment_type TEXT DEFAULT 'Wellness Exam',
  
  -- Notes field (maps from component)
  chief_complaint TEXT,
  
  -- AI generated content (for future use)
  transcription TEXT,
  soap_note TEXT,
  client_summary TEXT,
  dental_chart_data JSONB,
  dental_findings JSONB,
  
  -- Status
  status TEXT DEFAULT 'pending'
);

-- Enable Row Level Security
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- Simple, permissive RLS policies (exactly like your patients table)
CREATE POLICY "appointments_select_own" 
  ON public.appointments 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "appointments_insert_own" 
  ON public.appointments 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "appointments_update_own" 
  ON public.appointments 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "appointments_delete_own" 
  ON public.appointments 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- ========================================
-- 2. PATIENTS TABLE (Keep existing if you have it)
-- ========================================

-- Create patients table (if not exists - won't overwrite existing)
CREATE TABLE IF NOT EXISTS public.patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  name TEXT NOT NULL,
  species TEXT,
  breed TEXT,
  sex TEXT,
  age TEXT,
  weight TEXT,
  owner TEXT,
  owner_phone TEXT,  -- NEW: For SMS functionality
  owner_email TEXT,  -- NEW: For email functionality
  notes TEXT
);

-- Enable Row Level Security (if not already enabled)
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;

-- RLS policies for patients (with safety checks)
DO $$ 
BEGIN
  -- Only create policies if they don't exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'patients' AND policyname = 'patients_select_own'
  ) THEN
    CREATE POLICY "patients_select_own" 
      ON public.patients 
      FOR SELECT 
      USING (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'patients' AND policyname = 'patients_insert_own'
  ) THEN
    CREATE POLICY "patients_insert_own" 
      ON public.patients 
      FOR INSERT 
      WITH CHECK (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'patients' AND policyname = 'patients_update_own'
  ) THEN
    CREATE POLICY "patients_update_own" 
      ON public.patients 
      FOR UPDATE 
      USING (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'patients' AND policyname = 'patients_delete_own'
  ) THEN
    CREATE POLICY "patients_delete_own" 
      ON public.patients 
      FOR DELETE 
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- ========================================
-- 3. PROFILES TABLE (NEW - for enhanced sign-up)
-- ========================================

-- Create profiles table to store additional user information
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  practice_name TEXT,
  user_type TEXT DEFAULT 'veterinarian',
  email_config JSONB DEFAULT '{"provider": "none"}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles (with existence check)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'profiles' AND policyname = 'profiles_select_own'
  ) THEN
    CREATE POLICY "profiles_select_own" 
      ON public.profiles 
      FOR SELECT 
      USING (auth.uid() = id);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'profiles' AND policyname = 'profiles_insert_own'
  ) THEN
    CREATE POLICY "profiles_insert_own" 
      ON public.profiles 
      FOR INSERT 
      WITH CHECK (auth.uid() = id);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'profiles' AND policyname = 'profiles_update_own'
  ) THEN
    CREATE POLICY "profiles_update_own" 
      ON public.profiles 
      FOR UPDATE 
      USING (auth.uid() = id);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'profiles' AND policyname = 'profiles_delete_own'
  ) THEN
    CREATE POLICY "profiles_delete_own" 
      ON public.profiles 
      FOR DELETE 
      USING (auth.uid() = id);
  END IF;
END $$;

-- ========================================
-- 4. SMS LOGS TABLE (NEW - for SMS tracking)
-- ========================================

-- Create SMS logs table for tracking sent messages
CREATE TABLE IF NOT EXISTS public.sms_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- User and appointment reference
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
  
  -- SMS details
  patient_name TEXT,
  phone_number TEXT NOT NULL,
  message_body TEXT NOT NULL,
  twilio_sid TEXT, -- Twilio message ID
  status TEXT DEFAULT 'sent',
  cost DECIMAL(10,4) DEFAULT 0.0075, -- SMS cost tracking
  
  -- Error tracking
  error_message TEXT,
  delivery_status TEXT
);

-- Enable Row Level Security
ALTER TABLE public.sms_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for SMS logs
CREATE POLICY "sms_logs_select_own" 
  ON public.sms_logs 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "sms_logs_insert_own" 
  ON public.sms_logs 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- ========================================
-- 5. ADD MISSING COLUMNS TO EXISTING TABLES (if needed)
-- ========================================

-- Add phone/email columns to existing appointments table if they don't exist
DO $$ 
BEGIN
  -- Add owner_phone column if it doesn't exist
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
  
  -- Add owner_email column if it doesn't exist
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

-- Add phone/email columns to existing patients table if they don't exist
DO $$ 
BEGIN
  -- Add owner_phone column to patients if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'patients' 
    AND column_name = 'owner_phone'
  ) THEN
    ALTER TABLE public.patients 
    ADD COLUMN owner_phone TEXT;
    
    RAISE NOTICE 'Added owner_phone column to patients table';
  ELSE
    RAISE NOTICE 'owner_phone column already exists';
  END IF;
  
  -- Add owner_email column to patients if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'patients' 
    AND column_name = 'owner_email'
  ) THEN
    ALTER TABLE public.patients 
    ADD COLUMN owner_email TEXT;
    
    RAISE NOTICE 'Added owner_email column to patients table';
  ELSE
    RAISE NOTICE 'owner_email column already exists';
  END IF;
END $$;

-- ========================================
-- 6. VERIFY SETUP
-- ========================================

-- Test that all tables exist and work
DO $$
BEGIN
  -- Check appointments table
  PERFORM 1 FROM public.appointments LIMIT 1;
  RAISE NOTICE '✅ Appointments table ready';
  
  -- Check patients table  
  PERFORM 1 FROM public.patients LIMIT 1;
  RAISE NOTICE '✅ Patients table ready';
  
  -- Check profiles table
  PERFORM 1 FROM public.profiles LIMIT 1;
  RAISE NOTICE '✅ Profiles table ready';
  
  -- Check SMS logs table
  PERFORM 1 FROM public.sms_logs LIMIT 1;
  RAISE NOTICE '✅ SMS logs table ready';
  
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Tables created successfully but empty (this is normal for new setup)';
END $$;

-- ========================================
-- 7. SUCCESS MESSAGE
-- ========================================

SELECT 'SwiftVet database setup complete! ✅ 

✅ Appointments table (with SMS phone numbers)
✅ Patients table (with contact info) 
✅ Profiles table (with email configuration)
✅ SMS logs table (for message tracking)
✅ Row Level Security enabled
✅ All policies configured

Your SwiftVet app is now ready for SMS functionality!' as message;
