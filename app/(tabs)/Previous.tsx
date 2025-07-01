import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useAuth } from '@/lib/auth-context';
import { trpc } from '@/lib/trpc/client';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { StyleSheet, TouchableOpacity } from 'react-native';
import Toast from 'react-native-toast-message';

export default function PreviousScreen() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();

  // Only fetch practice sessions if user is authenticated
  const {
    data: sessions,
    isLoading,
    error,
  } = trpc.practiceSession.list.useQuery(undefined, {
    enabled: !!user, // Only run query if user exists
    retry: false,
  });

  console.log('=== PREVIOUS SCREEN DEBUG ===');
  console.log('Current user:', user?.email || 'Not authenticated');
  console.log('Auth loading:', authLoading);
  console.log('Practice sessions loading:', isLoading);
  console.log('Practice sessions error:', error?.message);
  console.log('Practice sessions data:', sessions?.length || 0, 'sessions');
  console.log('=== END DEBUG ===');

  if (authLoading) {
    return (
      <ThemedView style={styles.emptyContainer}>
        <ThemedText className="text-center text-lg font-bold">Loading...</ThemedText>
      </ThemedView>
    );
  }

  if (!user) {
    return (
      <ThemedView style={styles.emptyContainer}>
        <ThemedText style={styles.emptyText}>Please sign in to view your sessions.</ThemedText>
      </ThemedView>
    );
  }

  if (isLoading) {
    return (
      <ThemedView style={styles.emptyContainer}>
        <ThemedText className="text-center text-lg font-bold">Loading sessions...</ThemedText>
      </ThemedView>
    );
  }

  if (error) {
    return (
      <ThemedView style={styles.emptyContainer}>
        <ThemedText style={styles.emptyText}>Error loading sessions: {error.message}</ThemedText>
      </ThemedView>
    );
  }

  if (!sessions?.length) {
    return (
      <ThemedView style={styles.emptyContainer}>
        <ThemedText style={styles.emptyText}>No previous sessions found.</ThemedText>
      </ThemedView>
    );
  }

  const handleCardPress = (session: any) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (session.chatId && typeof session.chatId === 'string' && session.chatId.length > 0) {
      router.push(`/practice/${session.chatId}`);
    } else {
      Toast.show({
        type: 'error',
        text1: 'No chat found for this session.',
        text2: 'Please try again.',
        position: 'bottom',
        bottomOffset: 100,
        topOffset: 100,
        visibilityTime: 3000,
      });
    }
  };

  const getFocusBadgeColor = (focus: string) => {
    const colors = {
      'Tennis Serve': '#FF6B6B',
      Backhand: '#4ECDC4',
      Footwork: '#45B7D1',
      Volley: '#96CEB4',
      Forehand: '#FFEAA7',
      Strategy: '#DDA0DD',
    };
    return colors[focus as keyof typeof colors] || '#007AFF';
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#D0D0D0', dark: '#353636' }}
      headerImage={
        <IconSymbol
          size={310}
          color="#808080"
          name="calendar.day.timeline.leading"
          style={styles.headerImage}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Previous Sessions</ThemedText>
      </ThemedView>

      {sessions.map((session, index) => (
        <TouchableOpacity
          key={session.id}
          style={[styles.card, index % 2 === 0 ? styles.cardEven : styles.cardOdd]}
          onPress={() => handleCardPress(session)}
          activeOpacity={0.7}>
          <ThemedView style={styles.cardHeader}>
            <ThemedText type="defaultSemiBold" style={styles.date}>
              {session.createdAt?.toLocaleDateString()}
            </ThemedText>
            <ThemedView
              style={[
                styles.focusBadge,
                { backgroundColor: getFocusBadgeColor(session.focusArea) },
              ]}>
              <ThemedText style={styles.focusText}>{session.focusArea}</ThemedText>
            </ThemedView>
          </ThemedView>
          <ThemedText style={styles.summary} numberOfLines={2}>
            {session.plan}
          </ThemedText>
          <ThemedView style={styles.cardFooter}>
            <ThemedText style={styles.tapHint}>Tap to view details</ThemedText>
          </ThemedView>
        </TouchableOpacity>
      ))}
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    color: '#808080',
    bottom: -90,
    left: -35,
    position: 'absolute',
  },
  titleContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  card: {
    padding: 16,
    marginBottom: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  cardEven: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderLeftWidth: 4,
    borderLeftColor: '#4ECDC4',
  },
  cardOdd: {
    backgroundColor: 'rgba(248, 250, 252, 0.95)',
    borderLeftWidth: 4,
    borderLeftColor: '#FF6B6B',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  date: {
    fontSize: 16,
    opacity: 0.8,
    fontWeight: '600',
  },
  focusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  focusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  summary: {
    fontSize: 15,
    lineHeight: 22,
    opacity: 0.9,
    marginBottom: 8,
  },
  cardFooter: {
    alignItems: 'flex-end',
    marginTop: 4,
  },
  tapHint: {
    fontSize: 12,
    opacity: 0.6,
    fontStyle: 'italic',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    opacity: 0.7,
  },
});
