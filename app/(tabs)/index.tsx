import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, ScrollView, StyleSheet } from 'react-native';

import { HelloWave } from '@/components/HelloWave';
import NewPracticeSessionModal from '@/components/NewPracticeSessionModal';
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
  const { user, isLoading, signIn } = useAuth();
  const [showSignUp, setShowSignUp] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [focus, setFocus] = useState('');
  const [plan, setPlan] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const trpc = useTRPC();
  const generateChatMutation = useMutation(trpc.chat.create.mutationOptions());
  const createPracticeSessionMutation = useMutation(trpc.practiceSession.create.mutationOptions());

  const tennisBallAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(tennisBallAnim, {
          toValue: -18,
          duration: 350,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(tennisBallAnim, {
          toValue: 0,
          duration: 350,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

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
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <ThemedView style={styles.centeredContainer}>
          <ThemedView style={styles.welcomeBlock}>
            <ThemedText type="title" style={styles.welcomeTitle}>
              Welcome back,
            </ThemedText>
            <ThemedText type="title" style={styles.userName}>
              {user.name || user.email}!
            </ThemedText>
            <ThemedText type="defaultSemiBold" style={styles.welcomeText}>
              Ready to improve your game today?
            </ThemedText>
          </ThemedView>
          <Animated.Text
            style={{
              fontSize: 40,
              alignSelf: 'center',
              marginBottom: -2,
              marginTop: 16,
              transform: [{ translateY: tennisBallAnim }],
            }}
            accessible
            accessibilityLabel="Tennis ball emoji">
            🎾
          </Animated.Text>
          <Button
            variant="default"
            className="w-full"
            onPress={() => setShowModal(true)}
            style={{ marginBottom: 16, marginTop: 0 }}>
            <ThemedText>New Practice Session</ThemedText>
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
      </ScrollView>
    );
  }

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
          <SignUpForm onSubmit={handleSignUp} onSwitchToSignIn={handleSwitchToSignIn} />
        ) : (
          <SignInForm onSubmit={handleSignIn} onSwitchToSignUp={handleSwitchToSignUp} />
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  welcomeBlock: {
    alignItems: 'center',
    marginBottom: 8,
  },
  welcomeTitle: {
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 28,
    color: '#222',
  },
  userName: {
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 24,
    color: '#4ECDC4',
    marginBottom: 8,
  },
  welcomeText: {
    textAlign: 'center',
    marginBottom: 0,
    lineHeight: 24,
    fontSize: 17,
    opacity: 0.85,
  },
});
