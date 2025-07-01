import React, { createContext, useContext, useEffect, useState } from 'react';
import { authClient } from './auth-client';
import { trpc } from './trpc/client';

interface AuthContextType {
  user: any | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const { data: session } = trpc.auth.getSession.useQuery();

  const refreshSession = async () => {
    try {
      const session = await authClient.getSession();
      setUser(session?.data?.user || null);
    } catch (error) {
      console.error('Error refreshing session:', error);
      setUser(null);
    }
  };

  const signOut = async () => {
    try {
      await authClient.signOut();
      setUser(null);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  useEffect(() => {
    refreshSession().finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    if (session) {
      setUser(session.user);
    } else {
      setUser(null);
    }
  }, [session]);

  return (
    <AuthContext.Provider value={{ user, isLoading, signOut, refreshSession }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
