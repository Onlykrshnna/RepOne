import { supabase } from '../lib/supabase';

// IMPORTANT: progress_tracking table does NOT exist in production DB.
// All operations gracefully return empty data or throw a user-friendly error.
// If the table is created in the future, restore the full implementation from git history.

export interface ProgressEntry {
  id: string;
  member_id: string;
  weight_kg: number | null;
  height_cm: number | null;
  bmi: number | null;
  body_fat_percentage: number | null;
  chest_cm: number | null;
  waist_cm: number | null;
  hips_cm: number | null;
  left_arm_cm: number | null;
  right_arm_cm: number | null;
  left_thigh_cm: number | null;
  right_thigh_cm: number | null;
  neck_cm: number | null;
  shoulders_cm: number | null;
  water_percentage: number | null;
  muscle_percentage: number | null;
  notes: string | null;
  progress_photos: string[];
  recorded_at: string;
}

const TABLE_MISSING_MSG = 'Progress tracking is not available yet. The database table has not been created.';

export const progressService = {
  async getMemberProgressHistory(_memberId: string): Promise<ProgressEntry[]> {
    console.warn('[Schema] progress_tracking table does not exist in production DB. Returning empty list.');
    return [];
  },

  async addProgress(_entry: Partial<ProgressEntry>): Promise<ProgressEntry> {
    throw new Error(TABLE_MISSING_MSG);
  },

  async updateProgress(_id: string, _updates: Partial<ProgressEntry>): Promise<ProgressEntry> {
    throw new Error(TABLE_MISSING_MSG);
  },

  async deleteProgress(_id: string): Promise<boolean> {
    throw new Error(TABLE_MISSING_MSG);
  },

  async getAdminProgressOverview() {
    // profiles table exists — fetch member list, but no progress data
    const { data, error } = await supabase
      .from('profiles')
      .select('id, first_name, last_name, avatar_url')
      .eq('role', 'member');

    if (error) throw error;

    return (data || []).map(profile => ({
      member: { id: profile.id, name: `${profile.first_name} ${profile.last_name}`, avatar: profile.avatar_url },
      latest: null,
      daysSinceUpdate: Infinity,
      needsUpdate: true
    }));
  }
};
