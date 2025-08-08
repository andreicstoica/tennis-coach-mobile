import { useColorScheme } from '@/hooks/useColorScheme';
import * as Haptics from 'expo-haptics';
import React, { useRef, useState } from 'react';
import { Dimensions, FlatList, StyleSheet, Text, View } from 'react-native';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';

const { width: screenWidth } = Dimensions.get('window');

interface SwipeablePracticeCardsProps {
  content: string;
}

// Simple markdown parser component
const MarkdownText = ({
  content,
  style,
  colorScheme,
}: {
  content: string;
  style?: any;
  colorScheme?: 'light' | 'dark' | null | undefined;
}) => {
  const renderMarkdown = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, lineIndex) => {
      // Check if this line has headers
      if (line.match(/^#{1,3}\s+/)) {
        const headerMatch = line.match(/^(#{1,3})\s+(.*)/);
        if (headerMatch) {
          const level = headerMatch[1].length;
          const headerStyle =
            level === 1
              ? { fontSize: 20, fontWeight: 'bold', marginVertical: 4 }
              : level === 2
                ? { fontSize: 18, fontWeight: 'bold', marginVertical: 3 }
                : { fontSize: 16, fontWeight: 'bold', marginVertical: 2 };

          return (
            <ThemedText
              key={lineIndex}
              lightColor="#000000"
              darkColor="#ffffff"
              style={[style, headerStyle]}>
              {headerMatch[2]}
            </ThemedText>
          );
        }
      }

      // Handle list items (lines starting with - or *)
      if (line.match(/^\s*[-*]\s+/)) {
        const listItemContent = line.replace(/^\s*[-*]\s+/, '');

        // Process inline formatting within list items
        const parts = listItemContent.split(/(\*\*.*?\*\*|\*.*?\*)/g);

        return (
          <View key={lineIndex} style={{ flexDirection: 'row', marginVertical: 2 }}>
            <Text style={[style, { marginRight: 8, fontSize: 15 }]}>•</Text>
            <ThemedText
              lightColor="#000000"
              darkColor="#ffffff"
              style={[style, { flex: 1, marginVertical: 0, flexWrap: 'wrap' }]}>
              {parts.map((part, partIndex) => {
                if (part.startsWith('**') && part.endsWith('**')) {
                  return (
                    <Text key={partIndex} style={[style, { fontWeight: 'bold', flexWrap: 'wrap' }]}>
                      {part.slice(2, -2)}
                    </Text>
                  );
                }
                if (part.startsWith('*') && part.endsWith('*') && !part.startsWith('**')) {
                  return (
                    <Text
                      key={partIndex}
                      style={[style, { fontStyle: 'italic', flexWrap: 'wrap' }]}>
                      {part.slice(1, -1)}
                    </Text>
                  );
                }
                return part;
              })}
            </ThemedText>
          </View>
        );
      }

      // Process inline elements for regular lines
      const parts = line.split(/(\*\*.*?\*\*|\*.*?\*)/g);

      return (
        <ThemedText
          key={lineIndex}
          lightColor="#000000"
          darkColor="#ffffff"
          style={[style, { marginVertical: 1, flexWrap: 'wrap' }]}>
          {parts.map((part, partIndex) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return (
                <Text key={partIndex} style={[style, { fontWeight: 'bold', flexWrap: 'wrap' }]}>
                  {part.slice(2, -2)}
                </Text>
              );
            }
            if (part.startsWith('*') && part.endsWith('*') && !part.startsWith('**')) {
              return (
                <Text key={partIndex} style={[style, { fontStyle: 'italic', flexWrap: 'wrap' }]}>
                  {part.slice(1, -1)}
                </Text>
              );
            }
            return part;
          })}
        </ThemedText>
      );
    });
  };

  return <View>{renderMarkdown(content)}</View>;
};

