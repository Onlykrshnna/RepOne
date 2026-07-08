import { supabase } from '../lib/supabase';
import { GymClass, ClassReportMetrics, Trainer } from './classes.types';

async function getGymId(): Promise<string> {
  const { data, error } = await supabase.from('gyms').select('id').limit(1).single();
  if (error || !data) {
    throw new Error('Gym has not been configured.');
  }
  return data.id;
}

export const classesService = {
  // ====================================================
  // TRAINERS MANAGEMENT
  // ====================================================
  async getTrainers(filters?: { status?: 'active' | 'inactive'; search?: string }): Promise<Trainer[]> {
    let query = supabase.from('trainers').select('*');
    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    if (filters?.search) {
      query = query.ilike('name', `%${filters.search}%`);
    }
    const { data, error } = await query.order('name', { ascending: true });
    if (error) throw error;
    return data || [];
  },

  async createTrainer(trainerData: Omit<Trainer, 'id' | 'gym_id' | 'created_at' | 'updated_at'>) {
    const gym_id = await getGymId();
    const { data, error } = await supabase
      .from('trainers')
      .insert([{ ...trainerData, gym_id }])
      .select('*')
      .single();
    if (error) throw error;
    return data;
  },

  async updateTrainer(id: string, trainerData: Partial<Trainer>) {
    const { data, error } = await supabase
      .from('trainers')
      .update(trainerData)
      .eq('id', id)
      .select('*')
      .single();
    if (error) throw error;
    return data;
  },

  async deleteTrainer(id: string) {
    const { error } = await supabase
      .from('trainers')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },

  // ====================================================
  // CLASSES MANAGEMENT
  // ====================================================
  async getClasses(filters?: { search?: string; category?: string; trainerId?: string; status?: 'active' | 'inactive' }) {
    // 1. Fetch raw classes with joined trainers
    let query = supabase
      .from('classes')
      .select('id, gym_id, class_name, start_time, end_time, capacity, status, trainer_id, trainers(*)');

    if (filters?.search) {
      query = query.ilike('class_name', `%${filters.search}%`);
    }

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    if (filters?.trainerId) {
      query = query.eq('trainer_id', filters.trainerId);
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
    return (classesData || []).map(row => {
      return {
        id: row.id,
        gym_id: row.gym_id,
        class_name: row.class_name,
        title: row.class_name,
        capacity: row.capacity ?? 0,
        start_time: row.start_time,
        end_time: row.end_time,
        booked_count: bookedCounts[row.id] || 0,
        waiting_list_count: waitingCounts[row.id] || 0,
        status: row.status === 'inactive' ? 'inactive' : 'active',
        trainer_id: row.trainer_id,
        trainers: (Array.isArray(row.trainers) ? row.trainers[0] : row.trainers) || null,
        category: 'Fitness',
        duration: 60,
        difficulty_level: 'beginner',
        days: [],
      } as GymClass;
    });
  },

  async getClassById(id: string) {
    const { data: row, error } = await supabase
      .from('classes')
      .select('id, gym_id, class_name, start_time, end_time, capacity, status, trainer_id, trainers(*)')
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

    return {
      id: row.id,
      gym_id: row.gym_id,
      class_name: row.class_name,
      title: row.class_name,
      capacity: row.capacity ?? 0,
      start_time: row.start_time,
      end_time: row.end_time,
      booked_count: bookedCount,
      waiting_list_count: waitingCount,
      status: row.status === 'inactive' ? 'inactive' : 'active',
      trainer_id: row.trainer_id,
      trainers: (Array.isArray(row.trainers) ? row.trainers[0] : row.trainers) || null,
      category: 'Fitness',
      duration: 60,
      difficulty_level: 'beginner',
      days: [],
    } as GymClass;
  },

  async createClass(classData: { class_name?: string; title?: string; start_time: string; end_time: string; capacity: number; trainer_id?: string | null; [key: string]: any }) {
    const gym_id = await getGymId();
    const payload = {
      gym_id,
      class_name: classData.class_name || classData.title || 'Unnamed Class',
      start_time: classData.start_time,
      end_time: classData.end_time,
      capacity: classData.capacity,
      status: 'active',
      trainer_id: classData.trainer_id || null,
    };

    const { data, error } = await supabase
      .from('classes')
      .insert([payload])
      .select('id')
      .single();

    if (error) throw error;
    return this.getClassById(data.id);
  },

  async updateClass(id: string, classData: Partial<GymClass>) {
    const payload: any = {};
    if (classData.class_name !== undefined || classData.title !== undefined) {
      payload.class_name = classData.class_name || classData.title || 'Unnamed Class';
    }
    if (classData.start_time !== undefined) payload.start_time = classData.start_time;
    if (classData.end_time !== undefined) payload.end_time = classData.end_time;
    if (classData.capacity !== undefined) payload.capacity = classData.capacity;
    if (classData.status !== undefined) payload.status = classData.status;
    if (classData.trainer_id !== undefined) payload.trainer_id = classData.trainer_id || null;

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
    // Deactivate Class directly via status column
    const { error: updateError } = await supabase
      .from('classes')
      .update({ status: 'inactive' })
      .eq('id', id);

    if (updateError) throw updateError;

    // Cancel all active bookings
    const { error: bookingError } = await supabase
      .from('bookings')
      .update({ status: 'cancelled' })
      .eq('class_id', id)
      .in('status', ['booked', 'waiting']);

    if (bookingError) throw bookingError;
  },

  async activateClass(id: string) {
    // Reactivate Class directly via status column
    const { error: updateError } = await supabase
      .from('classes')
      .update({ status: 'active' })
      .eq('id', id);

    if (updateError) throw updateError;
  },

  async duplicateClass(id: string) {
    const classToCopy = await this.getClassById(id);
    return this.createClass({
      class_name: `${classToCopy.class_name} (Copy)`,
      start_time: classToCopy.start_time,
      end_time: classToCopy.end_time,
      capacity: classToCopy.capacity,
      trainer_id: classToCopy.trainer_id,
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
