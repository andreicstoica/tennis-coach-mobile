import { useTRPC } from '@/lib/trpc/trpc';
import { useQuery } from '@tanstack/react-query';
import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, View } from 'react-native';
import { ThemedText } from '~/components/ThemedText';
import { ThemedView } from '~/components/ThemedView';

export default function PracticeSession() {
  const { id } = useLocalSearchParams();
  const trpc = useTRPC();
  const flatListRef = useRef<FlatList>(null);

  // Fetch the practice session by chat ID
  const {
    data: session,
    isLoading: sessionLoading,
    error: sessionError,
  } = useQuery({
    ...trpc.practiceSession.getByChatId.queryOptions({ chatId: id as string }),
    enabled: !!id,
  });

  // For now, we'll use mock chat messages since the actual chat API isn't implemented yet
  const [messages, setMessages] = useState<any[]>([]);
  const [chatLoading, setChatLoading] = useState(true);

  useEffect(() => {
    if (session) {
      // Mock chat messages - replace this with actual chat API call
      const mockMessages = [
        {
          role: 'ai',
          content: `Welcome back! Ready to continue your ${session.focusArea} practice?`,
        },
        { role: 'user', content: "Yes, let's go." },
        { role: 'ai', content: "Great! Here's your practice plan:" },
        { role: 'ai', content: session.plan || 'No plan available for this session.' },
      ];
      setMessages(mockMessages);
      setChatLoading(false);
    }
  }, [session]);

  useEffect(() => {
    if (messages.length > 0) {
      flatListRef.current?.scrollToEnd({ animated: true });
    }
  }, [messages]);

  if (sessionLoading) {
    return (
      <ThemedView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#2563eb" />
        <ThemedText style={{ marginTop: 16 }}>Loading session...</ThemedText>
      </ThemedView>
    );
  }

  if (sessionError) {
    return (
      <ThemedView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 }}>
        <ThemedText style={{ textAlign: 'center', color: '#ef4444' }}>
          Error loading session: {sessionError.message}
        </ThemedText>
      </ThemedView>
    );
  }

  if (!session) {
    return (
      <ThemedView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 }}>
        <ThemedText style={{ textAlign: 'center' }}>Session not found</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={{ flex: 1, padding: 16 }}>
      {/* Session Header */}
      <ThemedView
        style={{
          padding: 16,
          marginBottom: 16,
          borderRadius: 12,
          backgroundColor: 'rgba(37, 99, 235, 0.1)',
          borderWidth: 1,
          borderColor: 'rgba(37, 99, 235, 0.2)',
        }}>
        <ThemedText style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 8 }}>
          {session.focusArea.charAt(0).toUpperCase() + session.focusArea.slice(1)} Practice
        </ThemedText>
        <ThemedText style={{ opacity: 0.7 }}>
          {new Date(session.createdAt).toLocaleDateString()}
        </ThemedText>
      </ThemedView>

      {chatLoading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#2563eb" />
          <ThemedText style={{ marginTop: 16 }}>Loading chat...</ThemedText>
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(_, i) => i.toString()}
          renderItem={({ item }) => (
            <View
              style={{
                alignSelf: item.role === 'user' ? 'flex-end' : 'flex-start',
                backgroundColor: item.role === 'user' ? '#2563eb' : '#374151',
                borderRadius: 12,
                marginVertical: 4,
                padding: 10,
                maxWidth: '80%',
              }}>
              <ThemedText style={{ color: '#fff' }}>{item.content}</ThemedText>
            </View>
          )}
          contentContainerStyle={{ paddingBottom: 16 }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </ThemedView>
  );
}
