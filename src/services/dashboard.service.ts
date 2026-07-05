import { supabase } from '../lib/supabase';
import { MOCK_PAYMENTS } from './payment.service';
import { MOCK_MEMBERS } from './members.service';

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
          .from('member_memberships')
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
      console.warn('Supabase error in getMetrics, falling back to mock:', err);
      
      const filteredMock = MOCK_MEMBERS.filter(m => 
        m.email !== 'krpris9211@gmail.com' && 
        m.email !== 'krpris1922@gmail.com'
      );

      return {
        totalMembers: filteredMock.length,
        todaysCheckIns: 2,
        activeMemberships: filteredMock.filter(m => m.membership_status === 'active').length,
        recentMembers: filteredMock.slice(0, 5).map(m => ({
          id: m.id,
          first_name: m.first_name,
          last_name: m.last_name,
          email: m.email,
          created_at: m.created_at || new Date().toISOString()
        })),
      };
    }
  },

  async getMemberDashboard(memberId: string): Promise<MemberDashboardData> {
    try {
      // 1. Call RPC to update expiry status before fetching (silent fail if RPC doesn't exist yet)
      await supabase.rpc('check_membership_expiry');

      // 2. Fetch active membership
      const { data: activePlan, error: activeError } = await supabase
        .from('member_memberships')
        .select('*, membership_plans(name, description)')
        .eq('member_id', memberId)
        .eq('status', 'active')
        .order('end_date', { ascending: false })
        .limit(1)
        .single();

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
        .eq('member_id', memberId)
        .eq('status', 'pending')
        .limit(1);

      if (activeError || checkinError || paymentError) {
        throw activeError || checkinError || paymentError;
      }

      let daysRemaining = null;
      if (activePlan?.end_date) {
        const end = new Date(activePlan.end_date);
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
      console.warn('Supabase error in getMemberDashboard, falling back to mock:', err);
      const member = MOCK_MEMBERS.find(m => m.id === memberId);
      const activePlan = member?.member_memberships?.find(m => m.status === 'active') || null;
      
      let daysRemaining = null;
      if (activePlan?.end_date) {
        const end = new Date(activePlan.end_date);
        const now = new Date();
        const diffTime = end.getTime() - now.getTime();
        daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      }

      const hasPendingPayment = MOCK_PAYMENTS.some(p => p.member_id === memberId && p.status === 'pending');

      return {
        activePlan,
        daysRemaining,
        recentCheckins: [],
        hasPendingPayment,
        upcomingClasses: []
      };
    }
  }
};
