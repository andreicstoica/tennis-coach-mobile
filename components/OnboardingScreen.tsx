import { useColorScheme } from '@/hooks/useColorScheme';
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

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        {showBack && onBack && (
          <Button variant="ghost" onPress={onBack} style={styles.backButton}>
            <ThemedText>← Back</ThemedText>
          </Button>
        )}
      </View>

      {/* Content */}
      <View style={styles.content}>
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
        <View style={styles.textContainer}>
          <ThemedText type="title" style={styles.title}>
            {title}
          </ThemedText>
          {subtitle && (
            <ThemedText type="defaultSemiBold" style={styles.subtitle}>
              {subtitle}
            </ThemedText>
          )}
          {description && (
            <ThemedText type="default" style={styles.description}>
              {description}
            </ThemedText>
          )}
        </View>

        {children && <View style={styles.childrenContainer}>{children}</View>}
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        {!hideMainButton && (
          <Button onPress={onButtonPress} style={styles.button} className="w-full">
            <ThemedText style={styles.buttonText}>{buttonText}</ThemedText>
          </Button>
        )}
        {showSkip && onSkip && (
          <Button variant="ghost" onPress={onSkip} style={styles.skipButton}>
            <ThemedText style={styles.skipButtonText}>Skip</ThemedText>
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
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginBottom: 40,
  },
  backButton: {
    paddingHorizontal: 0,
  },
  skipButton: {
    paddingHorizontal: 0,
    opacity: 0.5,
  },
  skipButtonText: {
    color: '#9ca3af',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  progressContainer: {
    alignItems: 'center',
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
    color: 'white',
  },
});
