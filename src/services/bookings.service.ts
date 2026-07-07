import { supabase } from '../lib/supabase';
import { ClassBooking, BookingStatus } from './classes.types';

// Real bookings table columns: id, class_id, member_id, status, booking_date, created_at
// Missing columns (code had): gym_id, booked_at (→ booking_date), cancelled_at, attended

async function getGymId(): Promise<string> {
  const { data, error } = await supabase.from('gyms').select('id').limit(1).single();
  if (error || !data) {
    throw new Error('Gym has not been configured.');
  }
  return data.id;
}

export const bookingsService = {
  async bookClass(classId: string, memberId: string) {
    // 1. Verify member status is active
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('membership_status')
      .eq('id', memberId)
      .single();

    if (profileError || !profile) {
      throw new Error('Member profile not found.');
    }

    if (profile.membership_status !== 'active') {
      throw new Error(`Booking blocked. Member membership status is: ${profile.membership_status}`);
    }

    // 2. Verify class exists
    const { data: gymClass, error: classError } = await supabase
      .from('classes')
      .select('id, capacity')
      .eq('id', classId)
      .single();

    if (classError || !gymClass) {
      throw new Error('Class not found.');
    }

    // 3. Insert booking — only use columns that exist in DB
    const { data, error } = await supabase
      .from('bookings')
      .insert([{
        class_id: classId,
        member_id: memberId,
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
    // cancelled_at column does not exist in DB — only update status
    const { data, error } = await supabase
      .from('bookings')
      .update({ status: 'cancelled' })
      .eq('id', bookingId)
      .select('id, class_id, member_id, status, created_at')
      .single();

    if (error) throw error;
    return data as ClassBooking;
  },

  async getMemberBookings(memberId: string) {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        id, class_id, member_id, status, booking_date, created_at,
        classes (
          id, class_name, start_time, end_time, capacity
        )
      `)
      .eq('member_id', memberId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []) as ClassBooking[];
  },

  async getClassAttendees(classId: string) {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        id, class_id, member_id, status, booking_date, created_at,
        profiles (
          first_name,
          last_name,
          email,
          phone,
          membership_status
        )
      `)
      .eq('class_id', classId)
      .in('status', ['booked', 'attended', 'no_show', 'waiting'])
      .order('created_at', { ascending: true });

    if (error) throw error;
    return (data || []) as ClassBooking[];
  },

  async updateAttendanceStatus(bookingId: string, status: 'attended' | 'no_show' | 'booked') {
    // 'attended' boolean column does not exist — only update status string
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
    // 'days' column does not exist in classes table — return all recent bookings instead
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        id, class_id, member_id, status, booking_date, created_at,
        classes (
          id, class_name, start_time, end_time, capacity
        ),
        profiles (
          first_name,
          last_name,
          email,
          avatar_url
        )
      `)
      .in('status', ['booked', 'attended', 'no_show'])
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) throw error;
    return (data || []) as ClassBooking[];
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