export function SwipeablePracticeCards({ content }: SwipeablePracticeCardsProps) {
  const colorScheme = useColorScheme();
  const flatListRef = useRef<FlatList>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);

  // Parse practice plan content into sections
  const parsePracticePlan = (text: string) => {
    const sections: { [key: string]: string } = {};

    // Improved regex to handle variations like "Warm-Up", "Warmup", etc.
    const sectionRegex =
      /(?:^|\n)(?:#{1,3}\s*)?(?:🏃‍♂️\s*)?(warmup|warm-up|drill|game|minigame)(?:\s*\([^)]*\))?\s*:?\s*\n?([\s\S]*?)(?=(?:\n(?:#{1,3}\s*)?(?:🏃‍♂️\s*)?(?:warmup|warm-up|drill|game|minigame)\b)|$)/gi;

    let match;
    while ((match = sectionRegex.exec(text)) !== null) {
      const sectionName = match[1].toLowerCase().trim();
      let sectionContent = match[2].trim();
      // Clean up content
      sectionContent = sectionContent
        .replace(/^\n+|\n+$/g, '') // Remove leading/trailing newlines
        .replace(/\n{3,}/g, '\n\n'); // Reduce multiple newlines

      if (sectionContent && sectionName.match(/^(warmup|warm-up|drill|game|minigame)$/i)) {
        // Map variations to standard keys
        let key = sectionName;
        if (sectionName === 'warm-up') key = 'warmup';
        if (sectionName === 'minigame') key = 'game';

        sections[key] = sectionContent;
      }
    }

    // Fallback parsing if regex doesn't work
    if (Object.keys(sections).length === 0) {
      const lines = text.split('\n');
      let currentSection = '';
      let currentContent: string[] = [];

      for (const line of lines) {
        const sectionMatch = line.match(
          /(?:#{1,3}\s*)?(?:🏃‍♂️\s*)?(warmup|drill|game|minigame)(?:\s*\([^)]*\))?\s*:?\s*$/i
        );
        if (sectionMatch) {
          // Save previous section
          if (currentSection && currentContent.length > 0) {
            const key = currentSection === 'minigame' ? 'game' : currentSection;
            sections[key] = currentContent.join('\n').trim();
          }
          // Start new section
          currentSection = sectionMatch[1].toLowerCase();
          currentContent = [];
        } else if (currentSection && line.trim()) {
          currentContent.push(line);
        }
      }

      // Save last section
      if (currentSection && currentContent.length > 0) {
        const key = currentSection === 'minigame' ? 'game' : currentSection;
        sections[key] = currentContent.join('\n').trim();
      }
    }

    return sections;
  };

  const sections = parsePracticePlan(content);
  const sectionKeys = ['warmup', 'drill', 'game'].filter((key) => sections[key]);

  const sectionIcons = {
    warmup: '🏃‍♂️',
    drill: '🎯',
    game: '🤺',
  };

  const sectionColors = {
    warmup: '#FF6B6B',
    drill: '#4ECDC4',
    game: '#45B7D1',
    minigame: '#FF9F43',
  };

  const sectionTitles = {
    warmup: 'Warmup',
    drill: 'Drill',
    game: 'Game',
    minigame: 'Minigame',
  };

  if (sectionKeys.length === 0) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>No practice sections found</ThemedText>
      </ThemedView>
    );
  }

  return (
    <View
      style={styles.container}
      onLayout={(event) => {
        const { width } = event.nativeEvent.layout;
        setContainerWidth(width);
      }}>
      {/* Page indicator dots at top */}
      <View style={styles.pageIndicator}>
        {sectionKeys.map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              {
                backgroundColor:
                  currentPage === index
                    ? colorScheme?.isDarkColorScheme
                      ? '#ffffff'
                      : '#000000'
                    : colorScheme?.isDarkColorScheme
                      ? '#666666'
                      : '#cccccc',
              },
            ]}
          />
        ))}
      </View>

      {/* Swipeable cards */}
      <FlatList
        ref={flatListRef}
        data={sectionKeys}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(event) => {
          const pageIndex = Math.round(event.nativeEvent.contentOffset.x / containerWidth);
          setCurrentPage(pageIndex);
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }}
        renderItem={({ item: key, index }) => {
          const color = sectionColors[key as keyof typeof sectionColors];
          const icon = sectionIcons[key as keyof typeof sectionIcons];
          const title = sectionTitles[key as keyof typeof sectionTitles];
          const sectionContent = sections[key];

          return (
            <View style={[styles.page, { width: containerWidth }]}>
              <ThemedView
                style={[
                  styles.card,
                  {
                    backgroundColor: colorScheme?.isDarkColorScheme ? '#1a1a1a' : '#ffffff',
                    shadowColor: colorScheme?.isDarkColorScheme ? '#ffffff' : '#000000',
                  },
                ]}>
                {/* Card header */}
                <View style={[styles.cardHeader, { backgroundColor: color }]}>
                  <Text style={styles.cardHeaderIcon}>{icon}</Text>
                  <Text style={styles.cardHeaderText}>{title}</Text>
                </View>

                {/* Card content - remove ScrollView, just use View */}
                <View style={styles.cardContent}>
                  <MarkdownText
                    content={sectionContent}
                    style={styles.contentText}
                    colorScheme={colorScheme?.isDarkColorScheme ? 'dark' : 'light'}
                  />
                </View>
              </ThemedView>
            </View>
          );
        }}
        keyExtractor={(item) => item}
        getItemLayout={(data, index) => ({
          length: containerWidth,
          offset: containerWidth * index,
          index,
        })}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    // Remove flex: 1 to let it size naturally
  },
  page: {
    paddingHorizontal: 12,
    // Remove flex: 1 to let it size naturally
  },
  card: {
    // Remove flex: 1 to let it size naturally
    borderRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  cardHeaderIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  cardHeaderText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
  },
  cardContent: {
    padding: 16,
    paddingBottom: 16,
  },
  cardContentContainer: {
    padding: 16,
    paddingBottom: 16,
  },
  contentText: {
    fontSize: 15,
    lineHeight: 22,
  },
  pageIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
    paddingBottom: 12,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
});
