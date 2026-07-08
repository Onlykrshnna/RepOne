// Real DB schema for classes:
// id, gym_id, class_name, start_time, end_time, capacity
// Missing (code-only): trainer_id, title, description, category, room, days, duration,
//   booked_count, waiting_list_count, difficulty_level, color_label, status, created_at
// Missing tables: trainers

export interface Trainer {
  id: string;
  gym_id: string;
  name: string;
  photo_url?: string | null;
  specialization?: string | null;
  experience?: string | null;
  bio?: string | null;
  contact?: string | null;
  created_at: string;
}

export type ClassDifficulty = 'beginner' | 'intermediate' | 'advanced';

// GymClass only contains columns that exist in production DB
export interface GymClass {
  id: string;
  gym_id: string;
  class_name: string;
  capacity: number;
  start_time: string;
  end_time: string;
  // Optional columns that may not exist in all DB versions
  trainer_id?: string | null;
  title?: string | null;         // alias for class_name in UI
  description?: string | null;
  category: string;
  room?: string | null;
  booked_count: number;
  waiting_list_count: number;
  duration: number;
  difficulty_level: ClassDifficulty;
  days: string[];
  status: 'active' | 'inactive';
  cover_image?: string | null;
  color_label?: string;
  created_at?: string;
  trainers?: Trainer | null;
}

// BookingStatus – only 'booked' | 'cancelled' | 'waiting' are confirmed in DB
export type BookingStatus = 'booked' | 'waiting' | 'attended' | 'no_show' | 'cancelled';

// ClassBooking only contains columns confirmed to exist in production DB:
// id, class_id, member_id, status, booking_date, created_at
export interface ClassBooking {
  id: string;
  class_id: string;
  member_id: string;
  status: BookingStatus;
  booking_date?: string;    // DB column name (not booked_at)
  created_at?: string;
  // Optional joined data
  classes?: Partial<GymClass>;
  profiles?: {
    first_name: string;
    last_name: string;
    email: string;
    phone?: string | null;
    avatar_url?: string | null;
    membership_status: string;
  } | any;
  position_in_waiting_list?: number;
}

export interface ClassReportMetrics {
  mostPopularClasses: Array<{ title: string; bookings_count: number; occupancy_rate: number }>;
  leastPopularClasses: Array<{ title: string; bookings_count: number; occupancy_rate: number }>;
  averageOccupancyRate: number;
  trainerPerformance: Array<{ trainer_name: string; classes_count: number; avg_occupancy: number }>;
  bookingTrends: Array<{ date: string; bookings_count: number }>;
  cancellationRate: number;
  noShowRate: number;
}
