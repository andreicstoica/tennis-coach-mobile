import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import {
  AccountSetupScreen,
  BadgeTeaserScreen,
  FinalWelcomeScreen,
  WelcomeScreen,
  WhatCourtlyDoesScreen,
} from './onboarding';
import { SignInForm } from './SignInForm';
import { SignUpForm } from './SignUpForm';
import { ThemedView } from './ThemedView';

type OnboardingStep =
  | 'welcome'
  | 'what-courtly-does'
  | 'badge-teaser'
  | 'account-setup'
  | 'sign-up'
  | 'sign-in'
  | 'final-welcome';

interface OnboardingFlowProps {
  onComplete: () => void;
  onSignIn: (email: string, password: string) => Promise<void>;
  onSignUp: (name: string, email: string, password: string) => Promise<void>;
}

export function OnboardingFlow({ onComplete, onSignIn, onSignUp }: OnboardingFlowProps) {
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('welcome');

  const goToNext = () => {
    switch (currentStep) {
      case 'welcome':
        setCurrentStep('what-courtly-does');
        break;
      case 'what-courtly-does':
        setCurrentStep('badge-teaser');
        break;
      case 'badge-teaser':
        setCurrentStep('account-setup');
        break;
      case 'account-setup':
        setCurrentStep('sign-up');
        break;
      case 'sign-up':
        setCurrentStep('final-welcome');
        break;
      case 'sign-in':
        setCurrentStep('final-welcome');
        break;
      case 'final-welcome':
        onComplete();
        break;
    }
  };

  const goToPrevious = () => {
    switch (currentStep) {
      case 'what-courtly-does':
        setCurrentStep('welcome');
        break;
      case 'badge-teaser':
        setCurrentStep('what-courtly-does');
        break;
      case 'account-setup':
        setCurrentStep('badge-teaser');
        break;
      case 'sign-up':
        setCurrentStep('account-setup');
        break;
      case 'sign-in':
        setCurrentStep('account-setup');
        break;
    }
  };

  const handleSignUp = () => {
    setCurrentStep('sign-up');
  };

  const handleSignIn = () => {
    setCurrentStep('sign-in');
  };

  const handleSignUpComplete = async (name: string, email: string, password: string) => {
    await onSignUp(name, email, password);
    setCurrentStep('final-welcome');
  };

  const handleSignInComplete = async (email: string, password: string) => {
    await onSignIn(email, password);
    setCurrentStep('final-welcome');
  };

  const handleSkipToAccountSetup = () => {
    setCurrentStep('account-setup');
  };

  const getStepNumber = (step: OnboardingStep): number => {
    const stepOrder = ['welcome', 'what-courtly-does', 'badge-teaser', 'account-setup'];
    return stepOrder.indexOf(step) + 1;
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'welcome':
        return (
          <WelcomeScreen
            onNext={goToNext}
            currentStep={1}
            totalSteps={4}
            onSkip={handleSkipToAccountSetup}
          />
        );

      case 'what-courtly-does':
        return (
          <WhatCourtlyDoesScreen
            onNext={goToNext}
            onBack={goToPrevious}
            currentStep={2}
            totalSteps={4}
          />
        );

      case 'badge-teaser':
        return (
          <BadgeTeaserScreen
            onNext={goToNext}
            onBack={goToPrevious}
            currentStep={3}
            totalSteps={4}
          />
        );

      case 'account-setup':
        return (
          <AccountSetupScreen
            onSignUp={handleSignUp}
            onSignIn={handleSignIn}
            onBack={goToPrevious}
            currentStep={4}
            totalSteps={4}
          />
        );

      case 'sign-up':
        return (
          <ThemedView style={styles.formContainer}>
            <SignUpForm
              onSubmit={handleSignUpComplete}
              onSwitchToSignIn={() => setCurrentStep('sign-in')}
            />
          </ThemedView>
        );

      case 'sign-in':
        return (
          <ThemedView style={styles.formContainer}>
            <SignInForm
              onSubmit={handleSignInComplete}
              onSwitchToSignUp={() => setCurrentStep('sign-up')}
            />
          </ThemedView>
        );

      case 'final-welcome':
        return <FinalWelcomeScreen onStart={onComplete} />;

      default:
        return <WelcomeScreen onNext={goToNext} onSkip={handleSkipToAccountSetup} />;
    }
  };

  return <View style={styles.container}>{renderCurrentStep()}</View>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  formContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
});
