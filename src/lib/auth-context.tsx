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
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  profile: null,
  isLoading: true,
  signOut: async () => {},
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
              if (profileData && profileData.role === 'member') {
                import('../services/members.service').then(({ MOCK_MEMBERS }) => {
                  const exists = MOCK_MEMBERS.some(m => m.id === profileData.id);
                  if (!exists) {
                    MOCK_MEMBERS.push({
                      id: profileData.id,
                      first_name: profileData.first_name || '',
                      last_name: profileData.last_name || '',
                      email: profileData.email || '',
                      username: profileData.username || '',
                      phone: profileData.phone || '',
                      gender: profileData.gender || undefined,
                      role: 'member',
                      is_active: true,
                      membership_status: (profileData as any).membership_status || 'unpaid',
                      created_at: profileData.created_at || new Date().toISOString(),
                      updated_at: profileData.updated_at || new Date().toISOString(),
                      member_memberships: []
                    });
                    localStorage.setItem('elevate_fitness_members', JSON.stringify(MOCK_MEMBERS));
                  } else {
                    const memIndex = MOCK_MEMBERS.findIndex(m => m.id === profileData.id);
                    if (memIndex !== -1) {
                      MOCK_MEMBERS[memIndex].membership_status = (profileData as any).membership_status || MOCK_MEMBERS[memIndex].membership_status;
                      localStorage.setItem('elevate_fitness_members', JSON.stringify(MOCK_MEMBERS));
                    }
                  }
                }).catch(e => console.warn('Could not sync profile to MOCK_MEMBERS:', e));
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
            if (profileData && profileData.role === 'member') {
              import('../services/members.service').then(({ MOCK_MEMBERS }) => {
                const exists = MOCK_MEMBERS.some(m => m.id === profileData.id);
                if (!exists) {
                  MOCK_MEMBERS.push({
                    id: profileData.id,
                    first_name: profileData.first_name || '',
                    last_name: profileData.last_name || '',
                    email: profileData.email || '',
                    username: profileData.username || '',
                    phone: profileData.phone || '',
                    gender: profileData.gender || undefined,
                    role: 'member',
                    is_active: true,
                    membership_status: (profileData as any).membership_status || 'unpaid',
                    created_at: profileData.created_at || new Date().toISOString(),
                    updated_at: profileData.updated_at || new Date().toISOString(),
                    member_memberships: []
                  });
                  localStorage.setItem('elevate_fitness_members', JSON.stringify(MOCK_MEMBERS));
                } else {
                  const memIndex = MOCK_MEMBERS.findIndex(m => m.id === profileData.id);
                  if (memIndex !== -1) {
                    MOCK_MEMBERS[memIndex].membership_status = (profileData as any).membership_status || MOCK_MEMBERS[memIndex].membership_status;
                    localStorage.setItem('elevate_fitness_members', JSON.stringify(MOCK_MEMBERS));
                  }
                }
              }).catch(e => console.warn('Could not sync profile to MOCK_MEMBERS:', e));
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
    <AuthContext.Provider value={{ session, user, profile, isLoading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);