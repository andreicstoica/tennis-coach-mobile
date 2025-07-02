import React from 'react';
import { View } from 'react-native';
import { ThemedText } from './ThemedText';

interface PracticePlanViewProps {
  plan: { warmup?: string; drill?: string; minigame?: string };
}

export default function PracticePlanView({ plan }: PracticePlanViewProps) {
  return (
    <View style={{ marginTop: 32, width: '100%', maxWidth: 400 }}>
      <ThemedText type="title" style={{ marginBottom: 8 }}>
        Practice Plan
      </ThemedText>
      <ThemedText style={{ marginBottom: 4 }}>Warmup: {plan.warmup || '-'}</ThemedText>
      <ThemedText style={{ marginBottom: 4 }}>Drill: {plan.drill || '-'}</ThemedText>
      <ThemedText style={{ marginBottom: 4 }}>Minigame: {plan.minigame || '-'}</ThemedText>
    </View>
  );
}
