import { HelloWave } from '@/components/HelloWave';
import { SignInForm } from '@/components/SignInForm';
import { SignUpForm } from '@/components/SignUpForm';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useAuth } from '@/lib/auth-context';
import { useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';

export default function AuthScreen() {
  const { signIn } = useAuth();
  const [showSignUp, setShowSignUp] = useState(false);

  const handleSignIn = async (email: string, password: string) => {
    await signIn(email, password);
  };

  const handleSignUp = async (name: string, email: string, password: string) => {
    // You may want to call your sign up logic here, but actual sign up is handled in SignUpForm
  };

  return (
    <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Welcome to Courtly</ThemedText>
      </ThemedView>
      <ThemedView style={styles.waveContainer}>
        <HelloWave />
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        {showSignUp ? (
          <SignUpForm onSubmit={handleSignUp} onSwitchToSignIn={() => setShowSignUp(false)} />
        ) : (
          <SignInForm onSubmit={handleSignIn} onSwitchToSignUp={() => setShowSignUp(true)} />
        )}
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 0,
    justifyContent: 'center',
  },
  waveContainer: {
    alignItems: 'center',
    marginBottom: 8,
    paddingVertical: 4,
  },
  stepContainer: {
    width: '100%',
    maxWidth: 400,
    gap: 8,
    marginBottom: 8,
    alignItems: 'center',
    paddingHorizontal: 16,
  },
});
