import { useColorScheme } from '@/hooks/useColorScheme';
import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { OnboardingScreen } from '../OnboardingScreen';
import { ThemedText } from '../ThemedText';

interface WelcomeScreenProps {
  onNext: () => void;
  currentStep?: number;
  totalSteps?: number;
  onSkip: () => void;
}

export function WelcomeScreen({ onNext, currentStep, totalSteps, onSkip }: WelcomeScreenProps) {
  const { colorScheme } = useColorScheme();

  return (
    <OnboardingScreen
      title="Welcome to Courtly 🎾"
      subtitle="Your AI-powered tennis coach, ready to elevate your game."
      description="Personalized practice sessions crafted just for you — wherever you play."
      buttonText="Let's Get Started"
      onButtonPress={onNext}
      showSkip={true}
      onSkip={onSkip}
      currentStep={currentStep}
      totalSteps={totalSteps}>
      <View style={styles.logoContainer}>
        <View
          style={[
            styles.logo,
            { backgroundColor: colorScheme === 'dark' ? '#3b82f6' : '#2563eb' },
          ]}>
          <ThemedText style={styles.logoText}>🎾</ThemedText>
        </View>
      </View>
    </OnboardingScreen>
  );
}

const styles = StyleSheet.create({
  logoContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  logo: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  logoText: {
    fontSize: 48,
    lineHeight: 60, // explicit line height
    textAlign: 'center',
    ...(Platform.OS === 'android' && {
      textAlignVertical: 'center',
      includeFontPadding: false,
    }),
  },
});
