-- 1. Create table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.mea_submissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Add ALL columns required by the app and user prompt
-- App uses 'user_id' for RLS and linking.
ALTER TABLE public.mea_submissions ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);
-- User prompt mentioned 'submitted_by', adding it for compatibility.
ALTER TABLE public.mea_submissions ADD COLUMN IF NOT EXISTS submitted_by TEXT;

ALTER TABLE public.mea_submissions ADD COLUMN IF NOT EXISTS school_name TEXT;
ALTER TABLE public.mea_submissions ADD COLUMN IF NOT EXISTS district TEXT DEFAULT 'Bacong';
ALTER TABLE public.mea_submissions ADD COLUMN IF NOT EXISTS school_year TEXT;
ALTER TABLE public.mea_submissions ADD COLUMN IF NOT EXISTS quarter TEXT;
ALTER TABLE public.mea_submissions ADD COLUMN IF NOT EXISTS form_type TEXT;
ALTER TABLE public.mea_submissions ADD COLUMN IF NOT EXISTS monthly_learners_movement JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.mea_submissions ADD COLUMN IF NOT EXISTS failures_by_subject JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.mea_submissions ADD COLUMN IF NOT EXISTS content JSONB DEFAULT '{}'::jsonb;

-- 3. Fix Permissions (Row Level Security)
ALTER TABLE public.mea_submissions ENABLE ROW LEVEL SECURITY;

-- Reset policies to ensure they are correct
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.mea_submissions;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.mea_submissions;

-- Allow authenticated users to insert their own reports
CREATE POLICY "Enable insert for authenticated users" ON public.mea_submissions
    FOR INSERT 
    TO authenticated 
    WITH CHECK (auth.uid() = user_id);

-- Allow authenticated users to view all reports (for the Dashboard)
CREATE POLICY "Enable read access for authenticated users" ON public.mea_submissions
    FOR SELECT 
    TO authenticated 
    USING (true);

-- 4. CRITICAL: Reload the Schema Cache
-- This command fixes the "could not find the content column in the schema cache" error.
NOTIFY pgrst, 'reload config';