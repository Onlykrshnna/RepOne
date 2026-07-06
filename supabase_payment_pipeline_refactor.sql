-- 1. Create the members table (for active memberships) if it doesn't exist
CREATE TABLE IF NOT EXISTS public.members (
    id UUID PRIMARY KEY REFERENCES public.profiles(id),
    membership_plan_id UUID REFERENCES public.membership_plans(id) ON DELETE SET NULL,
    join_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expiry_date TIMESTAMP WITH TIME ZONE,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled', 'frozen')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Members can view own row" ON public.members;
    CREATE POLICY "Members can view own row" ON public.members 
        FOR SELECT USING (id = auth.uid());

    DROP POLICY IF EXISTS "Admins can manage members" ON public.members;
    CREATE POLICY "Admins can manage members" ON public.members 
        FOR ALL USING (public.is_admin());
END $$;

-- 2. Alter payments table safely
DO $$
BEGIN
    -- Check if member_id column exists before renaming
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'payments' 
        AND column_name = 'member_id'
    ) THEN
        ALTER TABLE public.payments RENAME COLUMN member_id TO profile_id;
    END IF;
END $$;

DO $$
BEGIN
    -- Drop the old constraint if it exists
    ALTER TABLE public.payments DROP CONSTRAINT IF EXISTS payments_member_id_fkey;
    
    -- Drop the new constraint if it exists to allow idempotency
    ALTER TABLE public.payments DROP CONSTRAINT IF EXISTS payments_profile_id_fkey;
    
    -- Add the new constraint referencing profiles WITHOUT CASCADE
    ALTER TABLE public.payments ADD CONSTRAINT payments_profile_id_fkey 
        FOREIGN KEY (profile_id) REFERENCES public.profiles(id);
EXCEPTION WHEN OTHERS THEN
    -- Ignore if constraints already exist or are missing
END $$;

-- 3. Update RLS policies on payments to use profile_id
DO $$
BEGIN
    DROP POLICY IF EXISTS "Members can view own payments" ON public.payments;
    DROP POLICY IF EXISTS "Users can view own payments" ON public.payments;
    
    CREATE POLICY "Users can view own payments" ON public.payments
        FOR SELECT USING (auth.uid() = profile_id);

    DROP POLICY IF EXISTS "Members can insert own payments" ON public.payments;
    DROP POLICY IF EXISTS "Users can insert own payments" ON public.payments;
    
    CREATE POLICY "Users can insert own payments" ON public.payments
        FOR INSERT WITH CHECK (auth.uid() = profile_id);
END $$;

-- 4. Update the RPC to create a members row incrementally
CREATE OR REPLACE FUNCTION public.approve_payment_transaction(
    p_payment_id UUID,
    p_admin_id UUID,
    p_end_date TIMESTAMP WITH TIME ZONE
) RETURNS VOID AS $$
DECLARE
    v_profile_id UUID;
    v_plan_id UUID;
BEGIN
    SELECT profile_id, membership_plan_id INTO v_profile_id, v_plan_id 
    FROM public.payments 
    WHERE id = p_payment_id AND status = 'pending'
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Payment not found or already processed';
    END IF;

    UPDATE public.payments 
    SET status = 'completed', 
        payment_date = NOW(),
        verified_by = p_admin_id,
        verified_at = NOW()
    WHERE id = p_payment_id;

    UPDATE public.profiles 
    SET membership_status = 'active',
        approved_by = p_admin_id,
        approved_at = NOW(),
        payment_verified_at = NOW(),
        updated_at = NOW()
    WHERE id = v_profile_id;

    -- Create or update the members row without relying on destructive actions
    INSERT INTO public.members (
        id, 
        membership_plan_id, 
        join_date, 
        expiry_date, 
        status
    ) VALUES (
        v_profile_id,
        v_plan_id,
        NOW(),
        p_end_date,
        'active'
    )
    ON CONFLICT (id) DO UPDATE SET
        membership_plan_id = EXCLUDED.membership_plan_id,
        expiry_date = EXCLUDED.expiry_date,
        status = 'active',
        updated_at = NOW();

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
