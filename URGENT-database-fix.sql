-- FIXED VERSION - Add these lines to your CREATE TABLE statement:
-- Add these TWO lines in your CREATE TABLE before running it:

  -- AI generated content (for future use)
  transcription TEXT,
  soap_note TEXT,
  client_summary TEXT,
  dental_chart_data JSONB,  -- <-- ADD THIS LINE
  dental_findings JSONB,    -- <-- ADD THIS LINE
  
  -- Status
  status TEXT DEFAULT 'pending'

-- Your complete CORRECTED SQL should be:

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
  dental_chart_data JSONB,     -- DENTAL CHART DATA
  dental_findings JSONB,       -- DENTAL FINDINGS DATA
  
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

-- Test the table works
SELECT 'Appointments table created successfully with dental columns!' as message;
