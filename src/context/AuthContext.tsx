import React, { createContext, useContext, useEffect, useState } from 'react';
import { getSupabaseClient, isSupabaseConfigured } from '../lib/supabase';
import { User, Session } from '@supabase/supabase-js';
import { Profile, UserRole } from '../types';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  role: UserRole;
  isAdmin: boolean;
  loading: boolean;
  signInWithEmail: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUpWithEmail: (email: string, password: string, fullName: string, phone: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [role, setRole] = useState<UserRole>('customer');
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (currentUser: User) => {
    try {
      const isDesignatedAdmin = currentUser.email?.toLowerCase() === 'botone678@gmail.com';
      const client = getSupabaseClient();
      
      if (!client) {
        if (isDesignatedAdmin) {
          setRole('admin');
        }
        return;
      }

      const { data, error } = await client
        .from('profiles')
        .select('*')
        .eq('id', currentUser.id)
        .single();

      if (!error && data) {
        setProfile(data);
        setRole(data.role || (isDesignatedAdmin ? 'admin' : 'customer'));
      } else {
        const computedRole: UserRole = isDesignatedAdmin ? 'admin' : 'customer';
        setRole(computedRole);
        setProfile({
          id: currentUser.id,
          email: currentUser.email || '',
          full_name: currentUser.user_metadata?.full_name || (isDesignatedAdmin ? 'Administrator' : 'Customer'),
          phone: currentUser.user_metadata?.phone || '',
          role: computedRole,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
      if (currentUser.email?.toLowerCase() === 'botone678@gmail.com') {
        setRole('admin');
      }
    }
  };

  useEffect(() => {
    const client = getSupabaseClient();
    if (!client) {
      // Check stored session in localStorage if any
      const savedAuth = localStorage.getItem('gfp_auth_session');
      if (savedAuth) {
        try {
          const parsed = JSON.parse(savedAuth);
          if (parsed.user && parsed.session) {
            setUser(parsed.user);
            setSession(parsed.session);
            setRole(parsed.role || 'customer');
            setProfile(parsed.profile || null);
          }
        } catch (e) {
          localStorage.removeItem('gfp_auth_session');
        }
      }
      setLoading(false);
      return;
    }

    // Get initial session
    client.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      if (currentSession?.user) {
        fetchProfile(currentSession.user);
      }
      setLoading(false);
    });

    // Listen for auth state changes
    const { data: { subscription } } = client.auth.onAuthStateChange(
      async (_event, newSession) => {
        setSession(newSession);
        setUser(newSession?.user ?? null);
        if (newSession?.user) {
          await fetchProfile(newSession.user);
        } else {
          setProfile(null);
          setRole('customer');
        }
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signInWithEmail = async (email: string, password: string): Promise<{ error: Error | null }> => {
    try {
      const cleanEmail = email.trim().toLowerCase();
      const client = getSupabaseClient();

      if (client) {
        try {
          const { data, error } = await client.auth.signInWithPassword({
            email: cleanEmail,
            password,
          });
          if (!error && data.session && data.user) {
            setSession(data.session);
            setUser(data.user);
            await fetchProfile(data.user);
            return { error: null };
          }
        } catch (e) {
          console.warn('Client Supabase Auth failed, trying server proxy:', e);
        }
      }

      // Call backend auth proxy
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Invalid administrator or user credentials.');
      }

      if (data.user && data.session) {
        setUser(data.user as User);
        setSession(data.session as Session);
        const userRole: UserRole = data.role || (cleanEmail === 'botone678@gmail.com' ? 'admin' : 'customer');
        setRole(userRole);
        
        const userProfile: Profile = {
          id: data.user.id,
          email: data.user.email,
          full_name: data.user.user_metadata?.full_name || (cleanEmail === 'botone678@gmail.com' ? 'Gods Favor Administrator' : 'Customer'),
          role: userRole,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        setProfile(userProfile);

        // Store session for persistence
        try {
          localStorage.setItem('gfp_auth_session', JSON.stringify({
            user: data.user,
            session: data.session,
            role: userRole,
            profile: userProfile,
          }));
        } catch (e) {
          // ignore
        }

        return { error: null };
      }

      return { error: new Error('Authentication response invalid.') };
    } catch (err: any) {
      return { error: err };
    }
  };

  const signUpWithEmail = async (email: string, password: string, fullName: string, phone: string) => {
    const client = getSupabaseClient();
    if (!client) {
      return { error: new Error('Supabase client is not configured.') };
    }
    const { error } = await client.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          full_name: fullName.trim(),
          phone: phone.trim(),
        }
      }
    });
    return { error };
  };

  const signOut = async () => {
    try {
      const client = getSupabaseClient();
      if (client) {
        await client.auth.signOut();
      }
    } catch (e) {
      // ignore
    }
    localStorage.removeItem('gfp_auth_session');
    setUser(null);
    setSession(null);
    setProfile(null);
    setRole('customer');
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user);
    }
  };

  const isAdmin = role === 'admin' || user?.email?.toLowerCase() === 'botone678@gmail.com';

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        role,
        isAdmin,
        loading,
        signInWithEmail,
        signUpWithEmail,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
