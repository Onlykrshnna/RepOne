-- 1. Rename column and fix foreign keys idempotently
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
    -- Drop the old constraint referencing members(id) if it exists
    -- The name might be 'payments_member_id_fkey'
    ALTER TABLE public.payments DROP CONSTRAINT IF EXISTS payments_member_id_fkey;
    
    -- Drop the new constraint if it exists to allow idempotency
    ALTER TABLE public.payments DROP CONSTRAINT IF EXISTS payments_profile_id_fkey;
    
    -- Add the new constraint referencing profiles
    ALTER TABLE public.payments ADD CONSTRAINT payments_profile_id_fkey 
        FOREIGN KEY (profile_id) REFERENCES public.profiles(id);
EXCEPTION WHEN OTHERS THEN
    -- Ignore if constraints already exist or are missing in a weird state
END $$;

-- 2. Update RLS policies on payments to use profile_id
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

-- 3. Update the RPC to use profile_id instead of member_id and standardized 'completed' status
CREATE OR REPLACE FUNCTION public.approve_payment_transaction(
    p_payment_id UUID,
    p_admin_id UUID,
    p_end_date TIMESTAMP WITH TIME ZONE
) RETURNS VOID AS $$
DECLARE
    v_profile_id UUID;
    v_plan_id UUID;
BEGIN
    -- We read profile_id from the payment
    SELECT profile_id, membership_plan_id INTO v_profile_id, v_plan_id 
    FROM public.payments 
    WHERE id = p_payment_id AND status = 'pending'
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Payment not found or already processed';
    END IF;

    -- Update payment status to completed
    UPDATE public.payments 
    SET status = 'completed', 
        payment_date = NOW(),
        verified_by = p_admin_id,
        verified_at = NOW()
    WHERE id = p_payment_id;

    -- Update profile status
    UPDATE public.profiles 
    SET membership_status = 'active',
        approved_by = p_admin_id,
        approved_at = NOW(),
        payment_verified_at = NOW(),
        updated_at = NOW()
    WHERE id = v_profile_id;

    -- Note: If members table exists, you can insert/update it here, 
    -- but as requested, no parallel architectures are created here.
    -- If the members table exists and needs updating, ensure it uses profiles(id)
    -- We'll safely try to upsert if the members table exists to preserve gym access:
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'members') THEN
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
    END IF;

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
