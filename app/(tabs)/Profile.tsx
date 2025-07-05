import Badge3D from '@/components/Badge3D';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Button } from '@/components/ui/button';
import { useColorScheme } from '@/hooks/useColorScheme';
import { authClient } from '@/lib/auth-client';
import { useAuth } from '@/lib/auth-context';
import { Image } from 'expo-image';
import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type CourtBadge = {
  courtName: string;
  timesVisited: number;
  firstUnlockedAt: string;
};

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const insets = useSafeAreaInsets();
  const { colorScheme } = useColorScheme();

  // Court badges state
  const [courtBadges, setCourtBadges] = useState<CourtBadge[]>([]);
  const [badgesLoading, setBadgesLoading] = useState(true);
  const [badgesError, setBadgesError] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedBadge, setSelectedBadge] = useState<CourtBadge | null>(null);
  const modalAnim = useRef(new Animated.Value(0)).current;

  // Fallbacks in case user data is missing
  const username = user?.name || 'Unknown';
  const email = user?.email || 'Unknown';
  // Use createdAt or a fallback date
  const memberSince = user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown';

  const getBadgeImage = (courtName: string) => {
    const imageMap: Record<string, any> = {
      'central-park': require('../../assets/images/badges/central-park.png'),
      'fort-greene': require('../../assets/images/badges/fort-greene.png'),
      'fractal-tech': require('../../assets/images/badges/fractal-tech.png'),
      'hudson-river': require('../../assets/images/badges/hudson-river.png'),
      'randalls-island': require('../../assets/images/badges/randalls-island.png'),
      riverside: require('../../assets/images/badges/riverside.png'),
      mccarren: require('../../assets/images/badges/mccarren.png'),
    };
    return imageMap[courtName];
  };

  const formatCourtName = (courtName: string): string => {
    const nameMap: Record<string, string> = {
      'central-park': 'Central Park',
      'fort-greene': 'Fort Greene',
      'fractal-tech': 'Fractal Tech',
      'hudson-river': 'Hudson River',
      'randalls-island': 'Randalls Island',
      riverside: 'Riverside',
      mccarren: 'McCarren',
      'prospect-park': 'Prospect Park',
    };
    return nameMap[courtName] || courtName;
  };

  const fetchCourtBadges = async () => {
    try {
      setBadgesLoading(true);
      setBadgesError(null);

      const url = `https://courtly-xi.vercel.app/api/trpc/courtBadges.getCourtBadges`;
      const cookies = authClient.getCookie();
      const headers: Record<string, string> = {};
      if (cookies) {
        headers.Cookie = cookies;
      }

      const response = await fetch(url, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        throw new Error('Failed to fetch court badges');
      }

      const data = await response.json();
      const badges = data.result?.data || data;
      // Extract the actual array from the json property
      const badgesArray = badges?.json || badges || [];
      setCourtBadges(badgesArray);
    } catch (error) {
      console.error('Error fetching court badges:', error);
      setBadgesError('Unable to load court badges. Please try again.');
    } finally {
      setBadgesLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchCourtBadges();
    }
  }, [user]);

  const openBadgeModal = (badge: CourtBadge) => {
    setSelectedBadge(badge);
    setModalVisible(true);
    // Animate in
    modalAnim.setValue(0);
    Animated.timing(modalAnim, {
      toValue: 1,
      duration: 220,
      useNativeDriver: true,
      easing: Easing.out(Easing.cubic),
    }).start();
  };

  const closeBadgeModal = () => {
    // Animate out, then close
    Animated.timing(modalAnim, {
      toValue: 0,
      duration: 180,
      useNativeDriver: true,
      easing: Easing.in(Easing.cubic),
    }).start(() => {
      setModalVisible(false);
      setSelectedBadge(null);
    });
  };

  const renderBadgeCard = (badge: CourtBadge) => {
    const badgeImage = getBadgeImage(badge.courtName);
    return (
      <Pressable
        key={badge.courtName}
        onPress={() => openBadgeModal(badge)}
        accessibilityRole="button"
        accessibilityLabel={`View details for ${formatCourtName(badge.courtName)} badge`}>
        <ThemedView
          lightColor="#f8f9fa"
          darkColor="#2a2a2a"
          style={[
            styles.badgeCard,
            {
              borderWidth: 1,
              borderColor: colorScheme === 'dark' ? '#444444' : '#e9ecef',
            },
          ]}>
          {badgeImage && (
            <Image source={badgeImage} style={styles.badgeImage} contentFit="contain" />
          )}
          <ThemedText lightColor="#000000" darkColor="#ffffff" style={styles.courtName}>
            {formatCourtName(badge.courtName)}
          </ThemedText>
          <ThemedText lightColor="#666666" darkColor="#999999" style={styles.visitCount}>
            Played {badge.timesVisited} time{badge.timesVisited !== 1 ? 's' : ''}
          </ThemedText>
        </ThemedView>
      </Pressable>
    );
  };

  const renderCourtBadges = () => {
    if (badgesLoading) {
      return (
        <View style={styles.badgesSection}>
          <ThemedText lightColor="#000000" darkColor="#ffffff" style={styles.badgesHeader}>
            Court Badges
          </ThemedText>
          <View style={styles.badgesGrid}>
            {[1, 2].map((i) => (
              <ThemedView
                key={i}
                lightColor="#f8f9fa"
                darkColor="#2a2a2a"
                style={[styles.badgeCard, styles.loadingBadge]}>
                <View style={styles.loadingImage} />
                <ThemedText lightColor="#666666" darkColor="#999999" style={styles.loadingText}>
                  Loading...
                </ThemedText>
              </ThemedView>
            ))}
          </View>
        </View>
      );
    }

    if (badgesError) {
      return (
        <View style={styles.badgesSection}>
          <ThemedText lightColor="#000000" darkColor="#ffffff" style={styles.badgesHeader}>
            Court Badges
          </ThemedText>
          <ThemedText lightColor="#dc3545" darkColor="#f87171" style={styles.errorText}>
            {badgesError}
          </ThemedText>
        </View>
      );
    }

    if (courtBadges.length === 0) {
      return (
        <View style={styles.badgesSection}>
          <ThemedText lightColor="#000000" darkColor="#ffffff" style={styles.badgesHeader}>
            Court Badges
          </ThemedText>
          <ThemedText lightColor="#666666" darkColor="#999999" style={styles.emptyText}>
            No court badges yet. Start practicing to collect badges!
          </ThemedText>
        </View>
      );
    }

    return (
      <View style={styles.badgesSection}>
        <ThemedText lightColor="#000000" darkColor="#ffffff" style={styles.badgesHeader}>
          Court Badges
        </ThemedText>
        <View style={styles.badgesGrid}>{courtBadges.map(renderBadgeCard)}</View>
      </View>
    );
  };

  return (
    <ThemedView lightColor="#ffffff" darkColor="#000000" style={{ flex: 1 }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[
          styles.container,
          { minHeight: '100%', paddingTop: insets.top + 16, paddingBottom: insets.bottom + 32 },
        ]}
        keyboardShouldPersistTaps="handled"
        bounces={false}
        showsVerticalScrollIndicator={false}>
        <ThemedText lightColor="#000000" darkColor="#ffffff" style={styles.header} type="title">
          Profile
        </ThemedText>
        <View style={styles.section}>
          <ThemedText lightColor="#000000" darkColor="#ffffff" style={styles.label}>
            Username
          </ThemedText>
          <ThemedText lightColor="#000000" darkColor="#ffffff" style={styles.value}>
            {username}
          </ThemedText>
        </View>
        <View style={styles.section}>
          <ThemedText lightColor="#000000" darkColor="#ffffff" style={styles.label}>
            Email
          </ThemedText>
          <ThemedText lightColor="#000000" darkColor="#ffffff" style={styles.value}>
            {email}
          </ThemedText>
        </View>
        <View style={styles.section}>
          <ThemedText lightColor="#000000" darkColor="#ffffff" style={styles.label}>
            Member Since
          </ThemedText>
          <ThemedText lightColor="#000000" darkColor="#ffffff" style={styles.value}>
            {memberSince}
          </ThemedText>
        </View>

        {/* Court Badges Section */}
        {renderCourtBadges()}

        {/* Badge Modal */}
        <Modal
          visible={modalVisible}
          transparent
          animationType="none"
          onRequestClose={closeBadgeModal}>
          <Pressable style={styles.modalOverlay} onPress={closeBadgeModal}>
            <Animated.View
              style={[
                styles.modalContent,
                {
                  opacity: modalAnim,
                  transform: [
                    {
                      scale: modalAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.92, 1],
                      }),
                    },
                  ],
                },
              ]}
              onStartShouldSetResponder={() => true}
              onTouchEnd={(e) => e.stopPropagation()}>
              <ThemedView
                lightColor="#ffffff"
                darkColor="#1a1a1a"
                style={{
                  borderRadius: 20,
                  padding: 24,
                  alignItems: 'center',
                  // Remove width: '100%' and height: '100%'
                  // Let it size based on content
                }}>
                <Pressable
                  style={styles.closeButton}
                  onPress={closeBadgeModal}
                  accessibilityRole="button"
                  accessibilityLabel="Close badge details">
                  <ThemedText
                    lightColor="#888888"
                    darkColor="#aaaaaa"
                    style={styles.closeButtonText}>
                    ×
                  </ThemedText>
                </Pressable>
                {selectedBadge && (
                  <>
                    <Badge3D
                      badgeImage={getBadgeImage(selectedBadge.courtName)}
                      courtName={selectedBadge.courtName}
                      isModal={true}
                    />
                    <ThemedText
                      lightColor="#000000"
                      darkColor="#ffffff"
                      style={styles.modalCourtName}>
                      {formatCourtName(selectedBadge.courtName)}
                    </ThemedText>
                    <ThemedText
                      lightColor="#444444"
                      darkColor="#cccccc"
                      style={styles.modalVisitCount}>
                      Played {selectedBadge.timesVisited} time
                      {selectedBadge.timesVisited !== 1 ? 's' : ''}
                    </ThemedText>
                    <ThemedText
                      lightColor="#888888"
                      darkColor="#aaaaaa"
                      style={styles.modalUnlockDate}>
                      First unlocked: {new Date(selectedBadge.firstUnlockedAt).toLocaleDateString()}
                    </ThemedText>
                  </>
                )}
              </ThemedView>
            </Animated.View>
          </Pressable>
        </Modal>

        <View style={styles.spacer} />
        <Button variant="destructive" size="lg" style={styles.signOutButton} onPress={signOut}>
          <ThemedText style={styles.signOutText}>Sign Out</ThemedText>
        </Button>
      </ScrollView>
    </ThemedView>
  );
}

