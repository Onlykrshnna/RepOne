CREATE OR REPLACE FUNCTION public.approve_payment_transaction(
    p_payment_id UUID,
    p_admin_id UUID,
    p_end_date TIMESTAMP WITH TIME ZONE
) RETURNS VOID AS $$
DECLARE
    v_profile_id UUID;
    v_plan_id UUID;
BEGIN
    -- 1. Atomic update of payment status, extracting profile_id directly from the updated row
    UPDATE public.payments 
    SET status = 'completed', 
        payment_date = NOW(),
        verified_by = p_admin_id,
        verified_at = NOW()
    WHERE id = p_payment_id AND status = 'pending'
    RETURNING profile_id, membership_plan_id INTO v_profile_id, v_plan_id;

    IF v_profile_id IS NULL THEN
        RAISE EXCEPTION 'Payment not found or already processed';
    END IF;

    -- 2. Update profile status
    UPDATE public.profiles 
    SET membership_status = 'active',
        approved_by = p_admin_id,
        approved_at = NOW(),
        payment_verified_at = NOW(),
        updated_at = NOW()
    WHERE id = v_profile_id;

    -- 3. Safely update or insert into the members table to preserve backward compatibility
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'members') THEN
        IF EXISTS (SELECT 1 FROM public.members WHERE profile_id = v_profile_id) THEN
            UPDATE public.members
            SET membership_plan_id = v_plan_id,
                expiry_date = p_end_date::date,
                status = 'active',
                updated_at = NOW()
            WHERE profile_id = v_profile_id;
        ELSE
            INSERT INTO public.members (
                id, 
                profile_id,
                membership_plan_id, 
                join_date, 
                expiry_date, 
                status,
                created_at,
                updated_at
            ) VALUES (
                gen_random_uuid(),
                v_profile_id,
                v_plan_id,
                CURRENT_DATE,
                p_end_date::date,
                'active',
                NOW(),
                NOW()
            );
        END IF;
    END IF;

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
