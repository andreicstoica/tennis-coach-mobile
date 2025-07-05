import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { AppState } from 'react-native';
import { authClient } from './auth-client';

interface AuthContextType {
  user: any | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  completeOnboarding: () => void;
  clearStorage: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Clear all secure storage for testing
  const clearStorage = async () => {
    try {
      // Clear known keys
      const knownKeys = [
        'tenniscoachmobile:session',
        'tenniscoachmobile:csrf',
        'tenniscoachmobile:state',
      ];

      for (const key of knownKeys) {
        await SecureStore.deleteItemAsync(key);
      }
      setUser(null);
      console.log('Cleared tenniscoachmobile storage');
    } catch (error) {
      console.error('Error clearing storage:', error);
    }
  };

  // Check for existing session on app start
  const checkSession = async () => {
    try {
      console.log('Auth context: Checking session...');
      const session = await authClient.getSession();
      console.log('Auth context: Session result:', session);

      if (session?.data?.user) {
        setUser(session.data.user);
        console.log('Found existing user:', session.data.user.email);
      } else {
        setUser(null);
        console.log('No existing session found');
      }
    } catch (error) {
      setUser(null);
      console.error('Error checking session:', error);
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

      // Check for both success and error cases
      if (result.error) {
        console.error('Auth context: Sign in error from server:', result.error);
        throw new Error(result.error.message || 'Sign in failed');
      }

      if (result.data?.user) {
        console.log('Auth context: Setting user state:', result.data.user.email);
        setUser(result.data.user);
        // Don't navigate here - let the onboarding flow handle it
      } else {
        console.error('Auth context: No user data in result:', result);
        throw new Error('No user data received from authentication server');
      }
    } catch (error) {
      console.error('Auth context: Sign in error:', error);
      throw error;
    }
  };

  const signUp = async (name: string, email: string, password: string) => {
    try {
      console.log('Auth context: Attempting to sign up with email:', email);

      const result = await authClient.signUp.email({
        email,
        password,
        name,
      });

      console.log('Auth context: Sign up result:', result);

      // Check for both success and error cases
      if (result.error) {
        console.error('Auth context: Sign up error from server:', result.error);
        throw new Error(result.error.message || 'Sign up failed');
      }

      if (result.data?.user) {
        console.log('Auth context: Setting user state after sign up:', result.data.user.email);
        setUser(result.data.user);
        // Don't navigate here - let the onboarding flow handle it
      } else {
        console.error('Auth context: No user data in sign up result:', result);
        throw new Error('No user data received from authentication server');
      }
    } catch (error) {
      console.error('Auth context: Sign up error:', error);
      throw error;
    }
  };

  const completeOnboarding = () => {
    console.log('Auth context: Completing onboarding, navigating to tabs');
    // Navigate to home after successful onboarding completion
    setTimeout(() => {
      router.replace('/(tabs)');
    }, 100);
  };

  const signOut = async () => {
    try {
      console.log('Auth context: Signing out...');
      await authClient.signOut();
      setUser(null);
      router.replace('/auth');
    } catch (error) {
      console.error('Auth context: Error signing out:', error);
    }
  };

  useEffect(() => {
    checkSession();

    // Listen for app state changes to detect when user returns from OAuth
    const handleAppStateChange = (nextAppState: string) => {
      if (nextAppState === 'active') {
        console.log('App became active, checking session for OAuth redirect...');
        // Small delay to ensure OAuth processing is complete
        setTimeout(() => {
          checkSession();
        }, 500);
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription?.remove();
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, isLoading, signOut, signIn, signUp, completeOnboarding, clearStorage }}>
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
