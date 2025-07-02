import { useAuth } from '@/lib/auth-context';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export function DebugAuth() {
  const { user, isLoading, signOut, clearStorage } = useAuth();

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Debug Auth State:</Text>
      <Text style={styles.text}>Loading: {isLoading ? 'Yes' : 'No'}</Text>
      <Text style={styles.text}>User: {user ? user.email : 'None'}</Text>
      <TouchableOpacity style={styles.button} onPress={signOut}>
        <Text style={styles.buttonText}>Force Sign Out</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.button, { backgroundColor: 'orange' }]}
        onPress={clearStorage}>
        <Text style={styles.buttonText}>Clear Storage</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.8)',
    padding: 10,
    borderRadius: 8,
    zIndex: 1000,
  },
  text: {
    color: 'white',
    fontSize: 12,
  },
  button: {
    backgroundColor: 'red',
    padding: 5,
    borderRadius: 4,
    marginTop: 5,
  },
  buttonText: {
    color: 'white',
    fontSize: 10,
  },
});
