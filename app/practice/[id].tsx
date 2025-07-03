import { ThemedText } from '~/components/ThemedText';
import { ThemedView } from '~/components/ThemedView';
import { useColorScheme } from '~/hooks/useColorScheme';

import { ActivityIndicator, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { useQuery } from '@tanstack/react-query';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import z from 'zod';

import { authClient } from '~/lib/auth-client';
import { useAuth } from '~/lib/auth-context';
import { useTRPC } from '~/lib/trpc/trpc';

const ChatMessageSchema = z.object({
  id: z.string(),
  role: z.string(),
  content: z.string(),
  createdAt: z.string(),
});

const ChatSchema = z.object({
  id: z.string(),
  userId: z.string(),
  name: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  messages: z.array(ChatMessageSchema),
});

export default function PracticeSession() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const trpc = useTRPC();
  const { colorScheme } = useColorScheme();

  const insets = useSafeAreaInsets();

  // Get the chatId from the route parameters
  const { id: chatId } = useLocalSearchParams<{ id: string }>();

  const isChatIdValid = typeof chatId === 'string' && chatId.length > 0;
  const queryEnabled = !!user && isChatIdValid;
  console.log('Cookie:', authClient.getCookie());

  console.log(
    'chatId:',
    chatId,
    'isChatIdValid:',
    isChatIdValid,
    'user:',
    user,
    'queryEnabled:',
    queryEnabled
  );

  console.log('Query options:', trpc.chat.get.queryOptions({ chatId }));

  // Fetch the chat data using tRPC
  const { data: chat } = useQuery({
    queryKey: ['chat', 'get', { chatId }],
    queryFn: async () => {
      // Use the exact same format as your working curl command
      const inputJson = JSON.stringify({ json: { chatId } });
      const url = `https://courtly-xi.vercel.app/api/trpc/chat.get?input=${inputJson}`;

      console.log('Manual fetch URL:', url);

      const cookies = authClient.getCookie();
      const headers: Record<string, string> = {};
      if (cookies) {
        headers.Cookie = cookies;
      }

      const response = await fetch(url, { headers });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Manual fetch error:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      return data.result?.data || data;
    },
    enabled: queryEnabled,
    retry: false,
  });

  const parsedResult = chat?.json ? ChatSchema.safeParse(chat.json) : null;

  if (!parsedResult?.success) {
    console.log('Validation errors:', parsedResult?.error?.issues);
    return (
      <ThemedView style={styles.errorContainer}>
        <ThemedText style={styles.errorText}>Invalid chat data.</ThemedText>
        <TouchableOpacity
          onPress={() => router.back()}
          style={[
            styles.button,
            { backgroundColor: colorScheme === 'dark' ? '#3b82f6' : '#2563eb' },
          ]}>
          <ThemedText style={styles.buttonText}>Go Back</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    );
  }
  const parsedChat = parsedResult.data;

  if (authLoading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colorScheme === 'dark' ? '#ffffff' : '#000000'} />
        <ThemedText style={styles.loadingText}>Loading...</ThemedText>
      </ThemedView>
    );
  }

  if (!user) {
    return (
      <ThemedView style={styles.errorContainer}>
        <ThemedText style={styles.errorText}>Please sign in to view this chat.</ThemedText>
        <TouchableOpacity
          onPress={() => router.back()}
          style={[
            styles.button,
            { backgroundColor: colorScheme === 'dark' ? '#3b82f6' : '#2563eb' },
          ]}>
          <ThemedText style={styles.buttonText}>Go Back</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    );
  }

  // if (isLoading) {
  //   return (
  //     <ThemedView style={styles.loadingContainer}>
  //       <ActivityIndicator size="large" color={colorScheme === 'dark' ? '#ffffff' : '#000000'} />
  //       <ThemedText style={styles.loadingText}>Loading chat...</ThemedText>
  //     </ThemedView>
  //   );
  // }

  // if (error) {
  //   return (
  //     <ThemedView style={styles.errorContainer}>
  //       <ThemedText style={styles.errorText}>Error loading chat: {error.message}</ThemedText>
  //       <TouchableOpacity
  //         onPress={() => router.back()}
  //         style={[
  //           styles.button,
  //           { backgroundColor: colorScheme === 'dark' ? '#3b82f6' : '#2563eb' },
  //         ]}>
  //         <ThemedText style={styles.buttonText}>Go Back</ThemedText>
  //       </TouchableOpacity>
  //     </ThemedView>
  //   );
  // }

  if (!parsedChat) {
    return (
      <ThemedView style={styles.errorContainer}>
        <ThemedText style={styles.errorText}>Chat not found.</ThemedText>
        <TouchableOpacity
          onPress={() => router.back()}
          style={[
            styles.button,
            { backgroundColor: colorScheme === 'dark' ? '#3b82f6' : '#2563eb' },
          ]}>
          <ThemedText style={styles.buttonText}>Go Back</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['bottom']}>
      <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
        {/* Header */}
        <ThemedView style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ThemedText style={styles.backButtonText}>← Back</ThemedText>
          </TouchableOpacity>
          <ThemedText style={styles.chatTitle}>{parsedChat.name}</ThemedText>
        </ThemedView>

        {/* Messages */}
        <ScrollView style={styles.messagesContainer} contentContainerStyle={styles.messagesContent}>
          {parsedChat.messages && parsedChat.messages.length > 0 ? (
            parsedChat.messages.map((message: typeof ChatMessageSchema._type, index: number) => (
              <ThemedView
                key={message.id || index}
                style={[
                  styles.messageContainer,
                  message.role === 'user' ? styles.userMessage : styles.assistantMessage,
                ]}>
                <ThemedText style={styles.messageRole}>
                  {message.role === 'user' ? 'You' : 'Coach'}
                </ThemedText>
                <ThemedText style={styles.messageContent}>{message.content}</ThemedText>
                <ThemedText style={styles.messageTime}>
                  {new Date(message.createdAt).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </ThemedText>
              </ThemedView>
            ))
          ) : (
            <ThemedView style={styles.emptyContainer}>
              <ThemedText style={styles.emptyText}>No messages in this chat yet.</ThemedText>
            </ThemedView>
          )}
        </ScrollView>
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    opacity: 0.7,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  errorText: {
    textAlign: 'center',
    color: '#ef4444',
    marginBottom: 24,
    fontSize: 16,
  },
  button: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  backButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
  chatTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    marginRight: 40, // Compensate for back button width
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
  },
  messageContainer: {
    marginBottom: 16,
    padding: 12,
    borderRadius: 12,
    maxWidth: '85%',
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#007AFF',
  },
  assistantMessage: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  messageRole: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
    opacity: 0.8,
  },
  messageContent: {
    fontSize: 16,
    lineHeight: 22,
  },
  messageTime: {
    fontSize: 11,
    opacity: 0.6,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    opacity: 0.7,
    textAlign: 'center',
  },
});
