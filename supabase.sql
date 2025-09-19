-- Enhanced VetScribe AI Database Schema
-- Comprehensive schema supporting all main.py functionality

-- Create profiles table to link auth users to rows
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enhanced Patients table
CREATE TABLE IF NOT EXISTS public.patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Patient information
  name TEXT NOT NULL,
  species TEXT DEFAULT 'Dog',
  breed TEXT,
  age TEXT,
  sex TEXT,
  weight TEXT,
  microchip TEXT,
  color_markings TEXT,
  
  -- Owner information
  owner TEXT,
  owner_phone TEXT,
  owner_email TEXT,
  owner_address TEXT,
  
  -- Medical history
  allergies TEXT[],
  medications TEXT[],
  medical_conditions TEXT[],
  vaccination_status JSONB,
  
  -- Notes
  notes TEXT,
  
  -- Search optimization
  search_vector TSVECTOR GENERATED ALWAYS AS (
    to_tsvector('english', 
      COALESCE(name, '') || ' ' || 
      COALESCE(owner, '') || ' ' || 
      COALESCE(species, '') || ' ' || 
      COALESCE(breed, '')
    )
  ) STORED,
  
  -- Ensure unique patient names per user
  CONSTRAINT unique_patient_per_user UNIQUE(user_id, name)
);

-- Comprehensive Appointments table (matches main.py functionality)
CREATE TABLE IF NOT EXISTS public.appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- User reference
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  patient_id UUID REFERENCES public.patients(id) ON DELETE SET NULL,
  
  -- Patient information (denormalized for performance)
  patient_name TEXT NOT NULL,
  owner_name TEXT,
  species TEXT DEFAULT 'Dog',
  breed TEXT,
  age TEXT,
  sex TEXT,
  weight TEXT,
  
  -- Appointment details
  appointment_type TEXT DEFAULT 'Wellness Exam',
  appointment_date DATE DEFAULT CURRENT_DATE,
  chief_complaint TEXT,
  duration TEXT,
  original_notes TEXT, -- Raw appointment notes
  
  -- AI generated content (matches main.py session_state structure)
  transcription TEXT,
  soap_note TEXT,
  client_summary TEXT,
  client_email TEXT,
  
  -- Dental analysis (matches main.py dental_chart_data)
  dental_chart_data JSONB,
  dental_findings JSONB,
  
  -- PIMS integration tracking
  pims_exported BOOLEAN DEFAULT FALSE,
  pims_system TEXT,
  pims_export_data JSONB,
  
  -- Workflow status (matches main.py appointment status)
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'reviewed')),
  
  -- Metadata
  audio_duration INTEGER, -- in seconds
  transcription_completed_at TIMESTAMP WITH TIME ZONE,
  soap_completed_at TIMESTAMP WITH TIME ZONE,
  summary_completed_at TIMESTAMP WITH TIME ZONE,
  
  -- Search optimization
  search_vector TSVECTOR GENERATED ALWAYS AS (
    to_tsvector('english', 
      COALESCE(patient_name, '') || ' ' || 
      COALESCE(owner_name, '') || ' ' || 
      COALESCE(species, '') || ' ' || 
      COALESCE(breed, '') || ' ' ||
      COALESCE(appointment_type, '')
    )
  ) STORED
);

-- Note templates table (matches main.py template system)
CREATE TABLE IF NOT EXISTS public.note_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Template details
  name TEXT NOT NULL,
  description TEXT,
  template_type TEXT DEFAULT 'soap',
  content JSONB NOT NULL,
  
  -- Whether it's a system template or user-created
  is_system_template BOOLEAN DEFAULT FALSE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Usage tracking
  usage_count INTEGER DEFAULT 0
);

-- User settings table (matches main.py session_state settings)
CREATE TABLE IF NOT EXISTS public.user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Settings matching main.py functionality
  enable_dental_testing BOOLEAN DEFAULT TRUE,
  enable_pims_integration BOOLEAN DEFAULT TRUE,
  integrations_performed INTEGER DEFAULT 0,
  
  -- AI preferences
  transcription_quality TEXT DEFAULT 'high',
  soap_note_style TEXT DEFAULT 'comprehensive',
  client_summary_tone TEXT DEFAULT 'professional',
  
  -- UI preferences
  show_tutorials BOOLEAN DEFAULT TRUE,
  compact_view BOOLEAN DEFAULT FALSE,
  
  -- Other settings
  settings_json JSONB
);

