-- COMPLETE VETSCRIBE DATABASE SETUP
-- This includes all tables: appointments, patients, and profiles

-- ========================================
-- 1. APPOINTMENTS TABLE (Your existing one)
-- ========================================

-- First, drop the appointments table if it exists (to start fresh)
DROP TABLE IF EXISTS public.appointments CASCADE;

-- Create appointments table with EXACT field mapping + DENTAL COLUMNS
CREATE TABLE public.appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- User reference (required)
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Patient information (exact match to component)
  patient_name TEXT NOT NULL,
  owner_name TEXT,
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
  notes TEXT
);

-- Enable Row Level Security (if not already enabled)
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;

-- RLS policies for patients (if not already created)
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
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles (with existence check)
DO $$ 
BEGIN
  -- Only create policies if they don't exist
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
-- 4. SUCCESS MESSAGE
-- ========================================

SELECT 'VetScribe database setup complete! ✅ Appointments (with dental), Patients, and Profiles tables ready!' as message;
