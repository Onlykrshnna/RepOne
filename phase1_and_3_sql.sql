-- ============================================================
-- PHASE 1: CLEAN DATABASE
-- Deletes all test/mock data and all members except admin
-- ============================================================

-- Safely delete dependent tables first
DELETE FROM public.bookings;
DELETE FROM public.classes;
DELETE FROM public.attendance;
DELETE FROM public.body_progress;
DELETE FROM public.payments;
DELETE FROM public.member_memberships;
DELETE FROM public.guest_passes;
DELETE FROM public.feedback;
DELETE FROM public.notifications;

-- Now delete all profiles except the admin
DELETE FROM public.profiles WHERE email != 'krpris9211@gmail.com';

-- Now delete all auth users except the admin
DELETE FROM auth.users WHERE email != 'krpris9211@gmail.com';

-- ============================================================
-- PHASE 3: USERNAME SYSTEM
-- Unique case-insensitive username index + Auth Trigger update
-- ============================================================

-- 1. Ensure username column exists
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS username TEXT;

-- 2. Create unique case-insensitive index
CREATE UNIQUE INDEX IF NOT EXISTS profiles_username_lower_idx ON public.profiles(lower(username));

-- 3. Replace the handle_new_user trigger to capture username from metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    email,
    first_name,
    last_name,
    username,
    role,
    membership_status,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'username', ''),
    'member',
    'pending',
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
