import { supabase } from '../lib/supabase';
import { profileService } from './profile.service';
import type { User, Session } from '@supabase/supabase-js';

export type LoginCredentials = {
  email: string;
  password?: string;
};

export interface SignupCredentials extends LoginCredentials {
  firstName: string;
  lastName: string;
  username: string;
}

let cachedSession: Session | null = null;
let isSessionFetched = false;

export const authService = {
  async login({ email, password }: LoginCredentials) {
    if (!password) throw new Error('Password is required');
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      throw error;
    }

    // Update cache
    cachedSession = data.session;
    isSessionFetched = true;

    return data;
  },

  async signup({ email, password, firstName, lastName, username }: SignupCredentials) {
    if (!password) throw new Error('Password is required');
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
          full_name: `${firstName} ${lastName}`.trim(),
          username,
          role: 'member',
          membership_status: 'pending',
        },
      },
    });

    if (error) throw error;

    if (data.user) {
      const payload = {
        id: data.user.id,
        email,
        first_name: firstName,
        last_name: lastName,
        username: username.toLowerCase(),
        role: 'member',
        membership_status: 'pending'
      };

      console.log("[UPSERT REQUEST]", payload);

      const { data: upsertData, error: upsertError } = await supabase
        .from('profiles')
        .upsert(payload)
        .select();

      console.log("[UPSERT RESPONSE]", upsertData, upsertError);

      if (upsertError) {
        console.error('Failed to manually update profile row during signup:', upsertError);
      } else {
        console.log('[PROFILE CREATED]', JSON.stringify({
          id: data.user.id,
          username: username.toLowerCase(),
          first_name: firstName,
          last_name: lastName,
          membership_status: 'pending'
        }, null, 2));
      }

      profileService.clearProfileCache();
    }

    // Update cache if session is immediately returned (auto-confirm enabled)
    if (data.session) {
      cachedSession = data.session;
      isSessionFetched = true;
    }

    return data;
  },

  async logout() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    
    // Clear cache
    cachedSession = null;
    isSessionFetched = false;
  },

  async getSession(): Promise<Session | null> {
    if (typeof window === 'undefined') return null;
    if (isSessionFetched) return cachedSession;
    
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    
    cachedSession = data.session;
    isSessionFetched = true;
    return cachedSession;
  },

  async getUser(): Promise<User | null> {
    const { data, error } = await supabase.auth.getUser();
    if (error) throw error;
    return data.user;
  },

  async resetPasswordForEmail(email: string, redirectTo: string) {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo,
    });
    if (error) throw error;
    return data;
  },

  async updatePassword(password: string) {
    const { data, error } = await supabase.auth.updateUser({
      password,
    });
    if (error) throw error;
    return data;
  },

  onAuthStateChange(callback: (event: string, session: Session | null) => void) {
    return supabase.auth.onAuthStateChange((event, session) => {
      // Synchronize cache on events
      cachedSession = session;
      isSessionFetched = true;
      callback(event, session);
    });
  },
};