const { width } = Dimensions.get('window');
const badgeSize = (width - 60) / 2; // Increased gap between cards (was 48)

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    flex: 1,
    paddingHorizontal: 24,
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
  },
  header: {
    fontWeight: 'bold',
    fontSize: 26,
    marginBottom: 4,
  },
  subheader: {
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
  // Court Badges Styles
  badgesSection: {
    width: '100%',
    marginBottom: 24,
  },
  badgesHeader: {
    fontWeight: 'bold',
    fontSize: 20,
    marginBottom: 16,
  },
  badgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    width: '100%',
  },
  badgeCard: {
    width: badgeSize,
    alignItems: 'center',
    marginBottom: 32, // Increased from 24
    padding: 8, // Reduced from 12
    backgroundColor: 'transparent',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'transparent',
    elevation: 2,
  },
  badgeImage: {
    width: 100,
    height: 100,
    marginBottom: 12,
  },
  courtName: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4,
  },
  visitCount: {
    fontSize: 13,
    textAlign: 'center',
  },
  // Loading States
  loadingBadge: {
    opacity: 0.6,
  },
  loadingImage: {
    width: 100,
    height: 100,
    backgroundColor: '#e9ecef',
    borderRadius: 12,
    marginBottom: 12,
  },
  loadingText: {
    fontSize: 13,
  },
  // Error and Empty States
  errorText: {
    fontSize: 14,
    textAlign: 'center',
    padding: 16,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    padding: 16,
    fontStyle: 'italic',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'transparent',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    width: width - 48,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  closeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 2,
    padding: 8,
  },
  closeButtonText: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  modalBadgeImage: {
    width: 180,
    height: 180,
    marginBottom: 12,
  },
  modalCourtName: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalVisitCount: {
    fontSize: 16,
    marginBottom: 4,
    textAlign: 'center',
  },
  modalUnlockDate: {
    fontSize: 14,
    textAlign: 'center',
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
