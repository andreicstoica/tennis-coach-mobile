import { useColorScheme } from '@/hooks/useColorScheme';
import * as Haptics from 'expo-haptics';
import React from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';
import { Button } from './ui/button';

const { width: screenWidth } = Dimensions.get('window');

interface OnboardingScreenProps {
  title: string;
  subtitle?: string;
  description?: string;
  children?: React.ReactNode;
  buttonText: string;
  onButtonPress: () => void;
  showSkip?: boolean;
  onSkip?: () => void;
  showBack?: boolean;
  onBack?: () => void;
  currentStep?: number;
  totalSteps?: number;
  hideMainButton?: boolean;
}

export function OnboardingScreen({
  title,
  subtitle,
  description,
  children,
  buttonText,
  onButtonPress,
  showSkip = false,
  onSkip,
  showBack = false,
  onBack,
  currentStep,
  totalSteps,
  hideMainButton = false,
}: OnboardingScreenProps) {
  const { colorScheme } = useColorScheme();

  const handleButtonPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onButtonPress();
  };

  const handleSkipPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSkip?.();
  };

  const handleBackPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onBack?.();
  };

  return (
    <ThemedView lightColor="#ffffff" darkColor="#000000" style={styles.container}>
      {/* Header with Progress Indicators */}
      <View style={styles.header}>
        {/* Progress indicators at the top */}
        {currentStep && totalSteps && (
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              {Array.from({ length: totalSteps }, (_, index) => (
                <View
                  key={index}
                  style={[
                    styles.progressDot,
                    {
                      backgroundColor:
                        index < currentStep
                          ? colorScheme === 'dark'
                            ? '#3b82f6'
                            : '#2563eb'
                          : colorScheme === 'dark'
                            ? '#374151'
                            : '#d1d5db',
                    },
                  ]}
                />
              ))}
            </View>
          </View>
        )}

        {/* Back button below progress indicators */}
        {showBack && onBack && (
          <Button variant="ghost" onPress={handleBackPress} style={styles.backButton}>
            <ThemedText lightColor="#000000" darkColor="#ffffff">
              ← Back
            </ThemedText>
          </Button>
        )}
      </View>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.textContainer}>
          <ThemedText lightColor="#000000" darkColor="#ffffff" type="title" style={styles.title}>
            {title}
          </ThemedText>
          {subtitle && (
            <ThemedText
              lightColor="#000000"
              darkColor="#ffffff"
              type="defaultSemiBold"
              style={styles.subtitle}>
              {subtitle}
            </ThemedText>
          )}
          {description && (
            <ThemedText
              lightColor="#666666"
              darkColor="#cccccc"
              type="default"
              style={styles.description}>
              {description}
            </ThemedText>
          )}
        </View>

        {children && <View style={styles.childrenContainer}>{children}</View>}
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        {!hideMainButton && (
          <Button onPress={handleButtonPress} style={styles.button} className="w-full">
            <ThemedText lightColor="#ffffff" darkColor="#ffffff" style={styles.buttonText}>
              {buttonText}
            </ThemedText>
          </Button>
        )}
        {showSkip && onSkip && (
          <Button variant="ghost" onPress={handleSkipPress} style={styles.skipButton}>
            <ThemedText lightColor="#9ca3af" darkColor="#6b7280" style={styles.skipButtonText}>
              Skip
            </ThemedText>
          </Button>
        )}
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  progressContainer: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  progressBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  backButton: {
    paddingHorizontal: 0,
    alignSelf: 'flex-start',
  },
  skipButton: {
    paddingHorizontal: 0,
    opacity: 0.5,
  },
  skipButtonText: {
    // Remove color: '#9ca3af' - handled by ThemedText
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 40,
  },
  subtitle: {
    fontSize: 20,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 28,
    opacity: 0.9,
  },
  description: {
    marginTop: 16,
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    opacity: 0.7,
    maxWidth: screenWidth * 0.8,
  },
  childrenContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  footer: {
    paddingTop: 20,
  },
  button: {
    height: 56,
    borderRadius: 12,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '600',
    // Remove color: 'white' - handled by ThemedText
  },
});
