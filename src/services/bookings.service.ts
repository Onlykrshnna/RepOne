import { supabase } from '../lib/supabase';
import { ClassBooking, BookingStatus } from './classes.types';

async function getGymId(): Promise<string> {
  const { data, error } = await supabase.from('gyms').select('id').limit(1).single();
  if (error || !data) {
    throw new Error('Gym has not been configured.');
  }
  return data.id;
}

export const bookingsService = {
  async bookClass(classId: string, memberId: string) {
    const gym_id = await getGymId();

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

    // 2. Verify class status is active
    const { data: gymClass, error: classError } = await supabase
      .from('classes')
      .select('status')
      .eq('id', classId)
      .single();

    if (classError || !gymClass) {
      throw new Error('Class not found.');
    }

    if (gymClass.status !== 'active') {
      throw new Error('This class is currently inactive and cannot be booked.');
    }

    // 3. Attempt Booking (Postgres insert trigger handles capacity/waiting list)
    const { data, error } = await supabase
      .from('bookings')
      .insert([{
        gym_id,
        class_id: classId,
        member_id: memberId,
        status: 'booked' // Trigger handles full capacity -> 'waiting' automatically
      }])
      .select(`
        *,
        classes (
          title
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
      .update({
        status: 'cancelled',
        cancelled_at: new Date().toISOString()
      })
      .eq('id', bookingId)
      .select()
      .single();

    if (error) throw error;
    return data as ClassBooking;
  },

  async getMemberBookings(memberId: string) {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        classes (
          id,
          title,
          description,
          category,
          room,
          start_time,
          end_time,
          days,
          duration,
          difficulty_level,
          color_label,
          trainers ( name )
        )
      `)
      .eq('member_id', memberId)
      .order('booked_at', { ascending: false });

    if (error) throw error;
    return data as ClassBooking[];
  },

  async getClassAttendees(classId: string) {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
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
      .order('booked_at', { ascending: true });

    if (error) throw error;
    return data as ClassBooking[];
  },

  async updateAttendanceStatus(bookingId: string, status: 'attended' | 'no_show' | 'booked') {
    const { data, error } = await supabase
      .from('bookings')
      .update({
        status,
        attended: status === 'attended'
      })
      .eq('id', bookingId)
      .select()
      .single();

    if (error) throw error;
    return data as ClassBooking;
  },

  async getTodayClassAttendance() {
    // Get bookings that occur on today's classes
    // In order to simplify, we select bookings that are created for active classes scheduled for today.
    const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const todayName = weekdays[new Date().getDay()];

    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        classes!inner (
          id,
          title,
          category,
          room,
          start_time,
          end_time,
          days,
          duration,
          trainers ( name )
        ),
        profiles (
          first_name,
          last_name,
          email,
          avatar_url
        )
      `)
      .in('status', ['booked', 'attended', 'no_show'])
      .order('booked_at', { ascending: false });

    if (error) throw error;

    // Filter local side to ensure class is scheduled for today
    const filtered = data?.filter((b: any) => b.classes?.days?.includes(todayName)) || [];
    return filtered as ClassBooking[];
  },

  // ====================================================
  // METRICS FOR DASHBOARD CARDS
  // ====================================================
  async getClassDashboardMetrics() {
    const today = new Date();
    const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const todayName = weekdays[today.getDay()];

    // 1. Get classes
    const { data: classes } = await supabase
      .from('classes')
      .select('*');

    const totalActiveClasses = classes?.filter(c => c.status === 'active').length || 0;
    const todaysClasses = classes?.filter(c => c.status === 'active' && c.days.includes(todayName)) || [];
    const totalTodaysClassesCount = todaysClasses.length;

    // 2. Get bookings
    const { data: bookings } = await supabase
      .from('bookings')
      .select('status, class_id');

    // Filter today bookings (bookings for classes occurring today)
    const todaysClassIds = new Set(todaysClasses.map(c => c.id));
    const todaysBookings = bookings?.filter(b => todaysClassIds.has(b.class_id)) || [];

    const todayBookingsCount = todaysBookings.filter(b => b.status === 'booked' || b.status === 'attended').length;
    const totalWaitingList = bookings?.filter(b => b.status === 'waiting').length || 0;
    const totalNoShows = bookings?.filter(b => b.status === 'no_show').length || 0;

    // Calc available seats
    const totalTodaysCapacity = todaysClasses.reduce((sum, c) => sum + c.capacity, 0);
    const todaysBookedSeats = todaysClasses.reduce((sum, c) => sum + c.booked_count, 0);
    const availableSeats = Math.max(totalTodaysCapacity - todaysBookedSeats, 0);

    return {
      todaysClasses: totalTodaysClassesCount,
      activeClasses: totalActiveClasses,
      todayBookings: todayBookingsCount,
      availableSeats,
      waitingList: totalWaitingList,
      noShows: totalNoShows
    };
  }
};
