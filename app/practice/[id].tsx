import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, View } from 'react-native';
import { ThemedText } from '~/components/ThemedText';
import { ThemedView } from '~/components/ThemedView';

// stub for fetching previous chat, replace with real API call
async function fetchPreviousChat(sessionId: string) {
  await new Promise((r) => setTimeout(r, 600));
  return [
    { role: 'ai', content: 'Welcome back! Ready to continue your practice?' },
    { role: 'user', content: "Yes, let's go." },
    { role: 'ai', content: 'Great! What would you like to focus on today?' },
  ];
}

export default function PracticeSession() {
  const { id } = useLocalSearchParams();
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    let mounted = true;
    fetchPreviousChat(id as string).then((msgs) => {
      if (mounted) setMessages(msgs);
      setLoading(false);
    });
    return () => {
      mounted = false;
    };
  }, [id]);

  useEffect(() => {
    if (messages.length > 0) {
      flatListRef.current?.scrollToEnd({ animated: true });
    }
  }, [messages]);

  return (
    <ThemedView style={{ flex: 1, padding: 16 }}>
      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#2563eb" />
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
