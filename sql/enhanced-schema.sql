-- Enhanced schema for VetScribe with appointment management

-- Enable RLS
ALTER TABLE IF EXISTS appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS patients ENABLE ROW LEVEL SECURITY;

-- Create appointments table with enhanced fields
CREATE TABLE IF NOT EXISTS appointments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  -- User reference
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Patient information
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
  
  -- AI generated content
  transcription TEXT,
  soap_note TEXT,
  client_summary TEXT,
  client_email TEXT,
  
  -- Workflow status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'reviewed')),
  
  -- Metadata
  audio_duration INTEGER, -- in seconds
  transcription_completed_at TIMESTAMP WITH TIME ZONE,
  soap_completed_at TIMESTAMP WITH TIME ZONE,
  summary_completed_at TIMESTAMP WITH TIME ZONE,
  
  -- Search optimization
  search_vector tsvector GENERATED ALWAYS AS (
    to_tsvector('english', 
      coalesce(patient_name, '') || ' ' || 
      coalesce(owner_name, '') || ' ' || 
      coalesce(species, '') || ' ' || 
      coalesce(breed, '') || ' ' ||
      coalesce(appointment_type, '')
    )
  ) STORED
);

-- Create patients table for better patient management
CREATE TABLE IF NOT EXISTS patients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  -- User reference
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
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
  search_vector tsvector GENERATED ALWAYS AS (
    to_tsvector('english', 
      coalesce(name, '') || ' ' || 
      coalesce(owner, '') || ' ' || 
      coalesce(species, '') || ' ' || 
      coalesce(breed, '')
    )
  ) STORED,
  
  -- Ensure unique patient names per user
  CONSTRAINT unique_patient_per_user UNIQUE(user_id, name)
);

-- Create templates table for SOAP note templates
CREATE TABLE IF NOT EXISTS note_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  -- Template details
  name TEXT NOT NULL,
  description TEXT,
  template_type TEXT DEFAULT 'soap',
  content JSONB NOT NULL,
  
  -- Whether it's a system template or user-created
  is_system_template BOOLEAN DEFAULT false,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Usage tracking
  usage_count INTEGER DEFAULT 0
);

-- Create appointment_files table for audio/document storage
CREATE TABLE IF NOT EXISTS appointment_files (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  appointment_id UUID REFERENCES appointments(id) ON DELETE CASCADE NOT NULL,
  file_type TEXT NOT NULL, -- 'audio', 'pdf', 'image', etc.
  file_name TEXT NOT NULL,
  file_size BIGINT,
  storage_path TEXT NOT NULL,
  mime_type TEXT
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_appointments_user_id ON appointments(user_id);
CREATE INDEX IF NOT EXISTS idx_appointments_created_at ON appointments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
CREATE INDEX IF NOT EXISTS idx_appointments_search ON appointments USING gin(search_vector);
CREATE INDEX IF NOT EXISTS idx_appointments_patient_name ON appointments(patient_name);

CREATE INDEX IF NOT EXISTS idx_patients_user_id ON patients(user_id);
CREATE INDEX IF NOT EXISTS idx_patients_search ON patients USING gin(search_vector);
CREATE INDEX IF NOT EXISTS idx_patients_name ON patients(name);

CREATE INDEX IF NOT EXISTS idx_appointment_files_appointment_id ON appointment_files(appointment_id);

-- Row Level Security Policies
-- Appointments
DROP POLICY IF EXISTS "Users can view own appointments" ON appointments;
CREATE POLICY "Users can view own appointments" ON appointments
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own appointments" ON appointments;
CREATE POLICY "Users can insert own appointments" ON appointments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own appointments" ON appointments;
CREATE POLICY "Users can update own appointments" ON appointments
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own appointments" ON appointments;
CREATE POLICY "Users can delete own appointments" ON appointments
  FOR DELETE USING (auth.uid() = user_id);

-- Patients
DROP POLICY IF EXISTS "Users can view own patients" ON patients;
CREATE POLICY "Users can view own patients" ON patients
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own patients" ON patients;
CREATE POLICY "Users can insert own patients" ON patients
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own patients" ON patients;
CREATE POLICY "Users can update own patients" ON patients
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own patients" ON patients;
CREATE POLICY "Users can delete own patients" ON patients
  FOR DELETE USING (auth.uid() = user_id);

-- Note Templates
DROP POLICY IF EXISTS "Users can view templates" ON note_templates;
CREATE POLICY "Users can view templates" ON note_templates
  FOR SELECT USING (is_system_template = true OR auth.uid() = user_id);

-- Appointment Files
DROP POLICY IF EXISTS "Users can manage appointment files" ON appointment_files;
CREATE POLICY "Users can manage appointment files" ON appointment_files
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM appointments 
      WHERE appointments.id = appointment_files.appointment_id 
      AND appointments.user_id = auth.uid()
    )
  );

-- Functions for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for timestamp updates
DROP TRIGGER IF EXISTS update_appointments_updated_at ON appointments;
CREATE TRIGGER update_appointments_updated_at 
    BEFORE UPDATE ON appointments 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_patients_updated_at ON patients;
CREATE TRIGGER update_patients_updated_at 
    BEFORE UPDATE ON patients 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert some default system templates
INSERT INTO note_templates (name, description, template_type, content, is_system_template) 
VALUES 
(
  'General Wellness Exam',
  'Standard template for wellness examinations',
  'soap',
  '{
    "sections": {
      "subjective": "History and chief complaint",
      "objective": "Physical examination findings",
      "assessment": "Clinical assessment and diagnosis",
      "plan": "Treatment plan and recommendations"
    }
  }'::jsonb,
  true
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
    }
  }'::jsonb,
  true
),
(
  'Dental Cleaning',
  'Template for dental procedures',
  'soap',
  '{
    "sections": {
      "subjective": "Dental concerns and oral health history",
      "objective": "Oral examination and dental findings",
      "assessment": "Dental assessment and periodontal staging",
      "plan": "Dental treatment plan and home care"
    }
  }'::jsonb,
  true
)
ON CONFLICT DO NOTHING;
