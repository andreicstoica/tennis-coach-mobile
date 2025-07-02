import { useColorScheme } from '@/hooks/useColorScheme';
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

  const badges = [
    { icon: '🏆', name: 'Central Park', color: '#10b981' },
    { icon: '🏅', name: 'Prospect Park', color: '#3b82f6' },
    { icon: '🥇', name: 'Riverside Park', color: '#f59e0b' },
  ];

  return (
    <OnboardingScreen
      title="Collect Badges for NYC's Top Tennis Courts!"
      description="Play, practice, and unlock badges for iconic courts like Central Park and Prospect Park."
      buttonText="Show Me How"
      onButtonPress={onNext}
      showBack={true}
      onBack={onBack}
      showSkip={false}
      currentStep={currentStep}
      totalSteps={totalSteps}>
      <View style={styles.badgesContainer}>
        {badges.map((badge, index) => (
          <View key={index} style={styles.badgeItem}>
            <View style={[styles.badgeIcon, { backgroundColor: badge.color }]}>
              <ThemedText style={styles.badgeIconText}>{badge.icon}</ThemedText>
            </View>
            <ThemedText style={styles.badgeName}>{badge.name}</ThemedText>
          </View>
        ))}
      </View>
    </OnboardingScreen>
  );
}

const styles = StyleSheet.create({
  badgesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 20,
  },
  badgeItem: {
    alignItems: 'center',
    gap: 8,
  },
  badgeIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  badgeIconText: {
    fontSize: 24,
  },
  badgeName: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
});
