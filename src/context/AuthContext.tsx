import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  provider: 'google' | 'facebook' | 'instagram' | 'email';
  role?: 'admin' | 'artist' | 'user';
  favoriteArtworks?: number[];
  favoriteMoments?: number[];
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginWithFacebook: () => Promise<void>;
  loginWithInstagram: () => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/** Map a Supabase session + profiles row to our internal User shape. */
function mapUser(
  session: { user: { id: string; email?: string; user_metadata?: Record<string, any>; app_metadata?: Record<string, any> } },
  profile?: { name?: string; role?: string } | null
): User {
  const su = session.user;
  const provider = (su.app_metadata?.provider ?? 'email') as User['provider'];
  return {
    id: su.id,
    name: profile?.name ?? su.user_metadata?.name ?? su.user_metadata?.full_name ?? su.email?.split('@')[0] ?? 'User',
    email: su.email ?? '',
    avatar: su.user_metadata?.avatar_url,
    provider,
    role: (profile?.role as User['role']) ?? 'user',
    favoriteArtworks: [],
    favoriteMoments: [],
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  /** Fetch the profiles row for a given Supabase user id and return it. */
  const fetchProfile = async (userId: string) => {
    const { data } = await supabase.from('profiles').select('name, role').eq('id', userId).single();
    return data;
  };

  useEffect(() => {
    // Restore session on mount — gracefully handle missing/placeholder Supabase credentials
    supabase.auth.getSession()
      .then(async ({ data: { session } }) => {
        if (session) {
          const profile = await fetchProfile(session.user.id);
          setUser(mapUser(session, profile));
        }
        setLoading(false);
      })
      .catch(() => {
        // Supabase not yet configured — app runs in unauthenticated mode
        setLoading(false);
      });

    // Listen for auth state changes (login, logout, token refresh)
    let subscription: { unsubscribe: () => void } = { unsubscribe: () => {} };
    try {
      const { data } = supabase.auth.onAuthStateChange(async (_event, session) => {
        if (session) {
          const profile = await fetchProfile(session.user.id);
          setUser(mapUser(session, profile));
        } else {
          setUser(null);
        }
      });
      subscription = data.subscription;
    } catch {
      // Supabase not yet configured — skip auth listener
    }

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message);
    // onAuthStateChange handles setUser
  };

  const loginWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth` },
    });
    if (error) throw new Error(error.message);
  };

  const loginWithFacebook = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'facebook',
      options: { redirectTo: `${window.location.origin}/auth` },
    });
    if (error) throw new Error(error.message);
  };

  // Instagram OAuth is not supported by Supabase — keep as no-op
  const loginWithInstagram = async () => {
    throw new Error('Instagram login is not available at this time.');
  };

  const signup = async (name: string, email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    });
    if (error) throw new Error(error.message);

    // Create profiles row
    if (data.user) {
      await supabase.from('profiles').insert({ id: data.user.id, name, role: 'user' });
    }
    // onAuthStateChange handles setUser after email confirmation (or immediately if email confirm is disabled)
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  if (loading) return null; // Prevent flash of unauthenticated content

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        loginWithGoogle,
        loginWithFacebook,
        loginWithInstagram,
        signup,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
