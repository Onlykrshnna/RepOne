import { supabase } from '../lib/supabase';
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
          membership_status: 'unpaid',
        },
      },
    });

    if (error) throw error;

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