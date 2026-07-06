import { supabase } from '../lib/supabase';
import { authService } from './auth.service';
import { profileService } from './profile.service';

export interface PaymentRequest {
  profile_id: string;
  membership_plan_id: string;
  amount: number;
  currency?: string;
  payment_method: string;
  transaction_reference?: string;
  payment_proof?: string;
}

export const paymentService = {
  async createPaymentRequest(req: PaymentRequest) {
    console.log('[LIFECYCLE STEP 1] Payment submission started.', req);
    console.log('[LIFECYCLE STEP 2] Inserting payment row into payments table...');

    const { data, error } = await supabase
      .from('payments')
      .insert([{
        ...req,
        status: 'pending',
      }])
      .select()
      .single();

    if (error) {
      console.error('[LIFECYCLE ERROR] Payment insert failed with exact error:', error);
      throw error;
    }

    console.log(`[LIFECYCLE STEP 3] Payment insert returned success. Row ID: ${data.id}`);

    // Immediately update user status to pending so they see the awaiting approval screen
    await supabase
      .from('profiles')
      .update({ membership_status: 'pending', membership_requested_at: new Date().toISOString() })
      .eq('id', req.profile_id);

    return data;
  },

  async getAdminPayments(filters?: { status?: string, search?: string }) {
    let query = supabase
      .from('payments')
      .select(`
        *,
        profiles!profile_id (
          id, first_name, last_name, email, avatar_url
        ),
        membership_plans!membership_plan_id (
          id, name, duration_days
        )
      `)
      .order('payment_date', { ascending: false });

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    
    // For search, we might need a separate function if doing complex ILIKE on foreign tables, 
    // but in Supabase, we can filter locally or use inner joins. We will filter locally for simplicity here.
    
    const { data, error } = await query;
    let results = (data || []) as any[];

    // Ensure profiles and membership plans are mapped correctly from offline cache if missing
    results = results.map(p => {
      if (p.profiles === undefined && p.member_id) {
        p.profiles = null;
      }
      if (!p.membership_plans && p.membership_plan_id) {
        p.membership_plans = null;
      }
      return p;
    });

    results = results.filter(p => {
      const email = p.profiles?.email || '';
      return email !== 'krpris9211@gmail.com' && 
             email !== 'krpris1922@gmail.com';
    });

    if (filters?.status) {
      results = results.filter((p: any) => p.status === filters.status);
    }

    if (filters?.search) {
      const lower = filters.search.toLowerCase();
      results = results.filter((p: any) => 
        (p.profiles?.first_name || '').toLowerCase().includes(lower) || 
        (p.profiles?.last_name || '').toLowerCase().includes(lower) ||
        (p.profiles?.email || '').toLowerCase().includes(lower) ||
        (p.transaction_reference || '').toLowerCase().includes(lower)
      );
    }

    return results;
  },

  async getMemberPayments(profileId: string) {
    const { data, error } = await supabase
      .from('payments')
      .select(`
        *,
        membership_plans!membership_plan_id (
          id, name, duration_days
        )
      `)
      .eq('profile_id', profileId)
      .order('payment_date', { ascending: false });

    if (error) {
      console.warn('Supabase error in getMemberPayments:', error);
      throw error;
    }
    return data;
  },

  async approvePayment(paymentId: string, adminId: string) {
    // 1. Fetch the payment details to get profile_id and plan_id
    const { data: payment, error: payError } = await supabase
      .from('payments')
      .select('profile_id, membership_plan_id')
      .eq('id', paymentId)
      .single();

    if (payError || !payment) {
      console.error('Payment not found:', payError);
      throw new Error('Payment not found.');
    }

    // 2. Determine end date by fetching real plan from DB
    let durationDays = 30;
    if (payment.membership_plan_id) {
      const { data: planData } = await supabase
        .from('membership_plans')
        .select('duration_days')
        .eq('id', payment.membership_plan_id)
        .single();
      if (planData?.duration_days) {
        durationDays = planData.duration_days;
      }
    }
    const endDate = new Date(Date.now() + durationDays * 86400000).toISOString();

    // 3. Call approve_payment_transaction RPC
    const { error: rpcError } = await supabase.rpc('approve_payment_transaction', {
      p_payment_id: paymentId,
      p_admin_id: adminId,
      p_end_date: endDate
    });

    if (rpcError) {
      console.error('[LIFECYCLE ERROR] RPC approve_payment_transaction failed:', rpcError);
      throw rpcError;
    }

    profileService.clearProfileCache();
    return true;
  },

  async rejectPayment(paymentId: string, adminId: string, notes: string) {
    // 1. Update payment status
    const { error: paymentError } = await supabase
      .from('payments')
      .update({ 
        status: 'rejected', 
        remarks: notes,
        verified_at: new Date().toISOString(),
        verified_by: adminId 
      })
      .eq('id', paymentId);

    if (paymentError) {
      throw paymentError;
    }
    profileService.clearProfileCache();

    // 2. Fetch member id from payment
    const { data: payment } = await supabase
      .from('payments')
      .select('profile_id')
      .eq('id', paymentId)
      .single();

    // 3. Update profile status to rejected
    if (payment) {
      await supabase
        .from('profiles')
        .update({ 
          membership_status: 'rejected',
          admin_notes: notes 
        })
        .eq('id', payment.profile_id);
    }

    return true;
  },
  
  async getDashboardRevenue() {
    try {
      // Simplified for demo: Summing approved payments
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

      const [todayRes, monthRes] = await Promise.all([
        supabase
          .from('payments')
          .select('amount')
          .eq('status', 'completed')
          .gte('payment_date', today.toISOString()),
        supabase
          .from('payments')
          .select('amount')
          .eq('status', 'completed')
          .gte('payment_date', firstDayOfMonth.toISOString())
      ]);

      if (todayRes.error || monthRes.error) {
        throw todayRes.error || monthRes.error;
      }

      const todayRevenue = todayRes.data?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;
      const monthRevenue = monthRes.data?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;

      return {
        today: todayRevenue,
        month: monthRevenue
      };
    } catch (e) {
      console.warn('Supabase error in getDashboardRevenue:', e);
      return { today: 0, month: 0 };
    }
  }
};
