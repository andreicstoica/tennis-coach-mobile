import { useTRPC } from '@/lib/trpc/trpc';
import { useMutation } from '@tanstack/react-query';
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

  const trpc = useTRPC();
  const router = useRouter();

  const createPracticeSessionMutation = useMutation(trpc.practiceSession.create.mutationOptions());
  const createChatMutation = useMutation(trpc.chat.create.mutationOptions());

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
      // Step 1: Create practice session
      console.log('Creating practice session with focus:', focus);
      const newPracticeSession = await createPracticeSessionMutation.mutateAsync({
        focus: focus.trim(),
      });

      if (!newPracticeSession || !Array.isArray(newPracticeSession) || !newPracticeSession[0]?.id) {
        throw new Error('Failed to create practice session');
      }

      const practiceSessionId = newPracticeSession[0].id;
      console.log('Practice session created with ID:', practiceSessionId);

      // Step 2: Create chat for the practice session
      console.log('Creating chat for practice session:', practiceSessionId);
      const chatId = await createChatMutation.mutateAsync({
        practiceSessionId,
      });

      if (!chatId) {
        throw new Error('Failed to create chat');
      }

      console.log('Chat created with ID:', chatId);

      // Step 3: Navigate to chat and close modal
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // Close modal first
      onClose();

      // Clear form state
      setFocus('');
      setError('');

      // Navigate to chat
      router.push(`/practice/${chatId}`);
    } catch (err) {
      console.error('Error in practice session creation flow:', err);
      const error = err as Error;

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

      // Provide user-friendly error messages
      if (error.message.includes('network') || error.message.includes('fetch')) {
        setError('Unable to connect. Please check your internet connection and try again.');
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
            placeholder="What do you want to focus on today?"
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
