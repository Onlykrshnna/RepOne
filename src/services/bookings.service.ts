import { supabase } from '../lib/supabase';
import { ClassBooking, BookingStatus } from './classes.types';

// Real bookings table columns: id, class_id, member_id, status, booking_date, created_at
// bookings.member_id references members.id (not profiles.id)

async function getGymId(): Promise<string> {
  const { data, error } = await supabase.from('gyms').select('id').limit(1).single();
  if (error || !data) {
    throw new Error('Gym has not been configured.');
  }
  return data.id;
}

export const bookingsService = {
  async bookClass(classId: string, profileId: string) {
    // 1. Verify member status is active from profiles table
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('membership_status')
      .eq('id', profileId)
      .single();

    if (profileError || !profile) {
      throw new Error('Member profile not found.');
    }

    if (profile.membership_status !== 'active') {
      throw new Error(`Booking blocked. Member membership status is: ${profile.membership_status}`);
    }

    // 2. Resolve members.id from profiles.id
    const { data: member, error: memberError } = await supabase
      .from('members')
      .select('id')
      .eq('profile_id', profileId)
      .single();

    if (memberError || !member) {
      throw new Error('Member record not found.');
    }

    // 3. Verify class exists
    const { data: gymClass, error: classError } = await supabase
      .from('classes')
      .select('id, capacity')
      .eq('id', classId)
      .single();

    if (classError || !gymClass) {
      throw new Error('Class not found.');
    }

    // 4. Insert booking
    const { data, error } = await supabase
      .from('bookings')
      .insert([{
        class_id: classId,
        member_id: member.id,
        status: 'booked',
      }])
      .select(`
        id, class_id, member_id, status, booking_date, created_at,
        classes (
          id, class_name, start_time, end_time, capacity
        )
      `)
      .single();

    if (error) {
      if (error.code === '23505') {
        throw new Error('You have already booked this class.');
      }
      throw error;
    }

    return data as ClassBooking;
  },

  async cancelBooking(bookingId: string) {
    const { data, error } = await supabase
      .from('bookings')
      .update({ status: 'cancelled' })
      .eq('id', bookingId)
      .select('id, class_id, member_id, status, created_at')
      .single();

    if (error) throw error;
    return data as ClassBooking;
  },

  async getMemberBookings(profileId: string) {
    // 1. Resolve members.id from profiles.id
    const { data: member, error: memberError } = await supabase
      .from('members')
      .select('id')
      .eq('profile_id', profileId)
      .single();

    if (memberError || !member) {
      return [];
    }

    // 2. Query bookings using members.id
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        id, class_id, member_id, status, booking_date, created_at,
        classes (
          id, class_name, start_time, end_time, capacity
        )
      `)
      .eq('member_id', member.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []) as ClassBooking[];
  },

  async getClassAttendees(classId: string) {
    // bookings -> members -> profiles
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        id, class_id, member_id, status, booking_date, created_at,
        members (
          profiles (
            first_name,
            last_name,
            email,
            phone,
            membership_status
          )
        )
      `)
      .eq('class_id', classId)
      .in('status', ['booked', 'attended', 'no_show', 'waiting'])
      .order('created_at', { ascending: true });

    if (error) throw error;
    
    return (data || []).map(row => ({
      id: row.id,
      class_id: row.class_id,
      member_id: row.member_id,
      status: row.status,
      booking_date: row.booking_date,
      created_at: row.created_at,
      profiles: (row.members as any)?.profiles || null,
    })) as ClassBooking[];
  },

  async updateAttendanceStatus(bookingId: string, status: 'attended' | 'no_show' | 'booked') {
    const { data, error } = await supabase
      .from('bookings')
      .update({ status })
      .eq('id', bookingId)
      .select('id, class_id, member_id, status, created_at')
      .single();

    if (error) throw error;
    return data as ClassBooking;
  },

  async getTodayClassAttendance() {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        id, class_id, member_id, status, booking_date, created_at,
        classes (
          id, class_name, start_time, end_time, capacity
        ),
        members (
          profiles (
            first_name,
            last_name,
            email,
            avatar_url
          )
        )
      `)
      .in('status', ['booked', 'attended', 'no_show'])
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) throw error;
    
    return (data || []).map(row => ({
      id: row.id,
      class_id: row.class_id,
      member_id: row.member_id,
      status: row.status,
      booking_date: row.booking_date,
      created_at: row.created_at,
      classes: row.classes,
      profiles: (row.members as any)?.profiles || null,
    })) as ClassBooking[];
  },

  // ====================================================
  // METRICS FOR DASHBOARD CARDS
  // ====================================================
  async getClassDashboardMetrics() {
    const { data: classes } = await supabase
      .from('classes')
      .select('id, capacity');

    const { data: bookings } = await supabase
      .from('bookings')
      .select('status, class_id');

    const totalActiveClasses = classes?.length || 0;

    const todayBookingsCount = bookings?.filter(b => b.status === 'booked' || b.status === 'attended').length || 0;
    const totalWaitingList = bookings?.filter(b => b.status === 'waiting').length || 0;
    const totalNoShows = bookings?.filter(b => b.status === 'no_show').length || 0;

    const totalCapacity = (classes || []).reduce((sum, c) => sum + (c.capacity || 0), 0);
    const availableSeats = Math.max(totalCapacity - todayBookingsCount, 0);

    return {
      todaysClasses: totalActiveClasses,
      activeClasses: totalActiveClasses,
      todayBookings: todayBookingsCount,
      availableSeats,
      waitingList: totalWaitingList,
      noShows: totalNoShows,
    };
  }
};
