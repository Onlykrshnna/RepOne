import { supabase } from '../lib/supabase';
import { calculateStreaks } from './attendance.utils';

export const attendanceService = {
  async checkIn(profileId: string, method: 'qr' | 'manual' = 'qr') {
    // 1. Fetch member_id using profileId
    const { data: member, error: memberErr } = await supabase
      .from('members')
      .select('id')
      .eq('profile_id', profileId)
      .single();
      
    if (memberErr || !member) throw new Error('Member record not found');

    // 2. Enforce limits: 3 times a day, 1 hour gap
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { data: todaysCheckins, error: checkinsErr } = await supabase
      .from('attendance')
      .select('check_in_time')
      .eq('member_id', member.id)
      .gte('check_in_time', today.toISOString())
      .order('check_in_time', { ascending: false });

    if (checkinsErr) throw new Error('Failed to verify check-in history');

    if (todaysCheckins && todaysCheckins.length > 0) {
      // Limit 1: Max 3 entries per day
      if (todaysCheckins.length >= 3) {
        throw new Error('Maximum daily check-in limit reached (3/3).');
      }

      // Limit 2: Minimum 1 hour between check-ins
      const lastCheckinTime = new Date(todaysCheckins[0].check_in_time).getTime();
      const now = new Date().getTime();
      const hoursDifference = (now - lastCheckinTime) / (1000 * 60 * 60);

      if (hoursDifference < 1) {
        const minutesLeft = Math.ceil((1 - hoursDifference) * 60);
        throw new Error(`Please wait ${minutesLeft} more minutes before your next check-in.`);
      }
    }

    // 3. Insert into attendance using member.id
    const { data, error } = await supabase
      .from('attendance')
      .insert([{
        member_id: member.id,
        method,
      }])
      .select('*')
      .single();

    if (error) {
      if (error.code === '23505') { // unique_violation
        throw new Error('ALREADY_CHECKED_IN');
      }
      throw error;
    }

    return data;
  },

  async getMemberStreak(profileId: string) {
    const { data: member } = await supabase.from('members').select('id').eq('profile_id', profileId).single();
    if (!member) return calculateStreaks([]);

    const { data, error } = await supabase
      .from('attendance')
      .select('check_in_time')
      .eq('member_id', member.id)
      .order('check_in_time', { ascending: false });
    
    if (error) throw error;
    
    return calculateStreaks(data || []);
  },

  async getTodayAttendance() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { data, error } = await supabase
      .from('attendance')
      .select('*')
      .gte('check_in_time', today.toISOString())
      .order('check_in_time', { ascending: false });

    if (error) throw error;
    if (!data || data.length === 0) return [];

    const memberIds = [...new Set(data.map(d => d.member_id))];
    const { data: membersData } = await supabase
      .from('members')
      .select('id, profiles(id, first_name, last_name, email, avatar_url, membership_status)')
      .in('id', memberIds);

    const memberMap = new Map();
    if (membersData) {
      for (const m of membersData) {
        memberMap.set(m.id, m.profiles);
      }
    }

    return data.map(d => ({
      ...d,
      profiles: memberMap.get(d.member_id) || null
    }));
  },

  async getAttendanceHistory(filters?: { search?: string, startDate?: string, endDate?: string }) {
    let query = supabase
      .from('attendance')
      .select('*')
      .order('check_in_time', { ascending: false })
      .limit(500); // Limit for performance
    
    if (filters?.startDate) {
      query = query.gte('check_in_time', new Date(filters.startDate).toISOString());
    }
    if (filters?.endDate) {
      const end = new Date(filters.endDate);
      end.setHours(23, 59, 59, 999);
      query = query.lte('check_in_time', end.toISOString());
    }

    let { data: attendanceData, error } = await query;
    if (error) throw error;
    if (!attendanceData || attendanceData.length === 0) return [];

    const memberIds = [...new Set(attendanceData.map(a => a.member_id))];
    
    let profilesQuery = supabase
      .from('members')
      .select('id, profiles!inner(id, first_name, last_name, email)')
      .in('id', memberIds);
      
    if (filters?.search) {
      profilesQuery = profilesQuery.or(`first_name.ilike.%${filters.search}%,last_name.ilike.%${filters.search}%`, { foreignTable: 'profiles' });
    }
    
    const { data: membersData, error: memErr } = await profilesQuery;
    if (memErr) throw memErr;
    
    const memberMap = new Map();
    for (const m of membersData) {
       memberMap.set(m.id, m.profiles);
    }
    
    if (filters?.search) {
      attendanceData = attendanceData.filter(a => memberMap.has(a.member_id));
    }
    
    return attendanceData.map(a => ({
      ...a,
      profiles: memberMap.get(a.member_id) || null
    }));
  },

  async getMemberAttendance(profileId: string) {
    const { data: member } = await supabase.from('members').select('id').eq('profile_id', profileId).single();
    if (!member) return [];

    const { data, error } = await supabase
      .from('attendance')
      .select('*')
      .eq('member_id', member.id)
      .order('check_in_time', { ascending: false })
      .limit(200);

    if (error) throw error;
    return data || [];
  },

  async manualCheckOut(attendanceId: string) {
    // Calling the RPC since we need to just set it to now() securely
    const { error } = await supabase.rpc('manual_checkout', { p_attendance_id: attendanceId });
    if (error) {
      const { error: updateError } = await supabase
        .from('attendance')
        .update({ check_out_time: new Date().toISOString() })
        .eq('id', attendanceId)
        .is('check_out_time', null);
      if (updateError) throw updateError;
    }
  }
};
