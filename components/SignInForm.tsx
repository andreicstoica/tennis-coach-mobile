import { useColorScheme } from '@/hooks/useColorScheme';
import { authClient } from '@/lib/auth-client';
import React, { useState } from 'react';
import { TextInput, TouchableOpacity, View } from 'react-native';
import { z } from 'zod';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';
import { IconSymbol } from './ui/IconSymbol';

// 1. Define the Zod schema
const signInSchema = z.object({
  email: z.string().email({ message: 'Enter a valid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
});

interface SignInFormProps {
  onSubmit: (email: string, password: string) => void;
  isLoading?: boolean;
  onSwitchToSignUp: () => void;
}

export function SignInForm({ onSubmit, isLoading = false, onSwitchToSignUp }: SignInFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isGoogleSigningIn, setIsGoogleSigningIn] = useState(false);
  const { colorScheme } = useColorScheme();

  // 2. Validate with Zod on submit
  const handleEmailSignIn = async () => {
    const result = signInSchema.safeParse({ email, password });

    if (!result.success) {
      // Map Zod errors to field errors
      const fieldErrors: { email?: string; password?: string } = {};
      result.error.errors.forEach((err) => {
        if (err.path[0] === 'email') fieldErrors.email = err.message;
        if (err.path[0] === 'password') fieldErrors.password = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    setIsSigningIn(true);

    try {
      console.log('SignInForm: Calling onSubmit for email:', email);
      // Let the parent component handle authentication via auth context
      await onSubmit(email, password);
    } catch (error) {
      console.error('Sign in error in form:', error);
      setErrors({
        email: 'Invalid email or password. Please try again.',
      });
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleSigningIn(true);

    try {
      await authClient.signIn.social({
        provider: 'google',
        callbackURL: '/dashboard', // this will be converted to a deep link (eg. `tenniscoachmobile://dashboard`) on native
      });
      // Google sign-in successful
      console.log('Google sign in successful');
    } catch (error) {
      console.error('Google sign in error:', error);
      // Handle Google sign-in errors
      setErrors({
        email: 'Google sign-in failed. Please try again.',
      });
    } finally {
      setIsGoogleSigningIn(false);
    }
  };

  const clearFieldError = (field: string) => {
    if (errors[field as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <ThemedView
      style={{
        padding: 24,
        borderRadius: 12,
        shadowColor: colorScheme === 'dark' ? '#000' : '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: colorScheme === 'dark' ? 0.3 : 0.1,
        shadowRadius: 8,
        elevation: 8,
        backgroundColor: colorScheme === 'dark' ? '#1f2937' : '#ffffff',
        borderWidth: 1,
        borderColor: colorScheme === 'dark' ? '#374151' : '#e5e7eb',
      }}>
      <ThemedText
        type="title"
        style={{
          textAlign: 'center',
          marginBottom: 24,
          fontSize: 24,
          fontWeight: 'bold',
        }}>
        Sign In
      </ThemedText>

      {/* Email Input */}
      <View style={{ marginBottom: 16 }}>
        <ThemedText type="defaultSemiBold" style={{ marginBottom: 8 }}>
          Email
        </ThemedText>
        <TextInput
          value={email}
          onChangeText={(text) => {
            setEmail(text);
            clearFieldError('email');
          }}
          placeholder="Enter your email"
          placeholderTextColor={colorScheme === 'dark' ? '#9ca3af' : '#6b7280'}
          style={{
            borderWidth: 1,
            borderColor: errors.email ? '#ef4444' : colorScheme === 'dark' ? '#374151' : '#d1d5db',
            borderRadius: 8,
            padding: 12,
            fontSize: 16,
            backgroundColor: colorScheme === 'dark' ? '#111827' : '#ffffff',
            color: colorScheme === 'dark' ? '#ffffff' : '#000000',
          }}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        {errors.email && (
          <ThemedText style={{ color: '#ef4444', marginTop: 4, fontSize: 13 }}>
            {errors.email}
          </ThemedText>
        )}
      </View>

      {/* Password Input */}
      <View style={{ marginBottom: 24 }}>
        <ThemedText type="defaultSemiBold" style={{ marginBottom: 8 }}>
          Password
        </ThemedText>
        <TextInput
          value={password}
          onChangeText={(text) => {
            setPassword(text);
            clearFieldError('password');
          }}
          placeholder="Enter your password"
          placeholderTextColor={colorScheme === 'dark' ? '#9ca3af' : '#6b7280'}
          style={{
            borderWidth: 1,
            borderColor: errors.password
              ? '#ef4444'
              : colorScheme === 'dark'
                ? '#374151'
                : '#d1d5db',
            borderRadius: 8,
            padding: 12,
            fontSize: 16,
            backgroundColor: colorScheme === 'dark' ? '#111827' : '#ffffff',
            color: colorScheme === 'dark' ? '#ffffff' : '#000000',
          }}
          secureTextEntry
        />
        {errors.password && (
          <ThemedText style={{ color: '#ef4444', marginTop: 4, fontSize: 13 }}>
            {errors.password}
          </ThemedText>
        )}
      </View>

      {/* Email Sign In Button */}
      <TouchableOpacity
        onPress={handleEmailSignIn}
        disabled={isSigningIn}
        style={{
          backgroundColor: isSigningIn
            ? colorScheme === 'dark'
              ? '#6b7280'
              : '#9ca3af'
            : colorScheme === 'dark'
              ? '#3b82f6'
              : '#2563eb',
          padding: 16,
          borderRadius: 8,
          marginBottom: 16,
          alignItems: 'center',
          shadowColor: colorScheme === 'dark' ? '#3b82f6' : '#2563eb',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.2,
          shadowRadius: 4,
          elevation: 4,
        }}
        activeOpacity={0.8}>
        <ThemedText
          type="defaultSemiBold"
          style={{
            color: '#ffffff',
            fontSize: 16,
          }}>
          {isSigningIn ? 'Signing In...' : 'Sign In with Email'}
        </ThemedText>
      </TouchableOpacity>

      {/* Divider */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginVertical: 16,
        }}>
        <View
          style={{
            flex: 1,
            height: 1,
            backgroundColor: colorScheme === 'dark' ? '#374151' : '#d1d5db',
          }}
        />
        <ThemedText
          style={{
            marginHorizontal: 16,
            color: colorScheme === 'dark' ? '#9ca3af' : '#6b7280',
          }}>
          or
        </ThemedText>
        <View
          style={{
            flex: 1,
            height: 1,
            backgroundColor: colorScheme === 'dark' ? '#374151' : '#d1d5db',
          }}
        />
      </View>

      {/* Google Sign In Button */}
      <TouchableOpacity
        onPress={handleGoogleSignIn}
        disabled={isGoogleSigningIn}
        style={{
          backgroundColor: colorScheme === 'dark' ? '#374151' : '#f9fafb',
          padding: 16,
          borderRadius: 8,
          marginBottom: 12,
          alignItems: 'center',
          flexDirection: 'row',
          justifyContent: 'center',
          borderWidth: 1,
          borderColor: colorScheme === 'dark' ? '#4b5563' : '#d1d5db',
          shadowColor: colorScheme === 'dark' ? '#000' : '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.1,
          shadowRadius: 2,
          elevation: 2,
          opacity: isGoogleSigningIn ? 0.6 : 1,
        }}
        activeOpacity={0.8}>
        <IconSymbol
          name="globe"
          size={20}
          color={colorScheme === 'dark' ? '#ffffff' : '#000000'}
          style={{ marginRight: 8 }}
        />
        <ThemedText
          type="defaultSemiBold"
          style={{
            color: colorScheme === 'dark' ? '#ffffff' : '#000000',
            fontSize: 16,
          }}>
          {isGoogleSigningIn ? 'Signing in with Google...' : 'Continue with Google'}
        </ThemedText>
      </TouchableOpacity>

      {/* Switch to Sign Up */}
      <TouchableOpacity
        onPress={onSwitchToSignUp}
        style={{
          alignItems: 'center',
          padding: 12,
        }}
        activeOpacity={0.7}>
        <ThemedText
          style={{
            color: colorScheme === 'dark' ? '#3b82f6' : '#2563eb',
            fontSize: 14,
          }}>
          Don&apos;t have an account? Sign Up
        </ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
}
