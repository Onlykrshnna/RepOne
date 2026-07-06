-- ============================================================
-- SCHEMA MIGRATION: Align database to frontend expectations
-- Safe: ALTER only. Never DROP. Never deletes user data.
-- Run in Supabase SQL Editor.
-- ============================================================

-- ============================================================
-- 1. profiles table — add missing columns
-- ============================================================
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS username TEXT,
  ADD COLUMN IF NOT EXISTS membership_requested_at TIMESTAMP WITH TIME ZONE;

-- Index on username for fast lookup (used in approveMemberByUsername)
CREATE UNIQUE INDEX IF NOT EXISTS profiles_username_idx ON public.profiles(username);


-- ============================================================
-- 2. payments table — add ALL missing columns
-- ============================================================
ALTER TABLE public.payments
  ADD COLUMN IF NOT EXISTS membership_plan_id UUID REFERENCES public.membership_plans(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS currency TEXT NOT NULL DEFAULT 'INR',
  ADD COLUMN IF NOT EXISTS transaction_reference TEXT,
  ADD COLUMN IF NOT EXISTS payment_proof TEXT,
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'completed', 'approved', 'rejected', 'failed', 'refunded')),
  ADD COLUMN IF NOT EXISTS payment_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  ADD COLUMN IF NOT EXISTS verified_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS verified_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS remarks TEXT,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Index for the pending payment queue — the most-queried path
CREATE INDEX IF NOT EXISTS payments_status_idx ON public.payments(status);
CREATE INDEX IF NOT EXISTS payments_member_id_idx ON public.payments(member_id);
CREATE INDEX IF NOT EXISTS payments_payment_date_idx ON public.payments(payment_date DESC);

-- Enable Realtime on payments so the admin dashboard reacts live
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication p
    JOIN pg_publication_rel pr ON p.oid = pr.prpubid
    JOIN pg_class c ON pr.prrelid = c.oid
    WHERE p.pubname = 'supabase_realtime' AND c.relname = 'payments'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.payments;
  END IF;
END $$;


-- ============================================================
-- 3. membership_plans — add alias columns the frontend expects
--    The DB uses 'plan_name'.
--    We add 'name' as a real column and backfill it.
--    'duration_days' already exists.
-- ============================================================
ALTER TABLE public.membership_plans
  ADD COLUMN IF NOT EXISTS name TEXT,
  ADD COLUMN IF NOT EXISTS duration_days INTEGER,
  ADD COLUMN IF NOT EXISTS features JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true;

-- Backfill the new alias column from the existing column
UPDATE public.membership_plans
  SET name = plan_name
  WHERE name IS NULL AND plan_name IS NOT NULL;

-- Keep them in sync via a trigger (only for name/plan_name now)
CREATE OR REPLACE FUNCTION sync_membership_plan_aliases()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.plan_name IS DISTINCT FROM OLD.plan_name THEN
    NEW.name := NEW.plan_name;
  END IF;
  IF NEW.name IS DISTINCT FROM OLD.name THEN
    NEW.plan_name := NEW.name;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS membership_plan_alias_sync ON public.membership_plans;
CREATE TRIGGER membership_plan_alias_sync
  BEFORE INSERT OR UPDATE ON public.membership_plans
  FOR EACH ROW EXECUTE FUNCTION sync_membership_plan_aliases();


-- ============================================================
-- 4. member_memberships — CREATE the table (does not exist)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.member_memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  plan_id UUID REFERENCES public.membership_plans(id) ON DELETE SET NULL,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'expired', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX IF NOT EXISTS member_memberships_member_id_idx ON public.member_memberships(member_id);

-- RLS
ALTER TABLE public.member_memberships ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Members can view own memberships" ON public.member_memberships;
CREATE POLICY "Members can view own memberships"
  ON public.member_memberships FOR SELECT
  USING (auth.uid() = member_id);

DROP POLICY IF EXISTS "Admins can manage memberships" ON public.member_memberships;
CREATE POLICY "Admins can manage memberships"
  ON public.member_memberships FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  ));


