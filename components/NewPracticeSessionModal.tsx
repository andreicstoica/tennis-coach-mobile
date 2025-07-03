import { authClient } from '@/lib/auth-client';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React from 'react';
import { ActivityIndicator, Modal, View } from 'react-native';
import { ThemedText } from './ThemedText';
import { Button } from './ui/button';
import { Input } from './ui/input';

interface NewPracticeSessionModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function NewPracticeSessionModal({
  visible,
  onClose,
}: NewPracticeSessionModalProps) {
  const [focus, setFocus] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  const router = useRouter();

  const handleCreate = async () => {
    // Input validation
    if (!focus.trim()) {
      setError('Please enter a focus area (minimum 3 characters)');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    if (focus.trim().length < 3) {
      setError('Focus area must be at least 3 characters');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Step 1: Create practice session using exact format from [id].tsx
      console.log('🚀 Creating practice session with focus:', focus);

      const inputData = { json: { focus: focus.trim() } };
      const url = `https://courtly-xi.vercel.app/api/trpc/practiceSession.create`;

      console.log('🔗 Practice session URL:', url);
      console.log('📦 Practice session input:', inputData);

      const cookies = authClient.getCookie();
      console.log('🍪 Cookies:', cookies ? 'Present' : 'Missing');

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (cookies) {
        headers.Cookie = cookies;
      }

      console.log('📋 Headers:', headers);

      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(inputData),
      });

      console.log('📊 Practice session response status:', response.status);
      console.log('📊 Practice session response ok:', response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Practice session creation error:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log('📋 Practice session response data:', data);

      // Fix the parsing logic to match the actual response structure
      const newPracticeSession = data.result?.data?.json || data.result?.data || data;
      console.log('✅ Parsed practice session:', newPracticeSession);

      if (!newPracticeSession || !Array.isArray(newPracticeSession) || !newPracticeSession[0]?.id) {
        console.error('❌ Invalid practice session format:', newPracticeSession);
        throw new Error('Failed to create practice session');
      }

      const practiceSessionId = newPracticeSession[0].id;
      console.log('🎯 Practice session created with ID:', practiceSessionId);

      // Step 2: Create chat for the practice session using exact format from [id].tsx
      console.log('💬 Creating chat for practice session:', practiceSessionId);

      const chatInputData = { json: { practiceSessionId } };
      const chatUrl = `https://courtly-xi.vercel.app/api/trpc/chat.create`;

      console.log('🔗 Chat URL:', chatUrl);
      console.log('📦 Chat input:', chatInputData);

      const chatResponse = await fetch(chatUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(chatInputData),
      });

      console.log('📊 Chat response status:', chatResponse.status);
      console.log('📊 Chat response ok:', chatResponse.ok);

      if (!chatResponse.ok) {
        const errorText = await chatResponse.text();
        console.error('❌ Chat creation error:', errorText);
        throw new Error(`HTTP ${chatResponse.status}: ${errorText}`);
      }

      const chatData = await chatResponse.json();
      console.log('📋 Chat response data:', chatData);

      // Fix the parsing logic to match the actual response structure
      const chatId = chatData.result?.data?.json || chatData.result?.data || chatData;
      console.log('✅ Parsed chat ID:', chatId);

      if (!chatId) {
        console.error('❌ Invalid chat format:', chatData);
        throw new Error('Failed to create chat');
      }

      console.log('🎉 Chat created with ID:', chatId);

      // Step 3: Navigate to chat and close modal
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // Close modal first
      onClose();

      // Clear form state
      setFocus('');
      setError('');

      // Navigate to chat
      console.log('🧭 Navigating to chat:', `/practice/${chatId}`);
      router.push(`/practice/${chatId}`);
    } catch (err) {
      console.error('💥 Error in practice session creation flow:', err);
      const error = err as Error;

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

      // Provide user-friendly error messages
      if (error.message.includes('network') || error.message.includes('fetch')) {
        setError('Unable to connect. Please check your internet connection and try again.');
      } else if (error.message.includes('HTTP 4')) {
        setError('Authentication error. Please sign in again.');
      } else if (error.message.includes('practice session')) {
        setError('Failed to create practice session. Please try again.');
      } else if (error.message.includes('chat')) {
        setError('Practice session created but failed to create chat. Please try again.');
      } else {
        setError(error.message || 'Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (loading) return; // Prevent closing during API calls

    // Clear form state when closing
    setFocus('');
    setError('');
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={handleClose}>
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'rgba(0,0,0,0.3)',
        }}>
        <View
          style={{
            backgroundColor: '#fff',
            padding: 24,
            borderRadius: 12,
            width: 320,
            maxWidth: '90%',
          }}>
          <ThemedText type="subtitle" style={{ marginBottom: 12 }}>
            New Practice Session
          </ThemedText>

          <Input
            placeholder="What's the focus?"
            value={focus}
            onChangeText={setFocus}
            editable={!loading}
            autoFocus
            style={{ marginBottom: 12 }}
            maxLength={200}
          />

          {error ? (
            <ThemedText style={{ color: 'red', marginBottom: 12, fontSize: 14 }}>
              {error}
            </ThemedText>
          ) : null}

          <Button onPress={handleCreate} disabled={loading || !focus.trim()}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <ThemedText style={{ color: 'white' }}>Create</ThemedText>
            )}
          </Button>

          <Button
            variant="outline"
            onPress={handleClose}
            style={{ marginTop: 8 }}
            disabled={loading}>
            <ThemedText>Cancel</ThemedText>
          </Button>
        </View>
      </View>
    </Modal>
  );
}
