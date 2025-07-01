import { Image } from 'expo-image';
import { useState } from 'react';
import { StyleSheet } from 'react-native';

import { HelloWave } from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { SignInForm } from '~/components/SignInForm';
import { SignUpForm } from '~/components/SignUpForm';
import { useAuth } from '~/lib/auth-context';

export default function HomeScreen() {
  const { user, isLoading } = useAuth();
  const [showSignUp, setShowSignUp] = useState(false);

  const handleSignIn = (email: string, password: string) => {
    // Handle successful sign in
    console.log('User signed in successfully:', email);
    // The auth context will automatically update the user state
  };

  const handleSignUp = (name: string, email: string, password: string) => {
    // Handle successful sign up
    console.log('User signed up successfully:', { name, email });
    // The auth context will automatically update the user state
  };

  const handleSwitchToSignUp = () => {
    setShowSignUp(true);
  };

  const handleSwitchToSignIn = () => {
    setShowSignUp(false);
  };

  if (isLoading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ThemedText type="title">Loading...</ThemedText>
      </ThemedView>
    );
  }

  if (user) {
    return (
      <ParallaxScrollView
        headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
        headerImage={
          <Image source={require('@/assets/images/icon.png')} style={styles.reactLogo} />
        }>
        <ThemedView style={styles.titleContainer}>
          <ThemedText type="title">Welcome back, {user.name || user.email}!</ThemedText>
          <HelloWave />
        </ThemedView>
        <ThemedView style={styles.stepContainer}>
          <ThemedText type="defaultSemiBold" style={styles.welcomeText}>
            You&apos;re successfully signed in to Courtly. Your tennis journey awaits!
          </ThemedText>
        </ThemedView>
      </ParallaxScrollView>
    );
  }

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={<Image source={require('@/assets/images/icon.png')} style={styles.reactLogo} />}>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Welcome to Courtly</ThemedText>
        <HelloWave />
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        {showSignUp ? (
          <SignUpForm onSubmit={handleSignUp} onSwitchToSignIn={handleSwitchToSignIn} />
        ) : (
          <SignInForm onSubmit={handleSignIn} onSwitchToSignUp={handleSwitchToSignUp} />
        )}
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  welcomeText: {
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 24,
  },
});