-- Enable Row Level Security on all tables
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Patients
DROP POLICY IF EXISTS "patients_select_own" ON public.patients;
CREATE POLICY "patients_select_own" ON public.patients FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "patients_insert_own" ON public.patients;
CREATE POLICY "patients_insert_own" ON public.patients FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "patients_update_own" ON public.patients;
CREATE POLICY "patients_update_own" ON public.patients FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "patients_delete_own" ON public.patients;
CREATE POLICY "patients_delete_own" ON public.patients FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for Appointments
DROP POLICY IF EXISTS "appointments_select_own" ON public.appointments;
CREATE POLICY "appointments_select_own" ON public.appointments FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "appointments_insert_own" ON public.appointments;
CREATE POLICY "appointments_insert_own" ON public.appointments FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "appointments_update_own" ON public.appointments;
CREATE POLICY "appointments_update_own" ON public.appointments FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "appointments_delete_own" ON public.appointments;
CREATE POLICY "appointments_delete_own" ON public.appointments FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for User Settings
DROP POLICY IF EXISTS "settings_select_own" ON public.user_settings;
CREATE POLICY "settings_select_own" ON public.user_settings FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "settings_insert_own" ON public.user_settings;
CREATE POLICY "settings_insert_own" ON public.user_settings FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "settings_update_own" ON public.user_settings;
CREATE POLICY "settings_update_own" ON public.user_settings FOR UPDATE USING (auth.uid() = user_id);

-- Note Templates Policies
DROP POLICY IF EXISTS "templates_select" ON public.note_templates;
CREATE POLICY "templates_select" ON public.note_templates 
FOR SELECT USING (is_system_template = TRUE OR auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_appointments_user_id ON public.appointments(user_id);
CREATE INDEX IF NOT EXISTS idx_appointments_created_at ON public.appointments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON public.appointments(status);
CREATE INDEX IF NOT EXISTS idx_appointments_search ON public.appointments USING gin(search_vector);
CREATE INDEX IF NOT EXISTS idx_appointments_patient_name ON public.appointments(patient_name);

CREATE INDEX IF NOT EXISTS idx_patients_user_id ON public.patients(user_id);
CREATE INDEX IF NOT EXISTS idx_patients_search ON public.patients USING gin(search_vector);
CREATE INDEX IF NOT EXISTS idx_patients_name ON public.patients(name);

-- Functions for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

-- Triggers for timestamp updates
DROP TRIGGER IF EXISTS update_patients_updated_at ON public.patients;
CREATE TRIGGER update_patients_updated_at 
    BEFORE UPDATE ON public.patients 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_appointments_updated_at ON public.appointments;
CREATE TRIGGER update_appointments_updated_at 
    BEFORE UPDATE ON public.appointments 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_settings_updated_at ON public.user_settings;
CREATE TRIGGER update_settings_updated_at 
    BEFORE UPDATE ON public.user_settings 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default system templates (matches main.py templates)
INSERT INTO public.note_templates (name, description, template_type, content, is_system_template) 
VALUES 
(
  'General Wellness Exam',
  'Standard template for wellness examinations',
  'soap',
  '{
    "sections": {
      "subjective": "History and chief complaint as reported by owner",
      "objective": "Physical examination findings and vitals",
      "assessment": "Clinical assessment and diagnosis",
      "plan": "Treatment plan and recommendations"
    },
    "style": "comprehensive"
  }'::JSONB,
  TRUE
),
(
  'Emergency Visit',
  'Template for emergency appointments',
  'soap',
  '{
    "sections": {
      "subjective": "Emergency presentation and history",
      "objective": "Emergency examination and diagnostics",
      "assessment": "Emergency assessment and stabilization", 
      "plan": "Emergency treatment and follow-up plan"
    },
    "style": "urgent"
  }'::JSONB,
  TRUE
),
(
  'Dental Cleaning (COHAT)',
  'Template for dental procedures and COHAT examinations',
  'soap',
  '{
    "sections": {
      "subjective": "Dental concerns and oral health history",
      "objective": "Oral examination and dental findings with tooth-by-tooth assessment",
      "assessment": "Dental assessment and periodontal staging",
      "plan": "Dental treatment plan and home care recommendations"
    },
    "style": "detailed",
    "dental_specific": true
  }'::JSONB,
  TRUE
)
ON CONFLICT DO NOTHING;
