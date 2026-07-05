import { supabase } from '../lib/supabase';
import { authService } from './auth.service';
import { profileService } from './profile.service';
import { DUMMY_PAYMENTS, DUMMY_MEMBERSHIP_PLANS } from '../lib/dummy-data';
import { MOCK_MEMBERS } from './members.service';

const PAYMENTS_STORAGE_KEY = 'elevate_fitness_payments';

const getInitialPayments = () => {
  if (typeof window === 'undefined') return [...DUMMY_PAYMENTS];
  const stored = localStorage.getItem(PAYMENTS_STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.warn('Failed to parse stored payments', e);
    }
  }
  return [...DUMMY_PAYMENTS];
};

export let MOCK_PAYMENTS: any[] = getInitialPayments();

const savePayments = (payments: any[]) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(PAYMENTS_STORAGE_KEY, JSON.stringify(payments));
  }
};

export interface PaymentRequest {
  member_id: string;
  membership_plan_id: string;
  amount: number;
  currency?: string;
  payment_method: string;
  transaction_reference?: string;
  payment_proof?: string;
}

export const paymentService = {
  async createPaymentRequest(req: PaymentRequest) {
    const { data, error } = await supabase
      .from('payments')
      .insert([{
        ...req,
        status: 'pending',
      }])
      .select()
      .single();

    const now = new Date().toISOString();
    const newPayment = {
      id: `mock-pay-${Date.now()}`,
      member_id: req.member_id,
      membership_plan_id: req.membership_plan_id,
      amount: req.amount,
      currency: req.currency || 'INR',
      payment_method: req.payment_method,
      transaction_reference: req.transaction_reference || null,
      payment_proof: req.payment_proof || null,
      status: 'pending',
      payment_date: now,
      created_at: now,
      // joined data
      profiles: MOCK_MEMBERS.find(m => m.id === req.member_id) || null,
      membership_plans: DUMMY_MEMBERSHIP_PLANS.find(p => p.id === req.membership_plan_id) || null,
    };

    if (error) {
      console.warn('Supabase error in createPaymentRequest, falling back to mock:', error);
      MOCK_PAYMENTS = [newPayment, ...MOCK_PAYMENTS];
      savePayments(MOCK_PAYMENTS);
      // Update profile status locally
      const memIndex = MOCK_MEMBERS.findIndex(m => m.id === req.member_id);
      if (memIndex !== -1) {
        MOCK_MEMBERS[memIndex].membership_status = 'pending';
        if (typeof window !== 'undefined') {
          localStorage.setItem('elevate_fitness_members', JSON.stringify(MOCK_MEMBERS));
        }
      }

      // Sync to the database profiles table so it propagates to any browser/admin session
      try {
        const paymentPayload = {
          amount: req.amount,
          membership_plan_id: req.membership_plan_id,
          payment_method: req.payment_method,
          transaction_reference: req.transaction_reference,
          payment_proof: req.payment_proof,
          payment_date: now
        };
        
        await supabase
          .from('profiles')
          .update({
            membership_status: 'pending',
            membership_requested_at: now,
            admin_notes: `PAYMENT_PAYLOAD:${JSON.stringify(paymentPayload)}`
          })
          .eq('id', req.member_id);
      } catch (dbErr) {
        console.warn('Database fallback sync failed:', dbErr);
      }

      return newPayment;
    }

    // Immediately update user status to pending so they see the awaiting approval screen
    await supabase
      .from('profiles')
      .update({ membership_status: 'pending' })
      .eq('id', req.member_id);

    profileService.clearProfileCache();
    return data;
  },

  async getAdminPayments(filters?: { status?: string, search?: string }) {
    try {
      const { reconcileMissingProfiles } = await import('./members.service');
      await reconcileMissingProfiles();
    } catch (e) {
      console.warn('Reconciliation call failed in getAdminPayments:', e);
    }
    let query = supabase
      .from('payments')
      .select(`
        *,
        profiles (
          id, first_name, last_name, email, avatar_url
        ),
        membership_plans (
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
    const dbIds = new Set(results.map(p => p.id));
    const localPayments = MOCK_PAYMENTS.filter(p => !dbIds.has(p.id));
    results = [...results, ...localPayments];

    // Ensure profiles and membership plans are mapped correctly from offline cache if missing
    results = results.map(p => {
      if (!p.profiles && p.member_id) {
        p.profiles = MOCK_MEMBERS.find(m => m.id === p.member_id) || null;
      }
      if (!p.membership_plans && p.membership_plan_id) {
        p.membership_plans = DUMMY_MEMBERSHIP_PLANS.find(plan => plan.id === p.membership_plan_id) || null;
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

  async getMemberPayments(memberId: string) {
    const { data, error } = await supabase
      .from('payments')
      .select(`
        *,
        membership_plans (
          id, name, duration_days
        )
      `)
      .eq('member_id', memberId)
      .order('payment_date', { ascending: false });

    if (error) {
      console.warn('Supabase error in getMemberPayments, falling back to mock:', error);
      return MOCK_PAYMENTS.filter((p: any) => p.member_id === memberId);
    }
    return data;
  },

  async approvePayment(paymentId: string, adminId: string) {
    // Calling our highly secure RPC
    const { error } = await supabase.rpc('approve_payment', { 
      p_payment_id: paymentId, 
      p_admin_id: adminId 
    });

    if (error) {
      console.warn('Supabase error in approvePayment, falling back to mock:', error);
      const payIndex = MOCK_PAYMENTS.findIndex((p: any) => p.id === paymentId);
      if (payIndex !== -1) {
        MOCK_PAYMENTS[payIndex].status = 'approved';
        MOCK_PAYMENTS[payIndex].verified_at = new Date().toISOString();
        MOCK_PAYMENTS[payIndex].verified_by = adminId;
        savePayments(MOCK_PAYMENTS);
        
        // Update member status
        const memId = MOCK_PAYMENTS[payIndex].member_id;
        const memIndex = MOCK_MEMBERS.findIndex((m: any) => m.id === memId);
        if (memIndex !== -1) {
          MOCK_MEMBERS[memIndex].membership_status = 'active';
          MOCK_MEMBERS[memIndex].is_active = true;
          // Set membership plan
          const plan = DUMMY_MEMBERSHIP_PLANS.find((p: any) => p.id === MOCK_PAYMENTS[payIndex].membership_plan_id);
          MOCK_MEMBERS[memIndex].member_memberships = [{
            status: 'active',
            membership_plans: { name: plan?.name || 'Active Gym Pass' },
            end_date: new Date(Date.now() + (plan?.duration_days || 30) * 86400000).toISOString()
          }];
          if (typeof window !== 'undefined') {
            localStorage.setItem('elevate_fitness_members', JSON.stringify(MOCK_MEMBERS));
          }
        }
      }
      return true;
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
      console.warn('Supabase error in rejectPayment, falling back to mock:', paymentError);
      const payIndex = MOCK_PAYMENTS.findIndex((p: any) => p.id === paymentId);
      if (payIndex !== -1) {
        MOCK_PAYMENTS[payIndex].status = 'rejected';
        MOCK_PAYMENTS[payIndex].remarks = notes;
        MOCK_PAYMENTS[payIndex].verified_at = new Date().toISOString();
        MOCK_PAYMENTS[payIndex].verified_by = adminId;
        savePayments(MOCK_PAYMENTS);

        const memId = MOCK_PAYMENTS[payIndex].member_id;
        const memIndex = MOCK_MEMBERS.findIndex((m: any) => m.id === memId);
        if (memIndex !== -1) {
          MOCK_MEMBERS[memIndex].membership_status = 'rejected';
          MOCK_MEMBERS[memIndex].admin_notes = notes;
          if (typeof window !== 'undefined') {
            localStorage.setItem('elevate_fitness_members', JSON.stringify(MOCK_MEMBERS));
          }
        }
      }
      return true;
    }
    profileService.clearProfileCache();

    // 2. Fetch member id from payment
    const { data: payment } = await supabase
      .from('payments')
      .select('member_id')
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
        .eq('id', payment.member_id);
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
          .eq('status', 'approved')
          .gte('payment_date', today.toISOString()),
        supabase
          .from('payments')
          .select('amount')
          .eq('status', 'approved')
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
      console.warn('Supabase error in getDashboardRevenue, falling back to mock:', e);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

      const todayRevenue = MOCK_PAYMENTS
        .filter((p: any) => p.status === 'approved' && new Date(p.payment_date) >= today)
        .reduce((sum, p) => sum + Number(p.amount), 0);

      const monthRevenue = MOCK_PAYMENTS
        .filter((p: any) => p.status === 'approved' && new Date(p.payment_date) >= firstDayOfMonth)
        .reduce((sum, p) => sum + Number(p.amount), 0);

      return {
        today: todayRevenue,
        month: monthRevenue
      };
    }
  }
};
