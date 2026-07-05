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
      
      let parsedProfile = data as Profile;
      
      if (error) {
        console.warn('Failed to fetch profile from database, falling back to auth metadata', error);
        const { data: { user } } = await supabase.auth.getUser();
        if (user && user.id === userId) {
          const meta = user.user_metadata;
          parsedProfile = {
            id: user.id,
            email: user.email || '',
            role: (meta?.role || 'member') as 'member' | 'admin',
            first_name: meta?.first_name || '',
            last_name: meta?.last_name || '',
            username: meta?.username || user.email?.split('@')[0] || 'member',
            membership_status: meta?.membership_status || 'unpaid',
            created_at: user.created_at,
          };
        } else {
          return null;
        }
      } else {
        // Enforce fallback metadata integration if columns in database are empty
        const { data: { user } } = await supabase.auth.getUser();
        if (user && user.id === userId) {
          const meta = user.user_metadata;
          if (meta) {
            if (!parsedProfile.username && meta.username) parsedProfile.username = meta.username;
            if (!parsedProfile.first_name && meta.first_name) parsedProfile.first_name = meta.first_name;
            if (!parsedProfile.last_name && meta.last_name) parsedProfile.last_name = meta.last_name;
          }
        }
      }
      
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