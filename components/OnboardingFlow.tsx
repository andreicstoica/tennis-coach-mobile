import * as Haptics from 'expo-haptics';
import React, { useEffect, useState } from 'react';
import {
  Dimensions,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
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
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
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
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
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
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setCurrentStep('sign-up');
  };

  const handleSignIn = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setCurrentStep('sign-in');
  };

  const handleSignUpComplete = async (name: string, email: string, password: string) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await onSignUp(name, email, password);
    setCurrentStep('final-welcome');
  };

  const handleSignInComplete = async (email: string, password: string) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await onSignIn(email, password);
    setCurrentStep('final-welcome');
  };

  const handleSkipToAccountSetup = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCurrentStep('account-setup');
  };

  const triggerHaptic = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const panGesture = Gesture.Pan()
    .minDistance(50) // Require minimum distance before gesture starts
    .minVelocity(100) // Require minimum velocity
    .onUpdate((event) => {
      if (!isSwipeableStep) return;

      // Calculate the base position for current step
      const basePosition = -currentStepIndex * screenWidth;

      // Calculate the new position with gesture translation
      let newPosition = basePosition + event.translationX;

      // Prevent rightward movement when at the first step
      if (currentStepIndex === 0 && event.translationX > 0) {
        newPosition = basePosition; // Stay at current position
      }

      // Constrain the position to valid boundaries
      const minPosition = -(swipeableSteps.length - 1) * screenWidth; // Last step position
      const maxPosition = 0; // First step position

      // Only allow movement within valid bounds
      translateX.value = Math.max(minPosition, Math.min(maxPosition, newPosition));
    })
    .onEnd((event) => {
      if (!isSwipeableStep) return;

      const threshold = screenWidth * 0.35; // Increased from 0.2 to 0.35 (35% of screen width)
      const velocity = event.velocityX;

      // Determine if we should change steps
      let targetStep = currentStepIndex;

      if (event.translationX > threshold || velocity > 800) {
        // Increased velocity threshold from 500 to 800
        // Swipe right - go to previous step
        if (currentStepIndex > 0) {
          targetStep = currentStepIndex - 1;
          runOnJS(triggerHaptic)();
          runOnJS(goToPrevious)();
        }
      } else if (event.translationX < -threshold || velocity < -800) {
        // Increased velocity threshold from -500 to -800
        // Swipe left - go to next step
        if (currentStepIndex < swipeableSteps.length - 1) {
          targetStep = currentStepIndex + 1;
          runOnJS(triggerHaptic)();
          runOnJS(goToNext)();
        }
      }

      // Animate to target position with less bouncy spring
      const targetPosition = -targetStep * screenWidth;
      translateX.value = withSpring(targetPosition, {
        damping: 35, // Increased from 20 to 35 for less bounce
        stiffness: 300, // Increased from 200 to 300 for snappier animation
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
        damping: 35, // Increased from 20 to 35 for less bounce
        stiffness: 300, // Increased from 200 to 300 for snappier animation
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
          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}>
            <ScrollView
              contentContainerStyle={styles.formContainer}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}>
              <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={{ flex: 1, justifyContent: 'center' }}>
                  <SignUpForm
                    onSubmit={handleSignUpComplete}
                    onSwitchToSignIn={() => setCurrentStep('sign-in')}
                  />
                </View>
              </TouchableWithoutFeedback>
            </ScrollView>
          </KeyboardAvoidingView>
        );
      case 'sign-in':
        return (
          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}>
            <ScrollView
              contentContainerStyle={styles.formContainer}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}>
              <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={{ flex: 1, justifyContent: 'center' }}>
                  <SignInForm
                    onSubmit={handleSignInComplete}
                    onSwitchToSignUp={() => setCurrentStep('sign-up')}
                  />
                </View>
              </TouchableWithoutFeedback>
            </ScrollView>
          </KeyboardAvoidingView>
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
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    minHeight: '100%',
  },
});
