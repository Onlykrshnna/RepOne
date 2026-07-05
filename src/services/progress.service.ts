import { supabase } from '../lib/supabase';
import { calculateBMI } from './progress.utils';

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

export const progressService = {
  async getMemberProgressHistory(memberId: string) {
    const { data, error } = await supabase
      .from('progress_tracking')
      .select('*')
      .eq('member_id', memberId)
      .order('recorded_at', { ascending: true }); // chronological for charts

    if (error) throw error;
    return data as ProgressEntry[];
  },

  async addProgress(entry: Partial<ProgressEntry>) {
    // Auto-calculate BMI if weight and height are provided
    if (entry.weight_kg && entry.height_cm && !entry.bmi) {
      entry.bmi = calculateBMI(entry.weight_kg, entry.height_cm);
    }

    const { data, error } = await supabase
      .from('progress_tracking')
      .insert([entry])
      .select()
      .single();

    if (error) throw error;
    return data as ProgressEntry;
  },

  async updateProgress(id: string, updates: Partial<ProgressEntry>) {
    if (updates.weight_kg || updates.height_cm) {
       // Re-calculate BMI if either changed and both are available
       // (Requires fetching existing first, but for simplicity we rely on the UI passing both if one changes, or we just let it be)
       if (updates.weight_kg && updates.height_cm) {
         updates.bmi = calculateBMI(updates.weight_kg, updates.height_cm);
       }
    }

    const { data, error } = await supabase
      .from('progress_tracking')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as ProgressEntry;
  },

  async deleteProgress(id: string) {
    const { error } = await supabase
      .from('progress_tracking')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  },

  async getAdminProgressOverview() {
    // Get latest measurement for each member to see who needs an update
    // We can do this efficiently using a raw SQL query or fetching profiles + their latest progress.
    // For now, we fetch all profiles and their most recent progress entry.
    const { data, error } = await supabase
      .from('profiles')
      .select(`
        id, first_name, last_name, avatar_url,
        progress_tracking (
          recorded_at, weight_kg, body_fat_percentage
        )
      `)
      .eq('role', 'member');

    if (error) throw error;

    const overview = data.map(profile => {
      // Sort progress descending to get latest
      const sortedProgress = (profile.progress_tracking as any[] || []).sort(
        (a, b) => new Date(b.recorded_at).getTime() - new Date(a.recorded_at).getTime()
      );
      const latest = sortedProgress[0] || null;
      
      let daysSinceUpdate = Infinity;
      if (latest) {
        daysSinceUpdate = Math.floor((new Date().getTime() - new Date(latest.recorded_at).getTime()) / (1000 * 3600 * 24));
      }

      return {
        member: { id: profile.id, name: `${profile.first_name} ${profile.last_name}`, avatar: profile.avatar_url },
        latest,
        daysSinceUpdate,
        needsUpdate: daysSinceUpdate > 30 // Flag if more than 30 days
      };
    });

    return overview.sort((a, b) => b.daysSinceUpdate - a.daysSinceUpdate); // Neediest first
  }
};
