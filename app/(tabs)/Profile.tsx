import { ThemedText } from '@/components/ThemedText';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth-context';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const insets = useSafeAreaInsets();

  // Fallbacks in case user data is missing
  const username = user?.name || 'Unknown';
  const email = user?.email || 'Unknown';
  // Use createdAt or a fallback date
  const memberSince = user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown';

  return (
    <ScrollView
      contentContainerStyle={[
        styles.container,
        {
          paddingTop: insets.top + 16,
          paddingBottom: insets.bottom + 32,
        },
      ]}>
      <ThemedText style={styles.header} type="title">
        Profile
      </ThemedText>
      <ThemedText style={styles.subheader}>View details about your profile here.</ThemedText>
      <View style={styles.section}>
        <ThemedText style={styles.label}>Username</ThemedText>
        <ThemedText style={styles.value}>{username}</ThemedText>
      </View>
      <View style={styles.section}>
        <ThemedText style={styles.label}>Email</ThemedText>
        <ThemedText style={styles.value}>{email}</ThemedText>
      </View>
      <View style={styles.section}>
        <ThemedText style={styles.label}>Member Since</ThemedText>
        <ThemedText style={styles.value}>{memberSince}</ThemedText>
      </View>
      <View style={styles.spacer} />
      <Button variant="destructive" size="lg" style={styles.signOutButton} onPress={signOut}>
        <ThemedText style={styles.signOutText}>Sign Out</ThemedText>
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingHorizontal: 24,
    backgroundColor: '#fff',
    alignItems: 'flex-start',
  },
  header: {
    fontWeight: 'bold',
    fontSize: 26,
    marginBottom: 4,
  },
  subheader: {
    color: '#888',
    fontSize: 16,
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 4,
  },
  value: {
    fontSize: 18,
    marginBottom: 4,
  },
  spacer: {
    flex: 1,
  },
  signOutButton: {
    width: '100%',
    marginTop: 4,
    marginBottom: 36,
    alignSelf: 'center',
  },
  signOutText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
    textAlign: 'center',
    width: '100%',
  },
});
