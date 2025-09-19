"use client"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { 
  Database, 
  AlertTriangle, 
  CheckCircle2, 
  ExternalLink,
  Copy,
  RefreshCw
} from "lucide-react"

export function DatabaseSetupNotice() {
  const [dbStatus, setDbStatus] = useState<'checking' | 'ready' | 'missing'>('checking')
  const [showInstructions, setShowInstructions] = useState(false)

  const checkDatabase = async () => {
    try {
      const response = await fetch('/api/setup-database', { method: 'POST' })
      const result = await response.json()
      
      if (result.success) {
        setDbStatus('ready')
      } else {
        setDbStatus('missing')
        setShowInstructions(true)
      }
    } catch (error) {
      setDbStatus('missing')
      setShowInstructions(true)
    }
  }

  useEffect(() => {
    checkDatabase()
  }, [])

  const copySQL = () => {
    const sqlContent = `-- Run this in your Supabase SQL Editor
-- Enhanced VetScribe AI Database Schema

-- Enhanced Patients table
CREATE TABLE IF NOT EXISTS public.patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  name TEXT NOT NULL,
  species TEXT DEFAULT 'Dog',
  breed TEXT,
  age TEXT,
  sex TEXT,
  weight TEXT,
  owner TEXT,
  notes TEXT
);

-- Comprehensive Appointments table
CREATE TABLE IF NOT EXISTS public.appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  patient_name TEXT NOT NULL,
  owner_name TEXT,
  species TEXT DEFAULT 'Dog',
  breed TEXT,
  appointment_type TEXT DEFAULT 'Wellness Exam',
  transcription TEXT,
  soap_note TEXT,
  client_summary TEXT,
  status TEXT DEFAULT 'pending'
);

-- Enable Row Level Security
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Patients
CREATE POLICY "patients_select_own" ON public.patients FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "patients_insert_own" ON public.patients FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "patients_update_own" ON public.patients FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "patients_delete_own" ON public.patients FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for Appointments
CREATE POLICY "appointments_select_own" ON public.appointments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "appointments_insert_own" ON public.appointments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "appointments_update_own" ON public.appointments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "appointments_delete_own" ON public.appointments FOR DELETE USING (auth.uid() = user_id);`

    navigator.clipboard.writeText(sqlContent)
    alert('SQL copied to clipboard!')
  }

  if (dbStatus === 'checking') {
    return (
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-4">
            <RefreshCw className="h-6 w-6 animate-spin mr-2" />
            <span>Checking database configuration...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (dbStatus === 'ready') {
    return null // Database is ready, don't show anything
  }

  if (!showInstructions) {
    return null
  }

  return (
    <Card className="mb-6 border-orange-200 bg-orange-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-orange-900">
          <Database className="h-5 w-5" />
          Database Setup Required
          <Badge variant="outline" className="bg-orange-100 text-orange-800">
            One-time setup
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Alert className="mb-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Your database tables need to be created before you can save appointments and patients.
            This is a quick one-time setup.
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Quick Setup Steps:</h4>
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li>Go to your <strong>Supabase Dashboard</strong></li>
              <li>Click <strong>"SQL Editor"</strong> in the left sidebar</li>
              <li>Click <strong>"New Query"</strong></li>
              <li>Copy and paste the SQL below</li>
              <li>Click <strong>"Run"</strong></li>
              <li>Refresh this page</li>
            </ol>
          </div>

          <div className="flex gap-2">
            <Button onClick={copySQL} variant="outline" size="sm">
              <Copy className="h-4 w-4 mr-2" />
              Copy SQL
            </Button>
            
            <Button asChild variant="outline" size="sm">
              <a 
                href="https://app.supabase.com" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Open Supabase
              </a>
            </Button>
            
            <Button onClick={checkDatabase} size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Check Again
            </Button>
          </div>

          <details className="mt-4">
            <summary className="cursor-pointer text-sm font-medium mb-2">
              View SQL to copy manually
            </summary>
            <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto max-h-60">
{`-- Enhanced VetScribe Database Schema

-- Enhanced Patients table
CREATE TABLE IF NOT EXISTS public.patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  name TEXT NOT NULL,
  species TEXT DEFAULT 'Dog',
  breed TEXT,
  age TEXT,
  sex TEXT,
  weight TEXT,
  owner TEXT,
  notes TEXT
);

-- Comprehensive Appointments table
CREATE TABLE IF NOT EXISTS public.appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  patient_name TEXT NOT NULL,
  owner_name TEXT,
  species TEXT DEFAULT 'Dog',
  breed TEXT,
  appointment_type TEXT DEFAULT 'Wellness Exam',
  transcription TEXT,
  soap_note TEXT,
  client_summary TEXT,
  dental_chart_data JSONB,
  dental_findings JSONB,
  status TEXT DEFAULT 'pending'
);

-- Enable Row Level Security
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Patients
CREATE POLICY "patients_select_own" ON public.patients FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "patients_insert_own" ON public.patients FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "patients_update_own" ON public.patients FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "patients_delete_own" ON public.patients FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for Appointments
CREATE POLICY "appointments_select_own" ON public.appointments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "appointments_insert_own" ON public.appointments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "appointments_update_own" ON public.appointments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "appointments_delete_own" ON public.appointments FOR DELETE USING (auth.uid() = user_id);`}
            </pre>
          </details>
        </div>
      </CardContent>
    </Card>
  )
}
