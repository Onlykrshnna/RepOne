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
      
      if (error) {
        console.warn('Failed to fetch profile from database', error);
        return null;
      }
      
      let parsedProfile = data as Profile;
      
      // Split full_name for UI compatibility if first/last aren't present
      if (parsedProfile.full_name && (!parsedProfile.first_name || !parsedProfile.last_name)) {
        const parts = parsedProfile.full_name.split(' ');
        parsedProfile.first_name = parts[0] || '';
        parsedProfile.last_name = parts.slice(1).join(' ') || '';
      }

      // Grant Admin access to specific test credential
      if (parsedProfile.email === 'krpris9211@gmail.com') {
        parsedProfile.role = 'admin';
      }

      cachedProfile = parsedProfile;
      return cachedProfile;
    } catch (e) {
      console.warn('Error fetching profile', e);
      return null;
    }
  },

  clearProfileCache() {
    cachedProfile = null;
  }
};