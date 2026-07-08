-- ====================================================
-- Trainer Management Database Setup
-- Run this in your Supabase SQL Editor
-- ====================================================

-- 1. Create Trainers Table
CREATE TABLE IF NOT EXISTS public.trainers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    gym_id UUID REFERENCES public.gyms(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    specialization TEXT,
    experience_years INTEGER DEFAULT 0,
    bio TEXT,
    photo_url TEXT,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.trainers ENABLE ROW LEVEL SECURITY;

-- 3. Create RLS Policies
DROP POLICY IF EXISTS "Everyone views active trainers" ON public.trainers;
CREATE POLICY "Everyone views active trainers" ON public.trainers
    FOR SELECT USING (status = 'active' OR public.is_admin());

DROP POLICY IF EXISTS "Admins manage trainers" ON public.trainers;
CREATE POLICY "Admins manage trainers" ON public.trainers
    FOR ALL USING (public.is_admin());

-- 4. Add trainer_id column to classes table if it does not exist
ALTER TABLE public.classes ADD COLUMN IF NOT EXISTS trainer_id UUID REFERENCES public.trainers(id) ON DELETE SET NULL;
