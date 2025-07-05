import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useBottomTabOverflow } from '@/components/ui/TabBarBackground';

import { useAuth } from '@/lib/auth-context';
import { useTRPC } from '@/lib/trpc/trpc';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';

import { useColorScheme } from '@/hooks/useColorScheme';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

interface PracticeSession {
  plan: string | null;
  id: number | null;
  chatId: string | null;
  createdAt: string | null;
  userId: string | null;
  focusArea: string;
}

interface Plan {
  warmup: string;
  drill: string;
  game: string;
}

export default function PreviousScreen() {
  const { user, isLoading: authLoading } = useAuth();
  const { colorScheme } = useColorScheme();
  const router = useRouter();
  const trpc = useTRPC();
  const insets = useSafeAreaInsets();
  const bottomTabBarHeight = useBottomTabOverflow();

  // Filter state
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [showBlur, setShowBlur] = useState(false);
  const fadeAnim = useState(new Animated.Value(0))[0];

  // Only fetch practice sessions if user is authenticated
  const {
    data: rawSessions,
    isLoading,
    error,
    refetch,
  } = useQuery({
    ...trpc.practiceSession.list.queryOptions(),
    enabled: !!user, // Only run query if user exists
    retry: false,
  });

  const sessions: PracticeSession[] = Array.isArray(rawSessions)
    ? rawSessions
    : (((rawSessions as any)?.json ?? []) as PracticeSession[]);

  console.log('=== start SESSIONS DETAILS ===');
  console.log('Sessions type:', typeof sessions);
  console.log('Sessions array check:', Array.isArray(sessions));
  console.log('=== end SESSIONS DETAILS ===');

  // Get unique years and months from sessions
  const { years, months } = useMemo(() => {
    if (!sessions?.length) return { years: [], months: [] };

    const yearSet = new Set<number>();
    const monthSet = new Set<number>();

    sessions.forEach((session) => {
      if (session.createdAt) {
        const date = new Date(session.createdAt);
        yearSet.add(date.getFullYear());
        monthSet.add(date.getMonth() + 1); // getMonth() returns 0-11
      }
    });

    return {
      years: Array.from(yearSet).sort((a, b) => b - a), // Most recent first
      months: Array.from(monthSet).sort((a, b) => a - b), // 1-12 order
    };
  }, [sessions]);

  // Filter sessions based on selected year and month
  const filteredSessions = useMemo(() => {
    if (!sessions?.length) return [];

    return sessions.filter((session) => {
      if (!session.createdAt) return false;

      const date = new Date(session.createdAt);
      const sessionYear = date.getFullYear();
      const sessionMonth = date.getMonth() + 1;

      if (selectedYear && sessionYear !== selectedYear) return false;
      if (selectedMonth && sessionMonth !== selectedMonth) return false;

      return true;
    });
  }, [sessions, selectedYear, selectedMonth]);

  const onRefresh = async () => {
    setRefreshing(true);

    // Fade in the loading indicator
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();

    try {
      await refetch();
    } finally {
      // Fade out the loading indicator
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        setRefreshing(false);
      });
    }
  };

  const handleScroll = (event: any) => {
    const scrollY = event.nativeEvent.contentOffset.y;
    const threshold = 50; // Show blur when scrolled more than 50px
    setShowBlur(scrollY > threshold);
  };

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

  const handleCardPress = (session: PracticeSession) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (session.chatId && typeof session.chatId === 'string' && session.chatId.length > 0) {
      console.log('Navigating to chat:', session.chatId);
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
    const normalizedFocus = focus.toLowerCase().trim();

    // Use regex patterns to match focus areas
    if (/serve|serving/.test(normalizedFocus)) {
      return '#FF6B6B'; // Red for serve-related
    }
    if (/backhand/.test(normalizedFocus)) {
      return '#4ECDC4'; // Teal for backhand-related
    }
    if (/volley/.test(normalizedFocus)) {
      return '#96CEB4'; // Green for volley
    }
    if (/forehand/.test(normalizedFocus)) {
      return '#F4D03F'; // Darker yellow for forehand
    }
    if (/strategy|tactics|game\s*plan|mental|mindset|focus/.test(normalizedFocus)) {
      return '#DDA0DD'; // Purple for strategy
    }
    if (/return|returning/.test(normalizedFocus)) {
      return '#FFB347'; // Orange for returns
    }
    if (/approach|approaching/.test(normalizedFocus)) {
      return '#87CEEB'; // Sky blue for approach shots
    }
    if (/lob|overhead/.test(normalizedFocus)) {
      return '#98FB98'; // Pale gree@n for lobs/overheads
    }
    if (/footwork|movement|agility|slide|sliding|foot/.test(normalizedFocus)) {
      return '#FF8C42'; // Orange-red for footwork
    }

    // Backup color for unmatched categories
    return '#A9A9A9'; // Gray for unmatched focus areas
  };

  const handleYearPress = (year: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedYear(selectedYear === year ? null : year);
    setSelectedMonth(null); // Reset month when year changes
  };

  const handleMonthPress = (month: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedMonth(selectedMonth === month ? null : month);
  };

  const clearFilters = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedYear(null);
    setSelectedMonth(null);
  };

  return (
    <>
      {/* Top loading indicator */}
      {refreshing && (
        <Animated.View style={[styles.topLoader, { opacity: fadeAnim }]}>
          <ActivityIndicator size="small" color="#007AFF" />
        </Animated.View>
      )}

      {/* Progressive gradient overlay at top - only when scrolling */}
      {showBlur && (
        <LinearGradient
          colors={
            colorScheme === 'dark'
              ? ['rgba(0, 0, 0, 0.95)', 'rgba(0, 0, 0, 0.7)', 'rgba(0, 0, 0, 0)']
              : ['rgba(255, 255, 255, 0.95)', 'rgba(255, 255, 255, 0.7)', 'rgba(255, 255, 255, 0)']
          }
          style={[styles.topBlurOverlay, { height: insets.top + 30 }]}
        />
      )}

      <SafeAreaView style={{ flex: 1 }} edges={['bottom']}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingTop: insets.top, paddingBottom: bottomTabBarHeight + insets.bottom + 16 },
          ]}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#007AFF']} // Android
              tintColor="#007AFF" // iOS
            />
          }>
          <ThemedView style={styles.titleContainer}>
            <ThemedText lightColor="#000000" darkColor="#ffffff" type="title">
              Previous Sessions
            </ThemedText>
          </ThemedView>

          {/* Loading indicator */}
          {refreshing && (
            <Animated.View
              style={[
                styles.loadingContainer,
                {
                  opacity: fadeAnim,
                  backgroundColor:
                    colorScheme === 'dark' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(0, 122, 255, 0.1)',
                  borderColor:
                    colorScheme === 'dark' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(0, 122, 255, 0.2)',
                },
              ]}>
              <ActivityIndicator size="small" color="#007AFF" style={styles.loadingSpinner} />
              <ThemedText lightColor="#007AFF" darkColor="#3b82f6" style={styles.loadingText}>
                Refreshing sessions...
              </ThemedText>
            </Animated.View>
          )}

          {/* Year Filter */}
          {years.length > 0 && (
            <ThemedView style={styles.filterSection}>
              <ThemedText lightColor="#000000" darkColor="#ffffff" style={styles.filterLabel}>
                Year
              </ThemedText>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.filterScroll}>
                <TouchableOpacity
                  style={[
                    styles.filterChip,
                    !selectedYear && styles.filterChipActive,
                    {
                      backgroundColor:
                        colorScheme === 'dark' ? '#2a2a2a' : 'rgba(255, 255, 255, 0.7)',
                    },
                  ]}
                  onPress={clearFilters}>
                  <ThemedText
                    lightColor="#000000"
                    darkColor="#ffffff"
                    style={[styles.filterChipText, !selectedYear && styles.filterChipTextActive]}>
                    All
                  </ThemedText>
                </TouchableOpacity>
                {years.map((year) => (
                  <TouchableOpacity
                    key={year}
                    style={[
                      styles.filterChip,
                      selectedYear === year && styles.filterChipActive,
                      {
                        backgroundColor:
                          colorScheme === 'dark' ? '#2a2a2a' : 'rgba(255, 255, 255, 0.7)',
                      },
                    ]}
                    onPress={() => handleYearPress(year)}>
                    <ThemedText
                      lightColor="#000000"
                      darkColor="#ffffff"
                      style={[
                        styles.filterChipText,
                        selectedYear === year && styles.filterChipTextActive,
                      ]}>
                      {year}
                    </ThemedText>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </ThemedView>
          )}

          {/* Month Filter */}
          {selectedYear && months.length > 0 && (
            <ThemedView style={styles.filterSection}>
              <ThemedText lightColor="#000000" darkColor="#ffffff" style={styles.filterLabel}>
                Month
              </ThemedText>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.filterScroll}>
                <TouchableOpacity
                  style={[
                    styles.filterChip,
                    !selectedMonth && styles.filterChipActive,
                    {
                      backgroundColor:
                        colorScheme === 'dark' ? '#2a2a2a' : 'rgba(255, 255, 255, 0.7)',
                    },
                  ]}
                  onPress={() => setSelectedMonth(null)}>
                  <ThemedText
                    lightColor="#000000"
                    darkColor="#ffffff"
                    style={[styles.filterChipText, !selectedMonth && styles.filterChipTextActive]}>
                    All
                  </ThemedText>
                </TouchableOpacity>
                {months.map((month) => (
                  <TouchableOpacity
                    key={month}
                    style={[
                      styles.filterChip,
                      selectedMonth === month && styles.filterChipActive,
                      {
                        backgroundColor:
                          colorScheme === 'dark' ? '#2a2a2a' : 'rgba(255, 255, 255, 0.7)',
                      },
                    ]}
                    onPress={() => handleMonthPress(month)}>
                    <ThemedText
                      lightColor="#000000"
                      darkColor="#ffffff"
                      style={[
                        styles.filterChipText,
                        selectedMonth === month && styles.filterChipTextActive,
                      ]}>
                      {new Date(2024, month - 1).toLocaleDateString('en-US', { month: 'short' })}
                    </ThemedText>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </ThemedView>
          )}

          {/* Sessions */}
          {filteredSessions.map((session: PracticeSession, index: number) => {
            let plan: Plan | null = null;
            try {
              plan = session.plan ? JSON.parse(session.plan) : null;
            } catch {
              plan = null;
            }

            // Emoji for focus area
            const focusEmoji = (() => {
              const focus = session.focusArea.toLowerCase();
              if (/serve|serving/.test(focus)) return '🎯';
              if (/backhand/.test(focus)) return '🏐';
              if (/footwork|movement|agility/.test(focus)) return '💃';
              if (/volley/.test(focus)) return '🏐';
              if (/forehand/.test(focus)) return '🫲';
              if (/strategy|tactics|game\s*plan|mental|mindset/.test(focus)) return '🧠';
              if (/return|returning/.test(focus)) return '↩️';
              if (/approach|approaching/.test(focus)) return '🏃';
              if (/lob|overhead/.test(focus)) return '🪂';
              return '🏷️';
            })();

            // Spine color (use focus badge color)
            const spineColor = getFocusBadgeColor(session.focusArea);

            return (
              <TouchableOpacity
                key={session.id ?? index}
                style={styles.notebookCardWrapper}
                onPress={() => handleCardPress(session)}
                activeOpacity={0.85}>
                {/* Notebook Spine */}
                <ThemedView style={[styles.notebookSpine, { backgroundColor: spineColor }]}>
                  <ThemedText style={styles.spineText}>
                    {session.createdAt ? new Date(session.createdAt).toLocaleDateString() : ''}
                  </ThemedText>
                  <ThemedText
                    style={[styles.spineText, styles.spineRightText]}
                    numberOfLines={1}
                    ellipsizeMode="tail">
                    <ThemedText style={styles.spineEmoji}>{focusEmoji}</ThemedText>{' '}
                    {session.focusArea}
                  </ThemedText>
                </ThemedView>
                {/* Notebook Cover */}
                <ThemedView
                  lightColor="#FFFDF7"
                  darkColor="#1a1a1a"
                  style={[
                    styles.notebookCover,
                    {
                      borderColor: colorScheme === 'dark' ? '#444444' : '#E5E5E5',
                    },
                  ]}>
                  {plan ? (
                    <>
                      <ThemedText
                        lightColor="#333333"
                        darkColor="#e5e5e5"
                        style={styles.coverRow}
                        numberOfLines={1}
                        ellipsizeMode="tail">
                        <ThemedText
                          lightColor="#007AFF"
                          darkColor="#3b82f6"
                          style={styles.coverLabel}>
                          {' '}
                          Warmup:{' '}
                        </ThemedText>
                        {plan.warmup}
                      </ThemedText>
                      <ThemedText
                        lightColor="#333333"
                        darkColor="#e5e5e5"
                        style={styles.coverRow}
                        numberOfLines={1}
                        ellipsizeMode="tail">
                        <ThemedText
                          lightColor="#007AFF"
                          darkColor="#3b82f6"
                          style={styles.coverLabel}>
                          {' '}
                          Drill:{' '}
                        </ThemedText>
                        {plan.drill}
                      </ThemedText>
                      <ThemedText
                        lightColor="#333333"
                        darkColor="#e5e5e5"
                        style={styles.coverRow}
                        numberOfLines={1}
                        ellipsizeMode="tail">
                        <ThemedText
                          lightColor="#007AFF"
                          darkColor="#3b82f6"
                          style={styles.coverLabel}>
                          {' '}
                          Game:{' '}
                        </ThemedText>
                        {plan.game}
                      </ThemedText>
                    </>
                  ) : (
                    <ThemedText
                      lightColor="#333333"
                      darkColor="#e5e5e5"
                      style={styles.coverText}
                      numberOfLines={2}
                      ellipsizeMode="tail">
                      No plan available.
                    </ThemedText>
                  )}
                </ThemedView>
              </TouchableOpacity>
            );
          })}

          {filteredSessions.length === 0 && sessions.length > 0 && (
            <ThemedView style={styles.emptyContainer}>
              <ThemedText lightColor="#666666" darkColor="#999999" style={styles.emptyText}>
                No sessions found for the selected filters.
              </ThemedText>
            </ThemedView>
          )}
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    marginBottom: 48,
  },
  scrollContent: {
    marginTop: 16,
    padding: 24,
  },
  titleContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  card: {
    padding: 20,
    marginBottom: 20,
    borderRadius: 20,
    // Neumorphic shadow - light source from top-left
    shadowColor: '#000',
    shadowOffset: { width: 8, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
    // Inner shadow effect for depth
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    // Subtle gradient background
    backgroundColor: 'rgba(248, 250, 252, 0.95)',
  },
  cardEven: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
  },
  cardOdd: {
    backgroundColor: 'rgba(248, 250, 252, 0.95)',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  date: {
    fontSize: 16,
    opacity: 0.8,
    fontWeight: '600',
  },
  focusBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    // Neumorphic effect for the badge
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
  filterSection: {
    marginBottom: 20,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    opacity: 0.8,
  },
  filterScroll: {
    flexDirection: 'row',
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    // Remove backgroundColor - handled dynamically
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  filterChipActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '500',
    // Remove color - handled by ThemedText
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  // Notebook Card Styles
  notebookCardWrapper: {
    marginBottom: 28,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 0.13,
    shadowRadius: 12,
    elevation: 7,
    backgroundColor: 'transparent',
  },
  notebookSpine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    minHeight: 38,
  },
  spineText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
    letterSpacing: 0.5,
  },
  spineRightText: {
    flex: 1,
    textAlign: 'right',
    marginLeft: 6,
    marginRight: 6,
  },
  spineEmoji: {
    fontSize: 14,
    marginRight: 4,
  },
  notebookCover: {
    // Remove backgroundColor - handled by ThemedView
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    padding: 14,
    borderWidth: 1.5,
    // Remove borderColor - handled dynamically
    borderStyle: 'dotted',
    minHeight: 90,
  },
  coverText: {
    fontSize: 15,
    lineHeight: 22,
    // Remove color - handled by ThemedText
    opacity: 0.95,
  },
  coverLabel: {
    fontWeight: '700',
    // Remove color - handled by ThemedText
    fontSize: 14,
  },
  coverRow: {
    fontSize: 15,
    lineHeight: 22,
    // Remove color - handled by ThemedText
    opacity: 0.95,
    marginBottom: 4,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginBottom: 16,
    // Remove backgroundColor and borderColor - handled dynamically
    borderRadius: 12,
    borderWidth: 1,
  },
  loadingSpinner: {
    marginRight: 8,
  },
  loadingText: {
    fontSize: 14,
    // Remove color - handled by ThemedText
    fontWeight: '500',
  },
  topLoader: {
    position: 'absolute',
    top: 60, // Adjust based on your needs
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 1000,
    paddingVertical: 8,
  },
  topBlurOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
});