-- ============================================================
-- 5. guest_passes — add missing columns
-- ============================================================
ALTER TABLE public.guest_passes
  ADD COLUMN IF NOT EXISTS member_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS guest_email TEXT,
  ADD COLUMN IF NOT EXISTS guest_phone TEXT,
  ADD COLUMN IF NOT EXISTS pass_code TEXT,
  ADD COLUMN IF NOT EXISTS is_used BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS used_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT now();


-- ============================================================
-- 6. bookings — add missing columns
--    DB uses 'booked_at'; frontend expects 'booking_date' and 'created_at'
-- ============================================================
ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS booking_date TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Backfill booking_date from booked_at if it exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bookings' AND column_name = 'booked_at'
  ) THEN
    UPDATE public.bookings SET booking_date = booked_at WHERE booking_date IS NULL;
  END IF;
END $$;


-- ============================================================
-- 7. RLS for payments — ensure members can insert their own
-- ============================================================
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Drop old policies if any, then recreate cleanly
DROP POLICY IF EXISTS "Members can insert own payments" ON public.payments;
DROP POLICY IF EXISTS "Members can view own payments" ON public.payments;
DROP POLICY IF EXISTS "Admins can manage payments" ON public.payments;

CREATE POLICY "Members can insert own payments"
  ON public.payments FOR INSERT
  WITH CHECK (auth.uid() = member_id);

CREATE POLICY "Members can view own payments"
  ON public.payments FOR SELECT
  USING (auth.uid() = member_id);

CREATE POLICY "Admins can manage payments"
  ON public.payments FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  ));


-- ============================================================
-- 8. approve_payment_transaction RPC — Atomic approval
-- ============================================================
CREATE OR REPLACE FUNCTION public.approve_payment_transaction(
  p_payment_id UUID,
  p_admin_id   UUID,
  p_end_date   TIMESTAMP WITH TIME ZONE
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_member_id UUID;
  v_plan_id   UUID;
BEGIN
  -- Lock and validate the payment row
  SELECT member_id, membership_plan_id
    INTO v_member_id, v_plan_id
    FROM public.payments
   WHERE id = p_payment_id AND status = 'pending'
     FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Payment % not found or is not pending', p_payment_id;
  END IF;

  -- Step 11: Update payment status
  UPDATE public.payments
     SET status      = 'completed',
         verified_by = p_admin_id,
         verified_at = now(),
         payment_date = now()
   WHERE id = p_payment_id;

  -- Step 12: Update profile membership status
  UPDATE public.profiles
     SET membership_status    = 'active',
         approved_by          = p_admin_id,
         approved_at          = now(),
         payment_verified_at  = now(),
         updated_at           = now()
   WHERE id = v_member_id;

  -- Step 13: Create member_memberships record
  INSERT INTO public.member_memberships (member_id, plan_id, start_date, end_date, status)
  VALUES (v_member_id, v_plan_id, now(), p_end_date, 'active');
END;
$$;


-- ============================================================
-- 9. check_membership_expiry RPC — used by dashboard.service.ts
-- ============================================================
CREATE OR REPLACE FUNCTION public.check_membership_expiry()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Mark memberships that have passed their end_date as expired
  UPDATE public.member_memberships
     SET status = 'expired'
   WHERE status = 'active' AND end_date < now();

  -- Update profiles whose active membership has now expired
  UPDATE public.profiles p
     SET membership_status = 'expired',
         updated_at = now()
   WHERE p.membership_status = 'active'
     AND NOT EXISTS (
       SELECT 1 FROM public.member_memberships mm
        WHERE mm.member_id = p.id AND mm.status = 'active'
     );
END;
$$;


-- ============================================================
-- 10. Ensure 'avatars' storage bucket exists
-- ============================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload their own avatar
DROP POLICY IF EXISTS "Avatar uploads by owner" ON storage.objects;
CREATE POLICY "Avatar uploads by owner"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Avatars are publicly readable" ON storage.objects;
CREATE POLICY "Avatars are publicly readable"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');
