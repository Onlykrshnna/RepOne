import { supabase } from '../lib/supabase';
import { GymClass, ClassReportMetrics } from './classes.types';

// NOTE: The 'trainers' table does NOT exist in production.
// Classes table real columns: id, gym_id, class_name, start_time, end_time, capacity
// All other columns (trainer_id, title, description, category, days, status, etc.)
// do NOT exist in production — queries are guarded to use only real columns.

async function getGymId(): Promise<string> {
  const { data, error } = await supabase.from('gyms').select('id').limit(1).single();
  if (error || !data) {
    throw new Error('Gym has not been configured.');
  }
  return data.id;
}

export const classesService = {
  // ====================================================
  // TRAINERS MANAGEMENT — table does not exist in production DB
  // All trainer operations silently no-op or return empty data
  // ====================================================
  async getTrainers(): Promise<any[]> {
    console.warn('[Schema] trainers table does not exist in production DB. Returning empty list.');
    return [];
  },

  async createTrainer(_trainerData: any) {
    throw new Error('Trainer management is not available in the current database configuration.');
  },

  async updateTrainer(_id: string, _trainerData: any) {
    throw new Error('Trainer management is not available in the current database configuration.');
  },

  async deleteTrainer(_id: string) {
    throw new Error('Trainer management is not available in the current database configuration.');
  },

  // ====================================================
  // CLASSES MANAGEMENT — only query real DB columns
  // Real columns: id, gym_id, class_name, start_time, end_time, capacity
  // ====================================================
  async getClasses(filters?: { search?: string; category?: string; trainerId?: string; status?: 'active' | 'inactive' }) {
    // 1. Fetch raw classes
    let query = supabase
      .from('classes')
      .select('id, gym_id, class_name, start_time, end_time, capacity');

    if (filters?.search) {
      query = query.ilike('class_name', `%${filters.search}%`);
    }

    const { data: classesData, error: classesError } = await query.order('start_time', { ascending: true });
    if (classesError) throw classesError;

    // 2. Fetch all bookings to calculate booked_count and waiting_list_count
    const { data: bookingsData, error: bookingsError } = await supabase
      .from('bookings')
      .select('class_id, status');

    const bookings = bookingsData || [];
    const bookedCounts: Record<string, number> = {};
    const waitingCounts: Record<string, number> = {};

    bookings.forEach(b => {
      if (b.status === 'booked' || b.status === 'attended') {
        bookedCounts[b.class_id] = (bookedCounts[b.class_id] || 0) + 1;
      } else if (b.status === 'waiting') {
        waitingCounts[b.class_id] = (waitingCounts[b.class_id] || 0) + 1;
      }
    });

    // 3. Map and normalize results
    let result = (classesData || []).map(row => {
      const isInactive = (row.class_name || '').startsWith('[INACTIVE] ');
      const cleanName = isInactive ? row.class_name.replace('[INACTIVE] ', '') : row.class_name;
      return {
        id: row.id,
        gym_id: row.gym_id,
        class_name: cleanName,
        title: cleanName,
        capacity: row.capacity ?? 0,
        start_time: row.start_time,
        end_time: row.end_time,
        booked_count: bookedCounts[row.id] || 0,
        waiting_list_count: waitingCounts[row.id] || 0,
        status: isInactive ? 'inactive' : 'active',
        trainers: null,
        category: 'Fitness',
        duration: 60,
        difficulty_level: 'beginner',
        days: [],
      } as GymClass;
    });

    if (filters?.status) {
      result = result.filter(cls => cls.status === filters.status);
    }

    return result;
  },

  async getClassById(id: string) {
    const { data: row, error } = await supabase
      .from('classes')
      .select('id, gym_id, class_name, start_time, end_time, capacity')
      .eq('id', id)
      .single();

    if (error) throw error;

    // Fetch counts
    const { data: bookings } = await supabase
      .from('bookings')
      .select('status')
      .eq('class_id', id);

    const bookedCount = bookings?.filter(b => b.status === 'booked' || b.status === 'attended').length || 0;
    const waitingCount = bookings?.filter(b => b.status === 'waiting').length || 0;

    const isInactive = (row.class_name || '').startsWith('[INACTIVE] ');
    const cleanName = isInactive ? row.class_name.replace('[INACTIVE] ', '') : row.class_name;

    return {
      id: row.id,
      gym_id: row.gym_id,
      class_name: cleanName,
      title: cleanName,
      capacity: row.capacity ?? 0,
      start_time: row.start_time,
      end_time: row.end_time,
      booked_count: bookedCount,
      waiting_list_count: waitingCount,
      status: isInactive ? 'inactive' : 'active',
      trainers: null,
      category: 'Fitness',
      duration: 60,
      difficulty_level: 'beginner',
      days: [],
    } as GymClass;
  },

  async createClass(classData: { class_name?: string; title?: string; start_time: string; end_time: string; capacity: number; [key: string]: any }) {
    const gym_id = await getGymId();
    const payload = {
      gym_id,
      class_name: classData.class_name || classData.title || 'Unnamed Class',
      start_time: classData.start_time,
      end_time: classData.end_time,
      capacity: classData.capacity,
    };

    const { data, error } = await supabase
      .from('classes')
      .insert([payload])
      .select('id, gym_id, class_name, start_time, end_time, capacity')
      .single();

    if (error) throw error;
    return this.getClassById(data.id);
  },

  async updateClass(id: string, classData: Partial<GymClass>) {
    const payload: any = {};
    if (classData.class_name !== undefined || classData.title !== undefined) {
      // Retain the [INACTIVE] prefix if the class is currently inactive
      const current = await this.getClassById(id);
      const isInactive = current.status === 'inactive';
      const rawName = classData.class_name || classData.title || 'Unnamed Class';
      payload.class_name = isInactive ? `[INACTIVE] ${rawName}` : rawName;
    }
    if (classData.start_time !== undefined) payload.start_time = classData.start_time;
    if (classData.end_time !== undefined) payload.end_time = classData.end_time;
    if (classData.capacity !== undefined) payload.capacity = classData.capacity;

    if (Object.keys(payload).length === 0) {
      return this.getClassById(id);
    }

    const { error } = await supabase
      .from('classes')
      .update(payload)
      .eq('id', id);

    if (error) throw error;
    return this.getClassById(id);
  },

  async deleteClass(id: string) {
    const { error } = await supabase
      .from('classes')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async cancelClass(id: string) {
    // Deactivate Class — prefix name with [INACTIVE] to simulate status without schema changes
    const current = await this.getClassById(id);
    if (current.status !== 'inactive') {
      const newName = `[INACTIVE] ${current.class_name}`;
      const { error: updateError } = await supabase
        .from('classes')
        .update({ class_name: newName })
        .eq('id', id);

      if (updateError) throw updateError;
    }

    // Cancel all active bookings
    const { error: bookingError } = await supabase
      .from('bookings')
      .update({ status: 'cancelled' })
      .eq('class_id', id)
      .in('status', ['booked', 'waiting']);

    if (bookingError) throw bookingError;
  },

  async activateClass(id: string) {
    // Reactivate Class — remove [INACTIVE] prefix from class name
    const current = await this.getClassById(id);
    if (current.class_name.startsWith('[INACTIVE] ')) {
      const newName = current.class_name.replace('[INACTIVE] ', '');
      const { error: updateError } = await supabase
        .from('classes')
        .update({ class_name: newName })
        .eq('id', id);

      if (updateError) throw updateError;
    }
  },

  async duplicateClass(id: string) {
    const classToCopy = await this.getClassById(id);
    return this.createClass({
      class_name: `${classToCopy.class_name} (Copy)`,
      start_time: classToCopy.start_time,
      end_time: classToCopy.end_time,
      capacity: classToCopy.capacity,
    });
  },

  // ====================================================
  // REPORTS GENERATION
  // ====================================================
  async getClassesReport(): Promise<ClassReportMetrics> {
    const classes = await this.getClasses();

    const { data: bookings } = await supabase
      .from('bookings')
      .select('status, class_id');

    // Booking counts per class
    const bookingCounts: Record<string, number> = {};
    (bookings || []).forEach(b => {
      if (b.status === 'booked' || b.status === 'attended') {
        bookingCounts[b.class_id] = (bookingCounts[b.class_id] || 0) + 1;
      }
    });

    const classBookings = classes.map(c => {
      const count = bookingCounts[c.id] || 0;
      const occupancyRate = c.capacity > 0 ? Math.round((count / c.capacity) * 100) : 0;
      return {
        title: c.class_name,
        bookings_count: count,
        occupancy_rate: occupancyRate,
      };
    });

    const sorted = [...classBookings].sort((a, b) => b.bookings_count - a.bookings_count);
    const mostPopular = sorted.slice(0, 5);
    const leastPopular = [...sorted].reverse().slice(0, 5);

    const totalCapacity = classes.reduce((sum, c) => sum + c.capacity, 0);
    const totalBooked = classes.reduce((sum, c) => sum + (bookingCounts[c.id] || 0), 0);
    const avgOccupancy = totalCapacity > 0 ? Math.round((totalBooked / totalCapacity) * 100) : 0;

    const total = bookings?.length || 0;
    const cancelled = bookings?.filter(b => b.status === 'cancelled').length || 0;
    const noShows = bookings?.filter(b => b.status === 'no_show').length || 0;

    return {
      mostPopularClasses: mostPopular,
      leastPopularClasses: leastPopular,
      averageOccupancyRate: avgOccupancy,
      trainerPerformance: [],  // trainers table does not exist
      bookingTrends: [],
      cancellationRate: total > 0 ? Math.round((cancelled / total) * 100) : 0,
      noShowRate: total > 0 ? Math.round((noShows / total) * 100) : 0,
    };
  }
};
