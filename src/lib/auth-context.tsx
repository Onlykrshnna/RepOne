import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { authService } from '../services/auth.service';
import { profileService, Profile } from '../services/profile.service';
import { supabase } from './supabase';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
  refetchProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  profile: null,
  isLoading: true,
  signOut: async () => {},
  refetchProfile: async () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadSession() {
      try {
        const session = await authService.getSession();
        if (mounted) {
          setSession(session);
          setUser(session?.user ?? null);
          if (session?.user) {
            const profileData = await profileService.getProfile(session.user.id);
            if (mounted) {
              setProfile(profileData);
              if (profileData) {
                console.log('[PROFILE LOADED]', JSON.stringify(profileData, null, 2));
              }
            }
          }
        }
      } catch (error) {
        console.error('Error loading session', error);
      } finally {
        if (mounted) setIsLoading(false);
      }
    }

    loadSession();

    const { data: authListener } = authService.onAuthStateChange(async (event, newSession) => {
      if (!mounted) return;
      
      setSession(newSession);
      setUser(newSession?.user ?? null);
      
      if (newSession?.user) {
        try {
          const profileData = await profileService.getProfile(newSession.user.id);
          if (mounted) {
            setProfile(profileData);
            if (profileData) {
              console.log('[PROFILE LOADED]', JSON.stringify(profileData, null, 2));
            }
          }
        } catch (error) {
          console.error('Error fetching profile on state change', error);
        }
      } else {
        setProfile(null);
        profileService.clearProfileCache();
      }
      setIsLoading(false);
    });

    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  const refetchProfile = async () => {
    if (user) {
      const profileData = await profileService.getProfile(user.id, true); // bypass cache
      setProfile(profileData);
    }
  };

  const signOut = async () => {
    setIsLoading(true);
    setSession(null);
    setUser(null);
    setProfile(null);
    profileService.clearProfileCache();
    
    try {
      await authService.logout();
    } catch (err) {
      console.warn('Signout warning', err);
    }
    
    setIsLoading(false);
    window.location.href = '/';
  };

  return (
    <AuthContext.Provider value={{ session, user, profile, isLoading, signOut, refetchProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);