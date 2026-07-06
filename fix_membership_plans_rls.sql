-- Fix RLS so anyone can view the membership plans (needed for the frontend to list them)
DROP POLICY IF EXISTS "Membership plans are viewable by everyone" ON public.membership_plans;
CREATE POLICY "Membership plans are viewable by everyone" 
  ON public.membership_plans FOR SELECT 
  USING (true);

-- Ensure admins can manage them
DROP POLICY IF EXISTS "Admins can manage membership plans" ON public.membership_plans;
CREATE POLICY "Admins can manage membership plans" 
  ON public.membership_plans FOR ALL 
  USING (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  ));

-- (Optional) If your table is actually empty, run this to seed the default plans:
INSERT INTO public.membership_plans (plan_name, name, description, price, duration_days, is_active)
VALUES 
  ('Basic Pass', 'Basic Pass', 'Perfect for casual gym goers looking to stay active.', 1999, 30, true),
  ('Elite Gym Pass', 'Elite Gym Pass', 'Our most popular option for dedicated fitness enthusiasts.', 2999, 90, true),
  ('VIP Unlimited', 'VIP Unlimited', 'All-inclusive premium experience with absolute freedom.', 4999, 180, true)
ON CONFLICT DO NOTHING;
