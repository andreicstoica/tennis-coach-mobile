import { router } from 'expo-router';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { authClient } from './auth-client';

interface AuthContextType {
  user: any | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on app start
  const checkSession = async () => {
    try {
      console.log('Checking for existing session...');
      const session = await authClient.getSession();
      console.log('Existing session:', session);

      if (session?.data?.user) {
        setUser(session.data.user);
        console.log('Found existing user:', session.data.user.email);
      } else {
        setUser(null);
        console.log('No existing session found');
      }
    } catch (error) {
      console.error('Error checking session:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      console.log('Auth context: Attempting to sign in with email:', email);

      const result = await authClient.signIn.email({
        email,
        password,
      });

      console.log('Auth context: Sign in result:', result);

      if (result.data?.user) {
        console.log('Auth context: Setting user state:', result.data.user.email);
        setUser(result.data.user);

        // Navigate to home after successful sign-in
        setTimeout(() => {
          router.replace('/(tabs)');
        }, 100);
      } else {
        throw new Error('No user data received');
      }
    } catch (error) {
      console.error('Auth context: Sign in error:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      console.log('Auth context: Signing out...');
      await authClient.signOut();
      setUser(null);
      router.replace('/');
    } catch (error) {
      console.error('Auth context: Error signing out:', error);
    }
  };

  useEffect(() => {
    checkSession();
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, signOut, signIn }}>
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
