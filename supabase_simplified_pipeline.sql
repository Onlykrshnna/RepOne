-- 1. Ensure Payments Table Exists with correct schema
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    membership_plan_id UUID NOT NULL,
    amount NUMERIC NOT NULL,
    currency TEXT DEFAULT 'INR',
    payment_method TEXT NOT NULL,
    transaction_reference TEXT,
    payment_proof TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded', 'approved')),
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

-- Ensure Realtime is enabled for payments so Admin Dashboard can subscribe
alter publication supabase_realtime add table public.payments;

-- 2. Create the Atomic Transaction RPC for Approving a Payment
CREATE OR REPLACE FUNCTION approve_payment_transaction(
    p_payment_id UUID,
    p_admin_id UUID,
    p_end_date TIMESTAMP WITH TIME ZONE
) RETURNS VOID AS $$
DECLARE
    v_member_id UUID;
    v_plan_id UUID;
BEGIN
    -- Get payment details and lock the row
    SELECT member_id, membership_plan_id INTO v_member_id, v_plan_id 
    FROM public.payments 
    WHERE id = p_payment_id AND status = 'pending'
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Payment not found or already processed';
    END IF;

    -- Update payment status
    UPDATE public.payments 
    SET status = 'completed', 
        payment_date = NOW()
    WHERE id = p_payment_id;

    -- Update profile status
    UPDATE public.profiles 
    SET membership_status = 'active',
        approved_by = p_admin_id,
        approved_at = NOW(),
        payment_verified_at = NOW(),
        updated_at = NOW()
    WHERE id = v_member_id;

    -- Create active membership record
    INSERT INTO public.member_memberships (
        member_id, 
        plan_id, 
        start_date, 
        end_date, 
        status
    ) VALUES (
        v_member_id,
        v_plan_id,
        NOW(),
        p_end_date,
        'active'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
