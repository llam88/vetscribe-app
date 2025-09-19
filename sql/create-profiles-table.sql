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

-- RLS Policies: Users can only see/edit their own profile
CREATE POLICY "profiles_select_own" 
  ON public.profiles 
  FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "profiles_insert_own" 
  ON public.profiles 
  FOR INSERT 
  WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_own" 
  ON public.profiles 
  FOR UPDATE 
  USING (auth.uid() = id);

CREATE POLICY "profiles_delete_own" 
  ON public.profiles 
  FOR DELETE 
  USING (auth.uid() = id);

-- Test the table creation
SELECT 'Profiles table created successfully!' as message;
