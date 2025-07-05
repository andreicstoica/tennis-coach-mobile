import React, { useEffect, useState } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
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

const { width: screenWidth } = Dimensions.get('window');

export function OnboardingFlow({ onComplete, onSignIn, onSignUp }: OnboardingFlowProps) {
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('welcome');
  const translateX = useSharedValue(0);

  const swipeableSteps: OnboardingStep[] = [
    'welcome',
    'what-courtly-does',
    'badge-teaser',
    'account-setup',
  ];
  const currentStepIndex = swipeableSteps.indexOf(currentStep);
  const isSwipeableStep = currentStepIndex !== -1;

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

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      if (!isSwipeableStep) return;

      // Calculate the base position for current step
      const basePosition = -currentStepIndex * screenWidth;

      // Add the gesture translation
      translateX.value = basePosition + event.translationX;
    })
    .onEnd((event) => {
      if (!isSwipeableStep) return;

      const threshold = screenWidth * 0.2; // 20% of screen width
      const velocity = event.velocityX;

      // Determine if we should change steps
      let targetStep = currentStepIndex;

      if (event.translationX > threshold || velocity > 500) {
        // Swipe right - go to previous step
        if (currentStepIndex > 0) {
          targetStep = currentStepIndex - 1;
          runOnJS(goToPrevious)();
        }
      } else if (event.translationX < -threshold || velocity < -500) {
        // Swipe left - go to next step
        if (currentStepIndex < swipeableSteps.length - 1) {
          targetStep = currentStepIndex + 1;
          runOnJS(goToNext)();
        }
      }

      // Animate to target position
      const targetPosition = -targetStep * screenWidth;
      translateX.value = withSpring(targetPosition, {
        damping: 20,
        stiffness: 200,
      });
    });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
    };
  });

  // Reset position when step changes programmatically (via buttons)
  useEffect(() => {
    if (isSwipeableStep) {
      const targetPosition = -currentStepIndex * screenWidth;
      translateX.value = withSpring(targetPosition, {
        damping: 20,
        stiffness: 200,
      });
    }
  }, [currentStep, isSwipeableStep]);

  const renderStepContent = (step: OnboardingStep) => {
    switch (step) {
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
        return null;
    }
  };

  if (!isSwipeableStep) {
    return <View style={styles.container}>{renderStepContent(currentStep)}</View>;
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <GestureDetector gesture={panGesture}>
        <Animated.View style={[styles.carouselContainer, animatedStyle]}>
          {swipeableSteps.map((step, index) => (
            <View key={step} style={styles.stepContainer}>
              {renderStepContent(step)}
            </View>
          ))}
        </Animated.View>
      </GestureDetector>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  carouselContainer: {
    flex: 1,
    flexDirection: 'row',
    width: screenWidth * 4, // 4 swipeable steps
  },
  stepContainer: {
    width: screenWidth,
    flex: 1,
  },
  formContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
});
