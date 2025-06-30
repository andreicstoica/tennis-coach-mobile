import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import * as Haptics from 'expo-haptics';
import { Alert, StyleSheet, TouchableOpacity } from 'react-native';

export default function PreviousScreen() {
  const handleCardPress = (session: any) => {
    // Trigger haptic feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // TODO: Navigate to stored chat in DB
    Alert.alert('Session Details', `Loading session from ${session.date}...`);
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

      {/* Sample data - replace with actual data later */}
      {[
        {
          date: '2024-01-15',
          focus: 'Tennis Serve',
          summary:
            'Worked on improving serve accuracy and power. Focused on proper grip and follow-through technique.',
        },
        {
          date: '2024-01-12',
          focus: 'Backhand',
          summary:
            'Practiced backhand consistency and placement. Drilled cross-court backhands for 30 minutes.',
        },
        {
          date: '2024-01-10',
          focus: 'Footwork',
          summary:
            'Agility drills and court movement exercises. Worked on quick directional changes and positioning.',
        },
        {
          date: '2024-01-08',
          focus: 'Volley',
          summary:
            'Net play practice with emphasis on soft hands and proper positioning. Mixed in some overhead practice.',
        },
      ].map((session, index) => (
        <TouchableOpacity
          key={index}
          style={[styles.card, index % 2 === 0 ? styles.cardEven : styles.cardOdd]}
          onPress={() => handleCardPress(session)}
          activeOpacity={0.7}>
          <ThemedView style={styles.cardHeader}>
            <ThemedText type="defaultSemiBold" style={styles.date}>
              {new Date(session.date).toLocaleDateString()}
            </ThemedText>
            <ThemedView
              style={[styles.focusBadge, { backgroundColor: getFocusBadgeColor(session.focus) }]}>
              <ThemedText style={styles.focusText}>{session.focus}</ThemedText>
            </ThemedView>
          </ThemedView>
          <ThemedText style={styles.summary} numberOfLines={2}>
            {session.summary}
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
});
