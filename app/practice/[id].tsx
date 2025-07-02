import { useRouter } from 'expo-router';
import React from 'react';
import { TouchableOpacity } from 'react-native';
import { ThemedText } from '~/components/ThemedText';
import { ThemedView } from '~/components/ThemedView';
import { useColorScheme } from '~/hooks/useColorScheme';

export default function PracticeSession() {
  const router = useRouter();
  const { colorScheme } = useColorScheme();

  return (
    <ThemedView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 }}>
      <ThemedText style={{ textAlign: 'center', color: '#ef4444', marginBottom: 24 }}>
        Chat feature is temporarily unavailable.
      </ThemedText>
      <TouchableOpacity
        onPress={() => router.back()}
        style={{
          backgroundColor: colorScheme === 'dark' ? '#3b82f6' : '#2563eb',
          paddingHorizontal: 24,
          paddingVertical: 12,
          borderRadius: 8,
        }}>
        <ThemedText style={{ color: '#ffffff', fontWeight: '600' }}>Go Back</ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
}
