import { supabase } from '../lib/supabase';

export interface DashboardMetrics {
  totalMembers: number;
  todaysCheckIns: number;
  activeMemberships: number;
  recentMembers: Array<{ id: string; first_name: string; last_name: string; email: string; created_at: string }>;
}

export interface MemberDashboardData {
  activePlan: any;
  daysRemaining: number | null;
  recentCheckins: any[];
  hasPendingPayment: boolean;
  upcomingClasses?: any[];
}

export const dashboardService = {
  async getMetrics(): Promise<DashboardMetrics> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Run queries in parallel for better performance
      const { data: profiles, error: profErr } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email, created_at, role, membership_status')
        .eq('role', 'member');

      if (profErr) throw profErr;

      const filteredProfiles = (profiles || []).filter(p => 
        p.email !== 'krpris9211@gmail.com' && 
        p.email !== 'krpris1922@gmail.com'
      );

      const [
        todaysCheckInsRes,
        activeMembershipsRes,
      ] = await Promise.all([
        supabase
          .from('attendance')
          .select('*', { count: 'exact', head: true })
          .gte('check_in_time', today.toISOString()),
        supabase
          .from('members')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'active'),
      ]);

      if (todaysCheckInsRes.error || activeMembershipsRes.error) {
        throw todaysCheckInsRes.error || activeMembershipsRes.error;
      }

      // Sort recent members by created_at desc
      const sortedRecent = [...filteredProfiles].sort((a, b) => 
        new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
      );

      return {
        totalMembers: filteredProfiles.length,
        todaysCheckIns: todaysCheckInsRes.count || 0,
        activeMemberships: activeMembershipsRes.count || 0,
        recentMembers: sortedRecent.slice(0, 5),
      };
    } catch (err) {
      console.error('Supabase error in getMetrics:', err);
      throw err;
    }
  },

  async getMemberDashboard(memberId: string): Promise<MemberDashboardData> {
    try {
      // 1. Call RPC to update expiry status before fetching (silent fail if RPC doesn't exist yet)
      await supabase.rpc('check_membership_expiry');

      // 2. Fetch active membership
      const { data: activePlan, error: activeError } = await supabase
        .from('members')
        .select('*, membership_plans(name, description)')
        .eq('profile_id', memberId)
        .eq('status', 'active')
        .order('expiry_date', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (activeError) {
        console.error('Supabase activePlan query error:', activeError);
      }

      // 4. Fetch recent attendance
      const { data: recentCheckins, error: checkinError } = await supabase
        .from('attendance')
        .select('*')
        .eq('member_id', memberId)
        .order('check_in_time', { ascending: false })
        .limit(5);

      // 5. Check if they have a pending payment request
      const { data: pendingPayments, error: paymentError } = await supabase
        .from('payments')
        .select('id')
        .eq('profile_id', memberId)
        .eq('status', 'pending')
        .limit(1);

      if (checkinError || paymentError) {
        throw checkinError || paymentError;
      }

      let daysRemaining = null;
      if (activePlan?.expiry_date) {
        const end = new Date(activePlan.expiry_date);
        const now = new Date();
        const diffTime = end.getTime() - now.getTime();
        daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      }

      const hasPendingPayment = !!pendingPayments && pendingPayments.length > 0;

      return {
        activePlan,
        daysRemaining,
        recentCheckins: recentCheckins || [],
        hasPendingPayment,
        upcomingClasses: []
      };
    } catch (err) {
      console.error('Supabase error in getMemberDashboard:', err);
      throw err;
    }
  }
};
