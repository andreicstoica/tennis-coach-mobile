import { useColorScheme } from '@/hooks/useColorScheme';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { OnboardingScreen } from '../OnboardingScreen';
import { ThemedText } from '../ThemedText';

interface FinalWelcomeScreenProps {
  onStart: () => void;
}

export function FinalWelcomeScreen({ onStart }: FinalWelcomeScreenProps) {
  const { colorScheme } = useColorScheme();

  return (
    <OnboardingScreen
      title="All Set!"
      description="Let's hit the court and start your personalized practice sessions."
      buttonText="Start Practicing"
      onButtonPress={onStart}
      showSkip={false}>
      <View style={styles.celebrationContainer}>
        <View
          style={[
            styles.celebrationIcon,
            { backgroundColor: colorScheme === 'dark' ? '#10b981' : '#059669' },
          ]}>
          <ThemedText style={styles.celebrationIconText}>🎉</ThemedText>
        </View>
      </View>
    </OnboardingScreen>
  );
}

const styles = StyleSheet.create({
  celebrationContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  celebrationIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  celebrationIconText: {
    fontSize: 40,
  },
});
