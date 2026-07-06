import { supabase } from '../lib/supabase';
import { profileService } from './profile.service';

export type MemberProfile = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  username?: string;
  phone?: string;
  gender?: string;
  date_of_birth?: string;
  address?: string;
  emergency_contact?: string;
  role: 'member' | 'admin';
  avatar_url?: string;
  is_active: boolean;
  membership_status: 'pending' | 'active' | 'expired' | 'suspended' | 'rejected';
  approved_by?: string;
  approved_at?: string;
  membership_requested_at?: string;
  payment_verified_at?: string;
  admin_notes?: string;
  created_at: string;
  updated_at: string;
  // Computed fields from joins
  members?: any[];
  attendance?: any[];
};

export const membersService = {
  async getMembers(filters?: { search?: string; status?: string; plan?: string }) {
    let query = supabase
      .from('profiles')
      .select(`
        *,
        members (
          id,
          membership_plan_id,
          join_date,
          expiry_date,
          status,
          membership_plans (
            name
          )
        )
      `)
      .eq('role', 'member')
      .not('email', 'in', '("krpris9211@gmail.com","krpris1922@gmail.com")');

    if (filters?.search) {
      query = query.or(`first_name.ilike.%${filters.search}%,last_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%,username.ilike.%${filters.search}%`);
    }
    
    if (filters?.status) {
      if (filters.status === 'active') {
        query = query.eq('is_active', true);
      } else if (filters.status === 'inactive') {
        query = query.eq('is_active', false);
      } else if (filters.status === 'pending') {
        query = query.eq('membership_status', 'pending');
      }
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    
    let list = (data || []) as MemberProfile[];
    list = list.filter(m => 
      m.email !== 'krpris9211@gmail.com' && 
      m.email !== 'krpris1922@gmail.com'
    );

    if (filters?.search) {
      const searchLower = filters.search.toLowerCase();
      list = list.filter(m => 
        m.first_name.toLowerCase().includes(searchLower) ||
        (m.last_name || '').toLowerCase().includes(searchLower) ||
        m.email.toLowerCase().includes(searchLower) ||
        (m.username && m.username.toLowerCase().includes(searchLower))
      );
    }
    if (filters?.status) {
      if (filters.status === 'active') {
        list = list.filter(m => m.is_active === true);
      } else if (filters.status === 'inactive') {
        list = list.filter(m => m.is_active === false);
      } else if (filters.status === 'pending') {
        list = list.filter(m => m.membership_status === 'pending');
      }
    }
    return list;
  },

  async getMemberById(id: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select(`
        *,
        members (
          id,
          join_date,
          expiry_date,
          status,
          membership_plans ( name ),
          attendance (
            id,
            check_in_time,
            method
          )
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      throw error;
    }

    const parsedData = data as any;
    if (parsedData && parsedData.members && parsedData.members.length > 0) {
      parsedData.attendance = parsedData.members[0].attendance || [];
    } else {
      parsedData.attendance = [];
    }

    return parsedData as MemberProfile;
  },

  async createMember(memberData: Partial<MemberProfile>, file?: File) {
    const id = typeof crypto !== 'undefined' && crypto.randomUUID 
      ? crypto.randomUUID() 
      : Math.random().toString(36).substring(2) + Date.now().toString(36);
    let avatar_url = undefined;

    if (file) {
      avatar_url = await this.uploadAvatar(id, file);
    }

    const { data, error } = await supabase
      .from('profiles')
      .insert([{
        id,
        role: 'member',
        first_name: memberData.first_name,
        last_name: memberData.last_name,
        email: memberData.email,
        username: memberData.username,
        phone: memberData.phone,
        gender: memberData.gender,
        date_of_birth: memberData.date_of_birth === '' ? null : memberData.date_of_birth,
        address: memberData.address,
        emergency_contact: memberData.emergency_contact,
        avatar_url,
      }])
      .select()
      .single();

    if (error) throw error;
    
    return data;
  },

  async updateMember(id: string, memberData: Partial<MemberProfile>, file?: File) {
    let avatar_url = memberData.avatar_url;

    if (file) {
      avatar_url = await this.uploadAvatar(id, file);
    }

    const payload = {
      ...memberData,
      date_of_birth: memberData.date_of_birth === '' ? null : memberData.date_of_birth,
      avatar_url,
      updated_at: new Date().toISOString(),
    };

    let { data, error } = await supabase
      .from('profiles')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.message && (error.message.includes('column') || error.code === 'PGRST200')) {
        const corePayload = {
          first_name: memberData.first_name,
          last_name: memberData.last_name,
          phone: memberData.phone,
          avatar_url,
          updated_at: new Date().toISOString(),
        };

        const retry = await supabase
          .from('profiles')
          .update(corePayload)
          .eq('id', id)
          .select()
          .single();

        if (retry.error) throw retry.error;
        data = retry.data;
      } else {
        throw error;
      }
    }

    profileService.clearProfileCache();
    return data;
  },

  async deleteMember(id: string) {
    const { error } = await supabase
      .from('profiles')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw error;
  },

  async approvePayment(paymentId: string, durationDays: number, adminId: string) {
    const endDate = new Date(Date.now() + (durationDays || 30) * 86400000).toISOString();

    const rpcPayload = {
      p_payment_id: paymentId,
      p_admin_id: adminId,
      p_end_date: endDate
    };

    console.log('[RPC TRACE] ==============================');
    console.log('[RPC TRACE] Executing approve_payment_transaction RPC');
    console.log('[RPC TRACE] RPC Request Payload (exact):', JSON.stringify(rpcPayload, null, 2));
    
    const rpcResponse = await supabase.rpc('approve_payment_transaction', rpcPayload);

    console.log('[RPC TRACE] RPC Response/Error (exact):', JSON.stringify(rpcResponse, null, 2));
    console.log('[RPC TRACE] ==============================');

    if (rpcResponse.error) {
      console.error('[LIFECYCLE ERROR] RPC approve_payment_transaction failed:', rpcResponse.error);
      throw rpcResponse.error;
    }

    return true;
  },

  async approveMember(memberId: string, adminId: string) {
    // 1. Get the pending payment for this member
    const { data: payment, error: payError } = await supabase
      .from('payments')
      .select('id, membership_plan_id')
      .eq('profile_id', memberId)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (payError || !payment) {
      console.error('No pending payment found for member to approve:', payError);
      throw new Error('No pending payment found for this member.');
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

    const rpcPayload = {
      p_payment_id: payment.id,
      p_admin_id: adminId,
      p_end_date: endDate // NOTE: Was passing p_expiry_date before, but RPC expects p_end_date!
    };

    console.log('[RPC TRACE] ==============================');
    console.log('[RPC TRACE] Executing approve_payment_transaction RPC');
    console.log('[RPC TRACE] RPC Request Payload (exact):', JSON.stringify(rpcPayload, null, 2));
    console.log('[RPC TRACE] Payment ID matches DB Row:', payment.id);
    
    const rpcResponse = await supabase.rpc('approve_payment_transaction', rpcPayload);

    console.log('[RPC TRACE] RPC Response/Error (exact):', JSON.stringify(rpcResponse, null, 2));
    console.log('[RPC TRACE] ==============================');

    if (rpcResponse.error) {
      console.error('[LIFECYCLE ERROR] RPC approve_payment_transaction failed:', rpcResponse.error);
      throw rpcResponse.error;
    }

    // Step 10 is logged in the UI component on success
    return true;
  },

  async approveMemberByUsername(username: string, adminId: string) {
    // First, find the member by username
    const { data: member, error: findError } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', username)
      .single();

    if (findError) throw findError;

    // Then update their status using the existing approve logic
    return this.approveMember(member.id, adminId);
  },

  async rejectMember(memberId: string, notes: string) {
    const { data, error } = await supabase
      .from('profiles')
      .update({
        membership_status: 'rejected',
        admin_notes: notes,
        updated_at: new Date().toISOString(),
      })
      .eq('id', memberId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async requestChangesMember(memberId: string, notes: string) {
    const { data, error } = await supabase
      .from('profiles')
      .update({
        membership_status: 'pending',
        admin_notes: notes,
        updated_at: new Date().toISOString(),
      })
      .eq('id', memberId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async uploadAvatar(userId: string, file: File) {
    const fileExt = file.name.split('.').pop();
    const filePath = `${userId}/avatar-${Math.random()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);

    return data.publicUrl;
  },

  async resetSystemTestData() {
    try {
      // Delete all records from all database tables
      await supabase.from('payments').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('bookings').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('guest_passes').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('support_tickets').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('members').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('attendance').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('profiles').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      
    } catch (e) {
      console.error('Failed to reset system test data:', e);
    }
  }
};
