import { useColorScheme } from '@/hooks/useColorScheme';
import { Image } from 'expo-image';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { OnboardingScreen } from '../OnboardingScreen';
import { ThemedText } from '../ThemedText';

interface BadgeTeaserScreenProps {
  onNext: () => void;
  onBack: () => void;
  currentStep?: number;
  totalSteps?: number;
}

export function BadgeTeaserScreen({
  onNext,
  onBack,
  currentStep,
  totalSteps,
}: BadgeTeaserScreenProps) {
  const { colorScheme } = useColorScheme();

  return (
    <OnboardingScreen
      title="Collect Badges for NYC's Top Courts!"
      description="Practice and unlock badges for iconic courts like Central Park."
      buttonText="Show Me How"
      onButtonPress={onNext}
      showBack={true}
      onBack={onBack}
      showSkip={false}
      currentStep={currentStep}
      totalSteps={totalSteps}>
      <View style={styles.badgeContainer}>
        <View style={styles.badgeCard}>
          <Image
            source={require('../../assets/images/badges/central-park.png')}
            style={styles.badgeImage}
            contentFit="contain"
          />
          <ThemedText style={styles.badgeName}>Central Park</ThemedText>
          <ThemedText style={styles.badgeDescription}>Your first badge awaits!</ThemedText>
        </View>
      </View>
    </OnboardingScreen>
  );
}

const styles = StyleSheet.create({
  badgeContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginTop: 40,
  },
  badgeCard: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    minWidth: 200,
  },
  badgeImage: {
    width: 120,
    height: 120,
    marginBottom: 16,
  },
  badgeName: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  badgeDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
