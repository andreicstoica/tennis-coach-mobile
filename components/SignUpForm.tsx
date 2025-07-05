import { useColorScheme } from '@/hooks/useColorScheme';
import { authClient } from '@/lib/auth-client';
import React, { useState } from 'react';
import { TextInput, TouchableOpacity, View } from 'react-native';
import { z } from 'zod';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';
import { IconSymbol } from './ui/IconSymbol';

// Define the Zod schema for sign up
const signUpSchema = z
  .object({
    name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
    email: z.string().email({ message: 'Enter a valid email address' }),
    password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

interface SignUpFormProps {
  onSubmit: (name: string, email: string, password: string) => void;
  isLoading?: boolean;
  onSwitchToSignIn: () => void;
}

export function SignUpForm({ onSubmit, isLoading = false, onSwitchToSignIn }: SignUpFormProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [isGoogleSigningUp, setIsGoogleSigningUp] = useState(false);
  const { colorScheme } = useColorScheme();

  const handleSignUp = async () => {
    const result = signUpSchema.safeParse({ name, email, password, confirmPassword });

    if (!result.success) {
      const fieldErrors: {
        name?: string;
        email?: string;
        password?: string;
        confirmPassword?: string;
      } = {};
      result.error.errors.forEach((err) => {
        if (err.path[0] === 'name') fieldErrors.name = err.message;
        if (err.path[0] === 'email') fieldErrors.email = err.message;
        if (err.path[0] === 'password') fieldErrors.password = err.message;
        if (err.path[0] === 'confirmPassword') fieldErrors.confirmPassword = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    setIsSigningUp(true);

    try {
      // Let the auth context handle the signup
      await onSubmit(name, email, password);
    } catch (error) {
      console.error('Sign up error:', error);
      setErrors({
        email: 'Failed to create account. Please try again.',
      });
    } finally {
      setIsSigningUp(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setIsGoogleSigningUp(true);

    try {
      await authClient.signIn.social({
        provider: 'google',
        callbackURL: '/(tabs)',
      });
      console.log('Google sign up successful');
    } catch (error) {
      console.error('Google sign up error:', error);
      setErrors({
        email: 'Google sign-up failed. Please try again.',
      });
    } finally {
      setIsGoogleSigningUp(false);
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
        paddingVertical: 24,
        paddingHorizontal: 24,
        borderRadius: 12,
        shadowColor: colorScheme === 'dark' ? '#000' : '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: colorScheme === 'dark' ? 0.3 : 0.1,
        shadowRadius: 8,
        elevation: 8,
        backgroundColor: colorScheme === 'dark' ? '#1f2937' : '#ffffff',
        borderWidth: 1,
        borderColor: colorScheme === 'dark' ? '#374151' : '#e5e7eb',
        width: '100%',
        maxWidth: 400,
        alignSelf: 'center',
      }}>
      <ThemedText
        type="title"
        style={{
          textAlign: 'center',
          marginBottom: 24,
          fontSize: 24,
          fontWeight: 'bold',
        }}>
        Create Account
      </ThemedText>

      {/* Name Input */}
      <View style={{ marginBottom: 16, width: '100%', alignSelf: 'stretch' }}>
        <ThemedText type="defaultSemiBold" style={{ marginBottom: 8 }}>
          Username
        </ThemedText>
        <TextInput
          value={name}
          onChangeText={(text) => {
            setName(text);
            clearFieldError('name');
          }}
          placeholder="Enter your full name"
          placeholderTextColor={colorScheme === 'dark' ? '#9ca3af' : '#6b7280'}
          style={{
            borderWidth: 1,
            borderColor: errors.name ? '#ef4444' : colorScheme === 'dark' ? '#374151' : '#d1d5db',
            borderRadius: 8,
            padding: 12,
            fontSize: 16,
            backgroundColor: colorScheme === 'dark' ? '#111827' : '#ffffff',
            color: colorScheme === 'dark' ? '#ffffff' : '#000000',
            width: '100%',
            alignSelf: 'stretch',
          }}
          autoCapitalize="words"
        />
        {errors.name && (
          <ThemedText style={{ color: '#ef4444', marginTop: 4, fontSize: 13 }}>
            {errors.name}
          </ThemedText>
        )}
      </View>

      {/* Email Input */}
      <View style={{ marginBottom: 16, width: '100%', alignSelf: 'stretch' }}>
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
            width: '100%',
            alignSelf: 'stretch',
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
      <View style={{ marginBottom: 16, width: '100%', alignSelf: 'stretch' }}>
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
            width: '100%',
            alignSelf: 'stretch',
          }}
          secureTextEntry
        />
        {errors.password && (
          <ThemedText style={{ color: '#ef4444', marginTop: 4, fontSize: 13 }}>
            {errors.password}
          </ThemedText>
        )}
      </View>

      {/* Confirm Password Input */}
      <View style={{ marginBottom: 24, width: '100%', alignSelf: 'stretch' }}>
        <ThemedText type="defaultSemiBold" style={{ marginBottom: 8 }}>
          Confirm Password
        </ThemedText>
        <TextInput
          value={confirmPassword}
          onChangeText={(text) => {
            setConfirmPassword(text);
            clearFieldError('confirmPassword');
          }}
          placeholder="Confirm your password"
          placeholderTextColor={colorScheme === 'dark' ? '#9ca3af' : '#6b7280'}
          style={{
            borderWidth: 1,
            borderColor: errors.confirmPassword
              ? '#ef4444'
              : colorScheme === 'dark'
                ? '#374151'
                : '#d1d5db',
            borderRadius: 8,
            padding: 12,
            fontSize: 16,
            backgroundColor: colorScheme === 'dark' ? '#111827' : '#ffffff',
            color: colorScheme === 'dark' ? '#ffffff' : '#000000',
            width: '100%',
            alignSelf: 'stretch',
          }}
          secureTextEntry
        />
        {errors.confirmPassword && (
          <ThemedText style={{ color: '#ef4444', marginTop: 4, fontSize: 13 }}>
            {errors.confirmPassword}
          </ThemedText>
        )}
      </View>

      {/* Email Sign Up Button */}
      <TouchableOpacity
        onPress={handleSignUp}
        disabled={isSigningUp}
        style={{
          backgroundColor: isSigningUp
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
          width: '100%',
          alignSelf: 'center',
        }}>
        <ThemedText
          style={{
            color: '#ffffff',
            fontSize: 16,
            fontWeight: '600',
          }}>
          {isSigningUp ? 'Creating Account...' : 'Create Account'}
        </ThemedText>
      </TouchableOpacity>

      {/* Google Sign Up Button */}
      <TouchableOpacity
        onPress={handleGoogleSignUp}
        disabled={isGoogleSigningUp}
        style={{
          backgroundColor: colorScheme === 'dark' ? '#374151' : '#f3f4f6',
          padding: 16,
          borderRadius: 8,
          marginBottom: 16,
          alignItems: 'center',
          borderWidth: 1,
          borderColor: colorScheme === 'dark' ? '#4b5563' : '#d1d5db',
          flexDirection: 'row',
          justifyContent: 'center',
          gap: 8,
          alignSelf: 'center',
          width: '100%',
        }}>
        <IconSymbol size={20} name="globe" color={colorScheme === 'dark' ? '#ffffff' : '#000000'} />
        <ThemedText
          style={{
            color: colorScheme === 'dark' ? '#ffffff' : '#000000',
            fontSize: 16,
            fontWeight: '600',
          }}>
          {isGoogleSigningUp ? 'Signing up with Google...' : 'Continue with Google'}
        </ThemedText>
      </TouchableOpacity>

      {/* Switch to Sign In */}
      <View style={{ alignItems: 'center', width: '100%' }}>
        <ThemedText
          style={{ color: colorScheme === 'dark' ? '#9ca3af' : '#6b7280', marginBottom: 8 }}>
          Already have an account?
        </ThemedText>
        <TouchableOpacity onPress={onSwitchToSignIn}>
          <ThemedText
            style={{
              color: colorScheme === 'dark' ? '#3b82f6' : '#2563eb',
              fontSize: 16,
              fontWeight: '600',
            }}>
            Sign In
          </ThemedText>
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
}
