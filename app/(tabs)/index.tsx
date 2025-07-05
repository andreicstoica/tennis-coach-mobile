import { useColorScheme } from '@/hooks/useColorScheme';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Image, StyleSheet, View } from 'react-native';

import { HelloWave } from '@/components/HelloWave';
import NewPracticeSessionModal from '@/components/NewPracticeSessionModal';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Button } from '@/components/ui/button';
import { SignInForm } from '~/components/SignInForm';
import { SignUpForm } from '~/components/SignUpForm';
import { useAuth } from '~/lib/auth-context';

const TennisCourtBackground = ({ isDark }: { isDark: boolean }) => (
  <View style={styles.tennisCourtBackgroundContainer} pointerEvents="none">
    <Image
      source={require('@/assets/images/background.png')}
      style={[styles.tennisCourtBackground]}
      resizeMode="cover"
      accessible
      accessibilityLabel="Tennis court in a park background"
    />
    {isDark && <View style={styles.darkOverlay} />}
    <LinearGradient
      colors={
        isDark
          ? ['rgba(0,0,0,0)', 'rgba(0,0,0,0.7)', 'rgba(0,0,0,0.95)']
          : ['rgba(255,255,255,0)', 'rgba(255,255,255,0.8)', 'rgba(255,255,255,1)']
      }
      locations={[0, 0.8, 1]}
      start={{ x: 0.5, y: 1 }}
      end={{ x: 0.5, y: 0 }}
      style={styles.tennisCourtGradient}
    />
  </View>
);

export default function HomeScreen() {
  const { user, isLoading, signIn } = useAuth();
  const { colorScheme } = useColorScheme();
  const [showSignUp, setShowSignUp] = useState(false);
  const [showModal, setShowModal] = useState(false);

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

  if (isLoading) {
    return (
      <ThemedView lightColor="white" style={styles.loadingContainer}>
        <ThemedText type="title">Loading...</ThemedText>
      </ThemedView>
    );
  }

  if (user) {
    return (
      <ThemedView style={styles.container}>
        <TennisCourtBackground isDark={colorScheme === 'dark'} />
        <ThemedView style={styles.centeredContainer}>
          <ThemedView style={styles.welcomeBlock}>
            <ThemedText
              type="title"
              style={(styles.welcomeTitle, { color: colorScheme === 'dark' ? '#fff' : '#000' })}>
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
            className="max-w-lg"
            onPress={() => setShowModal(true)}
            style={{ marginBottom: 16, marginTop: 0 }}>
            <ThemedText style={{ color: 'white', fontFamily: 'LumberSans' }}>
              New Practice Session
            </ThemedText>
          </Button>
        </ThemedView>
        <NewPracticeSessionModal visible={showModal} onClose={() => setShowModal(false)} />
      </ThemedView>
    );
  }

  return (
    <ThemedView lightColor="white" darkColor="#000000" style={styles.container}>
      <TennisCourtBackground isDark={colorScheme === 'dark'} />
      <ThemedView style={styles.contentContainer}>
        <ThemedView lightColor="transparent" style={styles.titleContainer}>
          <ThemedText type="title">Welcome to Courtly</ThemedText>
        </ThemedView>
        <ThemedView lightColor="transparent" style={styles.waveContainer}>
          <HelloWave />
        </ThemedView>
        <ThemedView lightColor="transparent" style={styles.stepContainer}>
          {showSignUp ? (
            <SignUpForm onSubmit={handleSignUp} onSwitchToSignIn={handleSwitchToSignIn} />
          ) : (
            <SignInForm onSubmit={handleSignIn} onSwitchToSignUp={handleSwitchToSignUp} />
          )}
        </ThemedView>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    zIndex: 2, // Above the background
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
    padding: 16,
    zIndex: 2, // Above the background
  },
  welcomeBlock: {
    alignItems: 'center',
    marginBottom: 8,
  },
  welcomeTitle: {
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 28,
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
  tennisCourtBackgroundContainer: {
    position: 'absolute',
    width: '100%',
    aspectRatio: 1,
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1, // Above the white background, below the content
    alignSelf: 'center',
  },
  tennisCourtBackground: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  tennisCourtGradient: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  darkOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)', // Dark tint over the image
    width: '100%',
    height: '100%',
  },
});
