import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, AuthContextType } from '@/types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

  const mapApiUserToUser = (u: any): User => ({
    uid: u.id,
    email: u.email ?? null,
    displayName: u.name ?? null,
    photoURL: u.image ?? null,
    createdAt: new Date() as any,
    plan: (u.plan ?? 'free').toLowerCase(),
    searchCount: u.searchCount ?? 0,
  });

  const refreshSession = async () => {
    const res = await fetch(`${API_URL}/api/auth/session`, { credentials: 'include' });
    const data = await res.json();
    if (data?.user) {
      setUser(mapApiUserToUser(data.user));
    } else {
      setUser(null);
    }
  };

  useEffect(() => {
    (async () => {
      try {
        await refreshSession();
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const signUp = async (args: { email: string; password: string; name?: string }) => {
    const res = await fetch(`${API_URL}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(args),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data?.error || 'Failed to sign up');
    if (data?.user) setUser(mapApiUserToUser(data.user));
  };

  const signIn = async (args: { email: string; password: string }) => {
    const res = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(args),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data?.error || 'Failed to sign in');
    if (data?.user) setUser(mapApiUserToUser(data.user));
  };

  const signOut = async () => {
    await fetch(`${API_URL}/api/auth/logout`, { method: 'POST', credentials: 'include' });
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    loading,
    signUp,
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
