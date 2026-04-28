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
  authLoading: boolean;
  login: (email: string, password: string) => Promise<User>;
  loginWithGoogle: () => Promise<void>;
  loginWithFacebook: () => Promise<void>;
  loginWithInstagram: () => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function withTimeout<T>(promise: Promise<T>, ms: number, message: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = window.setTimeout(() => reject(new Error(message)), ms);
    promise
      .then(value => {
        window.clearTimeout(timer);
        resolve(value);
      })
      .catch(error => {
        window.clearTimeout(timer);
        reject(error);
      });
  });
}

async function passwordGrant(email: string, password: string) {
  const url = import.meta.env.VITE_SUPABASE_URL as string;
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), 30000);

  try {
    const res = await fetch(`${url}/auth/v1/token?grant_type=password`, {
      method: 'POST',
      headers: {
        apikey: anonKey,
        Authorization: `Bearer ${anonKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: email.trim(), password }),
      signal: controller.signal,
    });
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new Error(data.msg ?? data.error_description ?? data.error ?? 'Login failed');
    }
    if (!data.access_token || !data.refresh_token || !data.user) {
      throw new Error('Login response was incomplete. Please try again.');
    }

    return data as {
      access_token: string;
      refresh_token: string;
      user: { id: string; email?: string; user_metadata?: Record<string, any>; app_metadata?: Record<string, any> };
    };
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new Error('Login timed out while contacting Supabase. Please check your connection and try again.');
    }
    throw err;
  } finally {
    window.clearTimeout(timer);
  }
}

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
    avatar: su.user_metadata?.avatar_url ?? su.user_metadata?.picture,
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
    const { data, error } = await supabase.from('profiles').select('name, role').eq('id', userId).maybeSingle();
    if (error) console.error('Profile load error:', error);
    return data;
  };

  useEffect(() => {
    // Safety net: if Supabase hangs (stale session, network issue), unblock the public app.
    const timeout = setTimeout(() => setLoading(false), 6000);

    // Restore session on mount — gracefully handle missing/placeholder Supabase credentials
    supabase.auth.getSession()
      .then(async ({ data: { session } }) => {
        clearTimeout(timeout);
        if (session) {
          const profile = await fetchProfile(session.user.id);
          setUser(mapUser(session, profile));
        }
        setLoading(false);
      })
      .catch(() => {
        clearTimeout(timeout);
        // Supabase not yet configured — app runs in unauthenticated mode
        setLoading(false);
      });

    // Listen for auth state changes (login, logout, token refresh)
    let subscription: { unsubscribe: () => void } = { unsubscribe: () => {} };
    try {
      const { data } = supabase.auth.onAuthStateChange((_event, session) => {
        if (!session) {
          setUser(null);
          return;
        }

        // Keep Supabase's auth callback synchronous; do profile work after
        // the session update has finished to avoid auth lock stalls.
        setUser(mapUser(session, null));
        window.setTimeout(async () => {
          const profile = await fetchProfile(session.user.id);
          setUser(current => current?.id === session.user.id ? mapUser(session, profile) : current);
        }, 0);
      });
      subscription = data.subscription;
    } catch {
      // Supabase not yet configured — skip auth listener
    }

    return () => {
      clearTimeout(timeout);
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    const grant = await passwordGrant(email, password);

    const { data, error } = await withTimeout(
      supabase.auth.setSession({
        access_token: grant.access_token,
        refresh_token: grant.refresh_token,
      }),
      10000,
      'Login succeeded, but saving the session timed out. Please refresh and try again.'
    );

    if (error) throw new Error(error.message);
    const session = data.session ?? {
      access_token: grant.access_token,
      refresh_token: grant.refresh_token,
      user: grant.user,
    };
    if (!session) {
      throw new Error('Email not confirmed — please check your inbox for a verification link, then try again.');
    }

    const profile = await withTimeout(
      fetchProfile(session.user.id),
      8000,
      'Profile lookup timed out'
    ).catch(err => {
      console.warn('Profile lookup after login failed:', err);
      return null;
    });

    const mappedUser = mapUser(session, profile);
    setUser(mappedUser);
    return mappedUser;
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
      email: email.trim(),
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
    localStorage.removeItem('mapheane-cart-v2');
    localStorage.removeItem('mapheane_wishlist');
    window.location.href = '/';
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth`,
    });
    if (error) throw new Error(error.message);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        authLoading: loading,
        login,
        loginWithGoogle,
        loginWithFacebook,
        loginWithInstagram,
        signup,
        logout,
        resetPassword,
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
