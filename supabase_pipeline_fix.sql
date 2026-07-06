-- Create real notifications table
CREATE TABLE IF NOT EXISTS public.admin_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT NOT NULL CHECK (type IN ('request', 'ticket', 'payment', 'system', 'member')),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for admin_notifications
ALTER TABLE public.admin_notifications ENABLE ROW LEVEL SECURITY;

-- Admins can do everything
CREATE POLICY "Admins can manage notifications" ON public.admin_notifications
    FOR ALL USING (public.is_admin());

-- System can insert notifications (e.g. from trigger or authenticated users for specific events)
-- Members can create payment/request notifications
CREATE POLICY "Authenticated users can insert notifications" ON public.admin_notifications
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Ensure the payments table has the right schema (if it was messed up)
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    membership_plan_id UUID NOT NULL,
    amount NUMERIC NOT NULL,
    currency TEXT DEFAULT 'INR',
    payment_method TEXT NOT NULL,
    transaction_reference TEXT,
    payment_proof TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
    payment_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for payments
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Admins can do everything
CREATE POLICY "Admins can manage payments" ON public.payments
    FOR ALL USING (public.is_admin());

-- Members can view their own payments
CREATE POLICY "Members can view own payments" ON public.payments
    FOR SELECT USING (auth.uid() = member_id);

-- Members can insert their own payments
CREATE POLICY "Members can insert own payments" ON public.payments
    FOR INSERT WITH CHECK (auth.uid() = member_id);

-- Make sure realtime is enabled for these tables so the dashboard updates live
alter publication supabase_realtime add table public.admin_notifications;
alter publication supabase_realtime add table public.profiles;
alter publication supabase_realtime add table public.payments;
