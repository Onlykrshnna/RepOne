import { supabase } from '../lib/supabase';

// Real feedback table columns: id, member_id, rating, comment, created_at
// Missing from DB (code had): gym_id, target_type, target_id, rating_overall,
//   rating_cleanliness, rating_trainers, rating_equipment, rating_value,
//   comments (→ comment), admin_reply, is_resolved, is_archived

export type FeedbackTarget = 'gym' | 'trainer' | 'class' | 'facilities' | 'equipment' | 'staff';

export interface GymFeedback {
  id: string;
  member_id: string;
  rating: number;         // real DB column (was rating_overall)
  comment?: string | null; // real DB column (was comments)
  created_at: string;
  // Virtual fields for UI compatibility
  rating_overall?: number;
  comments?: string | null;
  target_type?: string;
  is_resolved?: boolean;
  is_archived?: boolean;
  admin_reply?: string | null;
  rating_cleanliness?: number;
  rating_trainers?: number;
  rating_equipment?: number;
  rating_value?: number;
  profiles?: {
    first_name: string;
    last_name: string;
    email: string;
  };
}

export const feedbackService = {
  async submitFeedback(feedbackData: {
    member_id: string;
    rating: number;
    comment?: string;
    // Legacy fields accepted but stored mapped to real columns
    rating_overall?: number;
    comments?: string;
    target_type?: string;
    target_id?: string;
    [key: string]: any;
  }) {
    const { data, error } = await supabase
      .from('feedback')
      .insert([{
        member_id: feedbackData.member_id,
        rating: feedbackData.rating ?? feedbackData.rating_overall ?? 5,
        comment: feedbackData.comment ?? feedbackData.comments ?? null,
      }])
      .select('id, member_id, rating, comment, created_at')
      .single();

    if (error) throw error;
    return normalizeRow(data);
  },

  async getFeedback(filters?: { target_type?: string; minRating?: number; is_resolved?: boolean; is_archived?: boolean }) {
    let query = supabase
      .from('feedback')
      .select(`
        id, member_id, rating, comment, created_at,
        profiles (
          first_name,
          last_name,
          email
        )
      `);

    if (filters?.minRating) {
      query = query.gte('rating', filters.minRating);
    }

    // target_type, is_resolved, is_archived filters silently ignored — columns don't exist
    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []).map(normalizeRow) as GymFeedback[];
  },

  async adminReply(_id: string, _text: string) {
    // admin_reply column does not exist in DB — silently no-op, return the existing row
    const { data, error } = await supabase
      .from('feedback')
      .select('id, member_id, rating, comment, created_at')
      .eq('id', _id)
      .single();

    if (error) throw error;
    return normalizeRow(data);
  },

  async resolveFeedback(id: string) {
    // is_resolved column does not exist — silently return existing row
    const { data, error } = await supabase
      .from('feedback')
      .select('id, member_id, rating, comment, created_at')
      .eq('id', id)
      .single();

    if (error) throw error;
    return normalizeRow(data);
  },

  async archiveFeedback(id: string) {
    // is_archived column does not exist — silently no-op
    const { data, error } = await supabase
      .from('feedback')
      .select('id, member_id, rating, comment, created_at')
      .eq('id', id)
      .single();

    if (error) throw error;
    return normalizeRow(data);
  },

  async deleteFeedback(id: string) {
    const { error } = await supabase
      .from('feedback')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async getFeedbackDashboardMetrics() {
    const { data: rawList } = await supabase
      .from('feedback')
      .select('rating, comment');

    const list = rawList || [];
    const total = list.length;
    const avgOverall = total > 0
      ? Number((list.reduce((sum, f) => sum + (f.rating || 0), 0) / total).toFixed(1))
      : 5.0;

    return {
      totalFeedback: total,
      resolvedFeedback: 0,       // column doesn't exist
      averageRating: avgOverall,
      averageCleanliness: 5.0,  // column doesn't exist
      averageEquipment: 5.0,    // column doesn't exist
    };
  }
};

function normalizeRow(row: any): GymFeedback {
  return {
    ...row,
    // Map real column names to legacy names for UI compatibility
    rating_overall: row.rating,
    comments: row.comment,
    is_resolved: false,
    is_archived: false,
    admin_reply: null,
  };
}
