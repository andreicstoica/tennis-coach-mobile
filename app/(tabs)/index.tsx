import { Image } from 'expo-image';
import { useState } from 'react';
import { StyleSheet } from 'react-native';

import { HelloWave } from '@/components/HelloWave';
import NewPracticeSessionModal from '@/components/NewPracticeSessionModal';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import PracticePlanView from '@/components/PracticePlanView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Button } from '@/components/ui/button';
import { useTRPC } from '@/lib/trpc/trpc';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { SignInForm } from '~/components/SignInForm';
import { SignUpForm } from '~/components/SignUpForm';
import { useAuth } from '~/lib/auth-context';

export default function HomeScreen() {
  const { user, isLoading, signOut, signIn } = useAuth();
  const [showSignUp, setShowSignUp] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [focus, setFocus] = useState('');
  const [plan, setPlan] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const trpc = useTRPC();
  const generateChatMutation = useMutation(trpc.chat.create.mutationOptions());
  const createPracticeSessionMutation = useMutation(trpc.practiceSession.create.mutationOptions());

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

  const handleCreateSession = async () => {
    if (!focus.trim()) {
      setError('Please enter a focus for your session.');
      return;
    }
    setLoading(true);
    setError('');
    setPlan(null);
    try {
      console.log('Creating practice session with focus:', focus);
      // 1. Create practice session
      const sessions = await createPracticeSessionMutation.mutate({ focus: focus });
      console.log('Practice session created:', sessions);
      const session = Array.isArray(sessions) ? sessions[0] : sessions;
      if (!session?.id) throw new Error('Failed to create session.');
      console.log('Session ID:', session.id);

      // 2. Create chat for this session
      console.log('Creating chat for session:', session.id);
      const generateChatMutation = useMutation(trpc.chat.create.mutationOptions());
      generateChatMutation.mutate({ practiceSessionId: session.id });
      console.log('Chat created with ID:', session.id);

      // 3. Fetch session by id to get plan
      const queryClient = useQueryClient();
      console.log('Fetching updated session:', session.id);
      const updatedSession = useQuery(trpc.practiceSession.get.queryOptions({ id: session.id }));
      console.log('Updated session:', updatedSession);
    } catch (err) {
      console.error('Error creating practice session:', err);
      const error = err as Error;
      console.error('Error details:', {
        name: error?.name,
        message: error?.message,
        stack: error?.stack,
        cause: error?.cause,
      });
      setError(error?.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
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
          <Button
            variant="default"
            className="w-full"
            onPress={() => setShowModal(true)}
            style={{ marginBottom: 16 }}>
            <ThemedText>New Practice Session</ThemedText>
          </Button>
          <Button variant="outline" onPress={signOut} style={styles.signOutButton}>
            <ThemedText>Sign Out</ThemedText>
          </Button>
          {plan && <PracticePlanView plan={plan} />}
        </ThemedView>
        <NewPracticeSessionModal
          visible={showModal}
          loading={loading}
          error={error}
          focus={focus}
          setFocus={setFocus}
          onClose={() => setShowModal(false)}
          onCreate={handleCreateSession}
        />
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
