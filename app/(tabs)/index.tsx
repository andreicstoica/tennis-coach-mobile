import { Image } from 'expo-image';
import { useState } from 'react';
import { StyleSheet } from 'react-native';

import { HelloWave } from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Button } from '@/components/ui/button';
import { SignInForm } from '~/components/SignInForm';
import { SignUpForm } from '~/components/SignUpForm';
import { useAuth } from '~/lib/auth-context';

export default function HomeScreen() {
  const { user, isLoading, signOut, signIn } = useAuth();
  const [showSignUp, setShowSignUp] = useState(false);

  const handleSignIn = async (email: string, password: string) => {
    await signIn(email, password);
    console.log('User signed in successfully via auth context:', email);
  };

  const handleSignUp = async (name: string, email: string, password: string) => {
    console.log('User signed up successfully:', { name, email });
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
        <ThemedView style={styles.centeredContainer}>
          <ThemedView style={styles.titleRow}>
            <ThemedText type="title" style={styles.welcomeTitle}>
              Welcome back, {user.name || user.email}!
            </ThemedText>
            <HelloWave />
          </ThemedView>
          <ThemedText type="defaultSemiBold" style={styles.welcomeText}>
            Successfully signed in to Courtly.
          </ThemedText>
          <Button variant="outline" onPress={signOut} style={styles.signOutButton}>
            <ThemedText>Sign Out</ThemedText>
          </Button>
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
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 32,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 18,
  },
  welcomeTitle: {
    textAlign: 'center',
    flexShrink: 1,
  },
  welcomeText: {
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
    fontSize: 17,
    opacity: 0.85,
  },
  signOutButton: {
    alignSelf: 'center',
    width: '100%',
    maxWidth: 320,
    height: 45,
    marginTop: 0,
  },
});
