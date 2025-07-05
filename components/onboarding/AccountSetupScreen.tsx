import { useColorScheme } from '@/hooks/useColorScheme';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { OnboardingScreen } from '../OnboardingScreen';
import { ThemedText } from '../ThemedText';
import { Button } from '../ui/button';

interface AccountSetupScreenProps {
  onSignUp: () => void;
  onSignIn: () => void;
  onBack: () => void;
  currentStep?: number;
  totalSteps?: number;
}

export function AccountSetupScreen({
  onSignUp,
  onSignIn,
  onBack,
  currentStep,
  totalSteps,
}: AccountSetupScreenProps) {
  const { colorScheme } = useColorScheme();

  return (
    <OnboardingScreen
      title="Ready to Elevate Your Game?"
      subtitle="Sign up or log in to save your progress and access your personalized practice plans."
      buttonText=""
      onButtonPress={() => {}}
      showBack={true}
      onBack={onBack}
      showSkip={false}
      currentStep={currentStep}
      totalSteps={totalSteps}
      hideMainButton={true}>
      <View style={styles.buttonsContainer}>
        <Button onPress={onSignUp} style={styles.primaryButton} className="mb-4 w-full">
          <ThemedText lightColor="#ffffff" darkColor="#ffffff" style={styles.primaryButtonText}>
            Sign Up
          </ThemedText>
        </Button>

        <Button
          variant="outline"
          onPress={onSignIn}
          style={[
            styles.secondaryButton,
            { borderColor: colorScheme === 'dark' ? '#ffffff' : '#000000' },
          ]}
          className="w-full">
          <ThemedText lightColor="#000000" darkColor="#ffffff" style={styles.secondaryButtonText}>
            Sign In
          </ThemedText>
        </Button>
      </View>
    </OnboardingScreen>
  );
}

const styles = StyleSheet.create({
  buttonsContainer: {
    width: '100%',
    marginTop: 20,
  },
  primaryButton: {
    height: 56,
    borderRadius: 12,
  },
  primaryButtonText: {
    fontSize: 18,
    fontWeight: '600',
  },
  secondaryButton: {
    height: 56,
    borderRadius: 12,
    borderWidth: 2,
  },
  secondaryButtonText: {
    fontSize: 18,
    fontWeight: '600',
  },
});
