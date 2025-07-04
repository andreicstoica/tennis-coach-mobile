import { useColorScheme } from '@/hooks/useColorScheme';
import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, Platform, StyleSheet, View } from 'react-native';
import { OnboardingScreen } from '../OnboardingScreen';
import { ThemedText } from '../ThemedText';

interface WhatCourtlyDoesScreenProps {
  onNext: () => void;
  onBack: () => void;
  currentStep?: number;
  totalSteps?: number;
}

const { width: screenWidth } = Dimensions.get('window');
const CARD_WIDTH = screenWidth * 0.8;
const CARD_SPACING = 20;

export function WhatCourtlyDoesScreen({
  onNext,
  onBack,
  currentStep,
  totalSteps,
}: WhatCourtlyDoesScreenProps) {
  const { colorScheme } = useColorScheme();
  const scrollX = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef(null);
  const currentIndex = useRef(0);

  const examples = [
    {
      icon: '🎯',
      text: 'Backhand technique',
      description: 'Master your two-handed grip and cross-court precision',
    },
    {
      icon: '🚀',
      text: 'Serve accuracy',
      description: 'Perfect your toss and placement for consistent aces',
    },
    {
      icon: '🧠',
      text: 'Match mentality',
      description: 'Build mental toughness and strategic thinking',
    },
    {
      icon: '💪',
      text: 'Footwork & agility',
      description: 'Improve court coverage and movement efficiency',
    },
    { icon: '🏐', text: 'Volley mastery', description: 'Develop quick reflexes and net dominance' },
  ];

  useEffect(() => {
    (scrollViewRef.current as any)?.scrollTo({
      x: 0,
      animated: false,
    });

    const interval = setInterval(() => {
      currentIndex.current = (currentIndex.current + 1) % examples.length;
      (scrollViewRef.current as any)?.scrollTo({
        x: currentIndex.current * (CARD_WIDTH + CARD_SPACING),
        animated: true,
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [examples.length]);

  const renderCard = (example: (typeof examples)[0], index: number) => {
    const inputRange = [
      (index - 1) * (CARD_WIDTH + CARD_SPACING),
      index * (CARD_WIDTH + CARD_SPACING),
      (index + 1) * (CARD_WIDTH + CARD_SPACING),
    ];

    const scale = scrollX.interpolate({
      inputRange,
      outputRange: [0.8, 1, 0.8],
      extrapolate: 'clamp',
    });

    const opacity = scrollX.interpolate({
      inputRange,
      outputRange: [0.4, 1, 0.4],
      extrapolate: 'clamp',
    });

    const translateY = scrollX.interpolate({
      inputRange,
      outputRange: [20, 0, 20],
      extrapolate: 'clamp',
    });

    return (
      <Animated.View
        key={index}
        style={[
          styles.card,
          {
            width: CARD_WIDTH,
            transform: [{ scale }, { translateY }],
            opacity,
            backgroundColor: colorScheme === 'dark' ? '#1a1a1a' : '#ffffff',
            shadowColor: colorScheme === 'dark' ? '#000' : '#000',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: colorScheme === 'dark' ? 0.5 : 0.1,
            shadowRadius: 16,
            elevation: 8,
          },
        ]}>
        <View style={styles.cardContent}>
          <View style={styles.iconContainer}>
            <ThemedText style={styles.cardIcon}>{example.icon}</ThemedText>
          </View>
          <View style={styles.textContainer}>
            <ThemedText style={styles.cardTitle}>{example.text}</ThemedText>
            <ThemedText style={styles.cardDescription}>{example.description}</ThemedText>
          </View>
        </View>
      </Animated.View>
    );
  };

  return (
    <OnboardingScreen
      title="Your AI Coach Creates Your Perfect Practice Plan"
      description="Whether you want to sharpen your backhand, boost serve accuracy, or build mental toughness, Courtly designs sessions tailored to your goals."
      buttonText="Next"
      onButtonPress={onNext}
      showBack={true}
      onBack={onBack}
      showSkip={currentStep === 1}
      currentStep={currentStep}
      totalSteps={totalSteps}>
      <View style={styles.carouselContainer}>
        <Animated.ScrollView
          ref={scrollViewRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          scrollEventThrottle={16}
          onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], {
            useNativeDriver: true,
          })}
          contentContainerStyle={styles.scrollContent}
          snapToInterval={CARD_WIDTH + CARD_SPACING}
          decelerationRate="fast"
          pagingEnabled={false}>
          {examples.map((example, index) => renderCard(example, index))}
        </Animated.ScrollView>

        {/* Dots indicator */}
        <View style={styles.dotsContainer}>
          {examples.map((_, index) => {
            const inputRange = [
              (index - 1) * (CARD_WIDTH + CARD_SPACING),
              index * (CARD_WIDTH + CARD_SPACING),
              (index + 1) * (CARD_WIDTH + CARD_SPACING),
            ];

            const dotOpacity = scrollX.interpolate({
              inputRange,
              outputRange: [0.3, 1, 0.3],
              extrapolate: 'clamp',
            });

            const dotScale = scrollX.interpolate({
              inputRange,
              outputRange: [0.8, 1.2, 0.8],
              extrapolate: 'clamp',
            });

            return (
              <Animated.View
                key={index}
                style={[
                  styles.dot,
                  {
                    opacity: dotOpacity,
                    transform: [{ scale: dotScale }],
                    backgroundColor: colorScheme === 'dark' ? '#ffffff' : '#000000',
                  },
                ]}
              />
            );
          })}
        </View>
      </View>
    </OnboardingScreen>
  );
}

const styles = StyleSheet.create({
  carouselContainer: {
    width: '100%',
    marginTop: 20,
  },
  scrollContent: {
    paddingHorizontal: (screenWidth - CARD_WIDTH) / 8,
  },
  card: {
    marginHorizontal: CARD_SPACING / 2,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
    overflow: 'hidden',
    width: CARD_WIDTH,
  },
  cardContent: {
    padding: 24,
    alignItems: 'center',
    textAlign: 'center',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardIcon: {
    fontSize: 36,
    lineHeight: 40, // explicit line height
    textAlign: 'center',
    ...(Platform.OS === 'android' && {
      textAlignVertical: 'center',
      includeFontPadding: false,
    }),
  },
  textContainer: {
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  cardDescription: {
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.7,
    textAlign: 'center',
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
