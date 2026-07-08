import { supabase } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';

export interface Profile {
  id: string;
  email: string;
  role: 'member' | 'admin';
  full_name?: string;
  first_name?: string;
  last_name?: string;
  username?: string;
  avatar_url?: string;
  phone?: string;
  address?: string;
  emergency_contact?: string;
  date_of_birth?: string;
  gender?: string;
  membership_status?: string;
  created_at?: string;
  updated_at?: string;
}

let cachedProfile: Profile | null = null;

export const profileService = {
  async getProfile(userId: string, bypassCache = false): Promise<Profile | null> {
    if (cachedProfile && cachedProfile.id === userId && !bypassCache) {
      return cachedProfile;
    }
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error || !data) {
        console.error('Failed to fetch profile from database. Profile missing or error:', error);
        return null;
      }

      const parsedProfile = data as Profile;

      // Grant Admin access to specific credentials if needed, or remove if you want to rely on DB role
      if (parsedProfile.email === 'krpris9211@gmail.com' || parsedProfile.email === 'krpris1922@gmail.com') {
        parsedProfile.role = 'admin';
      }

      cachedProfile = parsedProfile;
      return cachedProfile;
    } catch (e) {
      console.error('Error fetching profile', e);
      return null;
    }
  },

  clearProfileCache() {
    cachedProfile = null;
  },

  async checkUsernameUnique(username: string, excludeUserId?: string): Promise<boolean> {
    if (!username) return true;
    
    let query = supabase
      .from('profiles')
      .select('id')
      .ilike('username', username);
      
    if (excludeUserId) {
      query = query.neq('id', excludeUserId);
    }
    
    const { data, error } = await query.limit(1);
    
    if (error) {
      console.error('Error checking username uniqueness:', error);
      return false; // Safest to return false on error
    }
    
    return data.length === 0;
  }
};