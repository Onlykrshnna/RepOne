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

export interface GymClass {
  id: string;
  gym_id: string;
  trainer_id?: string | null;
  title: string;
  description?: string | null;
  category: string;
  room: string;
  capacity: number;
  booked_count: number;
  waiting_list_count: number;
  duration: number; // in minutes
  difficulty_level: ClassDifficulty;
  days: string[]; // e.g. ['Monday', 'Wednesday']
  start_time: string; // Time string e.g. "09:00:00"
  end_time: string; // Time string e.g. "10:00:00"
  status: 'active' | 'inactive';
  cover_image?: string | null;
  color_label: string; // Hex color
  created_at: string;
  trainers?: Trainer | null; // Joined trainer
}

export type BookingStatus = 'booked' | 'waiting' | 'attended' | 'no_show' | 'cancelled';

export interface ClassBooking {
  id: string;
  gym_id: string;
  class_id: string;
  member_id: string;
  status: BookingStatus;
  booked_at: string;
  attended: boolean;
  cancelled_at?: string | null;
  position_in_waiting_list?: number | null;
  classes?: GymClass; // Joined class
  profiles?: {
    first_name: string;
    last_name: string;
    email: string;
    phone?: string | null;
    membership_status: string;
  };
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
