import { supabase } from '../lib/supabase';

async function getGymId(): Promise<string> {
  const { data, error } = await supabase.from('gyms').select('id').limit(1).single();
  if (error || !data) {
    throw new Error('Gym has not been configured.');
  }
  return data.id;
}

export type FeedbackTarget = 'gym' | 'trainer' | 'class' | 'facilities' | 'equipment' | 'staff';

export interface GymFeedback {
  id: string;
  gym_id: string;
  member_id: string;
  target_type: FeedbackTarget;
  target_id?: string | null;
  rating_overall: number;
  rating_cleanliness?: number | null;
  rating_trainers?: number | null;
  rating_equipment?: number | null;
  rating_value?: number | null;
  comments?: string | null;
  admin_reply?: string | null;
  is_resolved: boolean;
  is_archived: boolean;
  created_at: string;
  profiles?: {
    first_name: string;
    last_name: string;
    email: string;
  };
}

export const feedbackService = {
  async submitFeedback(feedbackData: Omit<GymFeedback, 'id' | 'gym_id' | 'is_resolved' | 'is_archived' | 'created_at'>) {
    const gym_id = await getGymId();
    const { data, error } = await supabase
      .from('feedback')
      .insert([{
        ...feedbackData,
        gym_id,
        is_resolved: false,
        is_archived: false
      }])
      .select()
      .single();

    if (error) throw error;
    return data as GymFeedback;
  },

  async getFeedback(filters?: { target_type?: string; minRating?: number; is_resolved?: boolean; is_archived?: boolean }) {
    let query = supabase
      .from('feedback')
      .select(`
        *,
        profiles (
          first_name,
          last_name,
          email
        )
      `);

    if (filters?.target_type) {
      query = query.eq('target_type', filters.target_type);
    }
    
    if (filters?.minRating) {
      query = query.gte('rating_overall', filters.minRating);
    }

    if (filters?.is_resolved !== undefined) {
      query = query.eq('is_resolved', filters.is_resolved);
    }

    if (filters?.is_archived !== undefined) {
      query = query.eq('is_archived', filters.is_archived);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;
    return data as GymFeedback[];
  },

  async adminReply(id: string, text: string) {
    const { data, error } = await supabase
      .from('feedback')
      .update({
        admin_reply: text,
        is_resolved: true
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as GymFeedback;
  },

  async resolveFeedback(id: string) {
    const { data, error } = await supabase
      .from('feedback')
      .update({ is_resolved: true })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as GymFeedback;
  },

  async archiveFeedback(id: string) {
    const { data, error } = await supabase
      .from('feedback')
      .update({ is_archived: true })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as GymFeedback;
  },

  async deleteFeedback(id: string) {
    const { error } = await supabase
      .from('feedback')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async getFeedbackDashboardMetrics() {
    const { data: rawList } = await supabase.from('feedback').select('*');
    const list = rawList || [];
    
    const total = list.length;
    const resolved = list.filter(f => f.is_resolved).length;
    const avgOverall = total > 0 
      ? Number((list.reduce((sum, f) => sum + f.rating_overall, 0) / total).toFixed(1)) 
      : 5.0;

    const cleanlinessList = list.filter(f => f.rating_cleanliness !== null);
    const avgCleanliness = cleanlinessList.length > 0 
      ? Number((cleanlinessList.reduce((sum, f) => sum + (f.rating_cleanliness || 0), 0) / cleanlinessList.length).toFixed(1))
      : 5.0;

    const equipmentList = list.filter(f => f.rating_equipment !== null);
    const avgEquipment = equipmentList.length > 0 
      ? Number((equipmentList.reduce((sum, f) => sum + (f.rating_equipment || 0), 0) / equipmentList.length).toFixed(1))
      : 5.0;

    return {
      totalFeedback: total,
      resolvedFeedback: resolved,
      averageRating: avgOverall,
      averageCleanliness: avgCleanliness,
      averageEquipment: avgEquipment
    };
  }
};
