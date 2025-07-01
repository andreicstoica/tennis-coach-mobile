import { useTRPC } from '@/lib/trpc/trpc';
import { useQuery } from '@tanstack/react-query';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useRef } from 'react';
import { ActivityIndicator, FlatList, TouchableOpacity, View } from 'react-native';
import { ThemedText } from '~/components/ThemedText';
import { ThemedView } from '~/components/ThemedView';
import { useColorScheme } from '~/hooks/useColorScheme';

export default function PracticeSession() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const trpc = useTRPC();
  const flatListRef = useRef<FlatList>(null);
  const { colorScheme } = useColorScheme();

  const {
    data: chat,
    isLoading,
    error,
  } = useQuery({
    ...trpc.chats.get.queryOptions({ chatId: id as string }),
    enabled: !!id,
    retry: 1, // Limit retries for debugging
  });

  // Add this log to inspect the raw chat data
  console.log('TRPC chat response:', chat?.name);
  console.log('Chat page id param:', id);

  // messages is an array of { id, role, content, ... }
  const messages = useMemo(() => chat?.messages ?? [], [chat?.messages]);

  useEffect(() => {
    if (messages.length > 0) {
      flatListRef.current?.scrollToEnd({ animated: true });
    }
  }, [messages]);

  if (isLoading) {
    return (
      <ThemedView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#2563eb" />
        <ThemedText style={{ marginTop: 16 }}>Loading chat...</ThemedText>
      </ThemedView>
    );
  }

  if (error || !chat) {
    return (
      <ThemedView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 }}>
        <ThemedText style={{ textAlign: 'center', color: '#ef4444', marginBottom: 24 }}>
          {error ? `Error loading chat: ${error.message}` : 'Chat not found'}
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

  return (
    <ThemedView style={{ flex: 1, padding: 16 }}>
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id?.toString() ?? Math.random().toString()}
        renderItem={({ item }) => (
          <View
            style={{
              alignSelf: item.role === 'user' ? 'flex-end' : 'flex-start',
              backgroundColor:
                item.role === 'user' ? (colorScheme === 'dark' ? '#f3f4f6' : '#000000') : '#374151',
              borderRadius: 12,
              marginVertical: 4,
              padding: 10,
              maxWidth: '80%',
            }}>
            <ThemedText
              style={{
                color:
                  item.role === 'user'
                    ? colorScheme === 'dark'
                      ? '#000000'
                      : '#ffffff'
                    : '#ffffff',
              }}>
              {item.content}
            </ThemedText>
          </View>
        )}
        contentContainerStyle={{ paddingBottom: 16 }}
        showsVerticalScrollIndicator={false}
      />
    </ThemedView>
  );
}
