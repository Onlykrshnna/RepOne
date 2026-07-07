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

// Normalize a DB row to our GymClass interface, mapping class_name → title
function normalizeClass(row: any): GymClass {
  return {
    id: row.id,
    gym_id: row.gym_id,
    class_name: row.class_name,
    title: row.class_name,   // alias for UI compatibility
    capacity: row.capacity ?? 0,
    start_time: row.start_time,
    end_time: row.end_time,
    booked_count: 0,
    waiting_list_count: 0,
    status: 'active' as const, // assumed active since DB has no status column
    trainers: null,
  };
}

export const classesService = {
  // ====================================================
  // TRAINERS MANAGEMENT — table does not exist in production DB
  // All trainer operations silently no-op or return empty data
  // ====================================================
  async getTrainers() {
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
    let query = supabase
      .from('classes')
      .select('id, gym_id, class_name, start_time, end_time, capacity');

    if (filters?.search) {
      query = query.ilike('class_name', `%${filters.search}%`);
    }

    // category, trainerId, status filters silently ignored — columns don't exist in DB
    const { data, error } = await query.order('start_time', { ascending: true });
    if (error) throw error;
    return (data || []).map(normalizeClass) as GymClass[];
  },

  async getClassById(id: string) {
    const { data, error } = await supabase
      .from('classes')
      .select('id, gym_id, class_name, start_time, end_time, capacity')
      .eq('id', id)
      .single();

    if (error) throw error;
    return normalizeClass(data) as GymClass;
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
    return normalizeClass(data) as GymClass;
  },

  async updateClass(id: string, classData: Partial<GymClass>) {
    const payload: any = {};
    if (classData.class_name || classData.title) {
      payload.class_name = classData.class_name || classData.title;
    }
    if (classData.start_time !== undefined) payload.start_time = classData.start_time;
    if (classData.end_time !== undefined) payload.end_time = classData.end_time;
    if (classData.capacity !== undefined) payload.capacity = classData.capacity;

    if (Object.keys(payload).length === 0) {
      return this.getClassById(id);
    }

    const { data, error } = await supabase
      .from('classes')
      .update(payload)
      .eq('id', id)
      .select('id, gym_id, class_name, start_time, end_time, capacity')
      .single();

    if (error) throw error;
    return normalizeClass(data) as GymClass;
  },

  async deleteClass(id: string) {
    const { error } = await supabase
      .from('classes')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async cancelClass(id: string) {
    // 'status' column does not exist in classes table — just cancel all bookings
    // 'class_bookings' table does not exist — real table is 'bookings'
    const { error: bookingError } = await supabase
      .from('bookings')
      .update({ status: 'cancelled' })
      .eq('class_id', id)
      .in('status', ['booked', 'waiting']);

    if (bookingError) throw bookingError;
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
