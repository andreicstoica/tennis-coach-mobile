import { useColorScheme } from '@/hooks/useColorScheme';
import React from 'react';
import { StyleSheet } from 'react-native';
import { OnboardingScreen } from '../OnboardingScreen';

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
      subtitle="AI personalized and structured practice sessions crafted for you."
      buttonText="Let's Get Started"
      onButtonPress={onNext}
      showSkip={true}
      onSkip={onSkip}
      currentStep={currentStep}
      totalSteps={totalSteps}>
      {/* Logo removed */}
    </OnboardingScreen>
  );
}

const styles = StyleSheet.create({});
