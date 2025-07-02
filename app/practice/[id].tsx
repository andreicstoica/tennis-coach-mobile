import { useQuery } from '@tanstack/react-query';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemedText } from '~/components/ThemedText';
import { ThemedView } from '~/components/ThemedView';
import { useColorScheme } from '~/hooks/useColorScheme';
import { useAuth } from '~/lib/auth-context';
import { useTRPC } from '~/lib/trpc/trpc';

interface ChatMessage {
  id: string;
  role: string;
  content: string;
  createdAt: string;
}

interface Chat {
  id: string;
  userId: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  messages: ChatMessage[];
}

export default function PracticeSession() {
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const { user, isLoading: authLoading } = useAuth();
  const insets = useSafeAreaInsets();
  const trpc = useTRPC();

  // Get the chatId from the route parameters
  const { id: chatId } = useLocalSearchParams<{ id: string }>();

  // Fetch the chat data using tRPC
  const {
    data: chat,
    isLoading,
    error,
  } = useQuery({
    ...trpc.chat.get.queryOptions({ chatId: chatId || '' }),
    enabled: !!user && !!chatId, // Only run query if user exists and chatId is provided
    retry: false,
  });

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

  if (isLoading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colorScheme === 'dark' ? '#ffffff' : '#000000'} />
        <ThemedText style={styles.loadingText}>Loading chat...</ThemedText>
      </ThemedView>
    );
  }

  if (error) {
    return (
      <ThemedView style={styles.errorContainer}>
        <ThemedText style={styles.errorText}>Error loading chat: {error.message}</ThemedText>
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

  if (!chat) {
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
          <ThemedText style={styles.chatTitle}>{chat.name}</ThemedText>
        </ThemedView>

        {/* Messages */}
        <ScrollView style={styles.messagesContainer} contentContainerStyle={styles.messagesContent}>
          {chat.messages && chat.messages.length > 0 ? (
            chat.messages.map((message: ChatMessage, index: number) => (
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
