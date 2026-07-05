-- =====================================================
-- GUEST PASSES TABLE
-- Run this in your Supabase SQL Editor
-- =====================================================

CREATE TABLE IF NOT EXISTS public.guest_passes (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  generated_by     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  guest_name       TEXT NOT NULL,
  guest_phone      TEXT,
  guest_email      TEXT,
  pass_code        TEXT NOT NULL UNIQUE,
  valid_from       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  valid_until      TIMESTAMPTZ NOT NULL,
  is_used          BOOLEAN NOT NULL DEFAULT FALSE,
  used_at          TIMESTAMPTZ,
  used_by_staff    UUID REFERENCES public.profiles(id),
  notes            TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_guest_passes_generated_by  ON public.guest_passes(generated_by);
CREATE INDEX IF NOT EXISTS idx_guest_passes_pass_code     ON public.guest_passes(pass_code);
CREATE INDEX IF NOT EXISTS idx_guest_passes_valid_until   ON public.guest_passes(valid_until);
CREATE INDEX IF NOT EXISTS idx_guest_passes_is_used       ON public.guest_passes(is_used);

-- Row Level Security
ALTER TABLE public.guest_passes ENABLE ROW LEVEL SECURITY;

-- Admins can do everything
CREATE POLICY "Admins manage guest passes"
  ON public.guest_passes FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.set_guest_passes_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER guest_passes_updated_at
  BEFORE UPDATE ON public.guest_passes
  FOR EACH ROW EXECUTE FUNCTION public.set_guest_passes_updated_at();
