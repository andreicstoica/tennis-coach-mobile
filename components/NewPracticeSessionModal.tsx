import React from 'react';
import { ActivityIndicator, Modal, View } from 'react-native';
import { ThemedText } from './ThemedText';
import { Button } from './ui/button';
import { Input } from './ui/input';

interface NewPracticeSessionModalProps {
  visible: boolean;
  loading: boolean;
  error: string;
  focus: string;
  setFocus: (v: string) => void;
  onClose: () => void;
  onCreate: () => void;
}

export default function NewPracticeSessionModal({
  visible,
  loading,
  error,
  focus,
  setFocus,
  onClose,
  onCreate,
}: NewPracticeSessionModalProps) {
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
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
          <ThemedText type="title" style={{ marginBottom: 12 }}>
            New Practice Session
          </ThemedText>
          <Input
            placeholder="What do you want to focus on today?"
            value={focus}
            onChangeText={setFocus}
            editable={!loading}
            autoFocus
            style={{ marginBottom: 12 }}
          />
          {error ? (
            <ThemedText style={{ color: 'red', marginBottom: 8 }}>{error}</ThemedText>
          ) : null}
          <Button onPress={onCreate} disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <ThemedText style={{ color: 'white' }}>Create</ThemedText>
            )}
          </Button>
          <Button variant="outline" onPress={onClose} style={{ marginTop: 8 }} disabled={loading}>
            <ThemedText>Cancel</ThemedText>
          </Button>
        </View>
      </View>
    </Modal>
  );
}
