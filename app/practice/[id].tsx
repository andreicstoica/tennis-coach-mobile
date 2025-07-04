import { ThemedText } from '~/components/ThemedText';
import { ThemedView } from '~/components/ThemedView';
import { useColorScheme } from '~/hooks/useColorScheme';

import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useQuery } from '@tanstack/react-query';
import * as Haptics from 'expo-haptics';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import z from 'zod';

import { authClient } from '~/lib/auth-client';
import { useAuth } from '~/lib/auth-context';

const ChatMessageSchema = z
  .object({
    id: z.string(),
    role: z.string(),
    content: z.string(),
    createdAt: z.string(),
    // Make schema more flexible to handle additional fields from AI responses
    toolInvocations: z
      .array(
        z.object({
          toolCallId: z.string(),
          toolName: z.string(),
          args: z.record(z.any()),
          result: z.any().optional(),
        })
      )
      .optional(),
    // Allow other fields that might be present
  })
  .passthrough(); // This allows additional fields to pass through

const ChatSchema = z
  .object({
    id: z.string(),
    userId: z.string(),
    name: z.string(),
    createdAt: z.string(),
    updatedAt: z.string(),
    messages: z.array(ChatMessageSchema),
  })
  .passthrough(); // This allows additional fields to pass through

// Simple markdown parser component
const MarkdownText = ({ content, style }: { content: string; style?: any }) => {
  const renderMarkdown = (text: string) => {
    // Handle headers (# ## ###)
    text = text.replace(/^(#{1,3})\s+(.*$)/gm, (match, hashes, title) => {
      const level = hashes.length;
      return `<HEADER_${level}>${title}</HEADER_${level}>`;
    });

    // Handle bold (**text**)
    text = text.replace(/\*\*(.*?)\*\*/g, '<BOLD>$1</BOLD>');

    // Handle italic (*text*)
    text = text.replace(/\*(.*?)\*/g, '<ITALIC>$1</ITALIC>');

    // Split by our custom tags and render
    const segments = text.split(
      /(<HEADER_[1-3]>.*?<\/HEADER_[1-3]>|<BOLD>.*?<\/BOLD>|<ITALIC>.*?<\/ITALIC>)/g
    );

    // Group segments by lines to keep inline elements together
    const lines = text.split('\n');
    return lines.map((line, lineIndex) => {
      // Check if this line has headers
      if (line.match(/^#{1,3}\s+/)) {
        const headerMatch = line.match(/^(#{1,3})\s+(.*)/);
        if (headerMatch) {
          const level = headerMatch[1].length;
          const headerStyle =
            level === 1
              ? { fontSize: 20, fontWeight: 'bold', marginVertical: 8 }
              : level === 2
                ? { fontSize: 18, fontWeight: 'bold', marginVertical: 6 }
                : { fontSize: 16, fontWeight: 'bold', marginVertical: 4 };

          return (
            <Text key={lineIndex} style={[style, headerStyle]}>
              {headerMatch[2]}
            </Text>
          );
        }
      }

      // For regular lines, process inline formatting
      const lineSegments = line.split(/(<BOLD>.*?<\/BOLD>|<ITALIC>.*?<\/ITALIC>)/g);

      // Only render if line has content
      if (line.trim() === '') {
        return (
          <Text key={lineIndex} style={style}>
            {'\n'}
          </Text>
        );
      }

      return (
        <Text key={lineIndex} style={style}>
          {lineSegments.map((segment, segmentIndex) => {
            if (segment.startsWith('<BOLD>')) {
              return (
                <Text key={segmentIndex} style={[style, { fontWeight: 'bold' }]}>
                  {segment.replace(/<\/?BOLD>/g, '')}
                </Text>
              );
            } else if (segment.startsWith('<ITALIC>')) {
              return (
                <Text key={segmentIndex} style={[style, { fontStyle: 'italic' }]}>
                  {segment.replace(/<\/?ITALIC>/g, '')}
                </Text>
              );
            } else {
              return segment;
            }
          })}
          {lineIndex < lines.length - 1 ? '\n' : ''}
        </Text>
      );
    });
  };

  return <View>{renderMarkdown(content)}</View>;
};

// Accordion component for practice plan sections
const PracticePlanAccordion = ({ content, textStyle }: { content: string; textStyle?: any }) => {
  const [expandedSections, setExpandedSections] = useState<{ [key: string]: boolean }>({
    warmup: true, // Default open
    drill: false,
    game: false,
  });

  const toggleSection = (section: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Improved parsing logic - more robust section detection
  const parsePracticePlan = (text: string) => {
    const sections = {
      warmup: '',
      drill: '',
      game: '',
    };

    // DEBUG: Log the full content
    console.log('=== PARSING PRACTICE PLAN ===');
    console.log('Full content:', text);
    console.log('================================');

    // Split content by lines for easier parsing
    const lines = text.split('\n');
    let currentSection = '';
    let currentContent: string[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      const lowerLine = line.toLowerCase();

      // DEBUG: Log each line processing
      console.log(`Line ${i}: "${line}" -> "${lowerLine}"`);

      // Enhanced warmup detection - catch more variations
      if (
        (lowerLine.includes('warmup') ||
          lowerLine.includes('warm-up') ||
          lowerLine.includes('warm up')) &&
        (lowerLine.startsWith('warmup') ||
          lowerLine.startsWith('warm-up') ||
          lowerLine.startsWith('warm up') ||
          lowerLine.startsWith('# warmup') ||
          lowerLine.startsWith('# warm-up') ||
          lowerLine.startsWith('# warm up') ||
          lowerLine.startsWith('## warmup') ||
          lowerLine.startsWith('## warm-up') ||
          lowerLine.startsWith('## warm up') ||
          lowerLine.startsWith('### warmup') ||
          lowerLine.startsWith('### warm-up') ||
          lowerLine.startsWith('### warm up') ||
          lowerLine.includes('warmup:') ||
          lowerLine.includes('warm-up:') ||
          lowerLine.includes('warm up:') ||
          /^\s*(warmup|warm-up|warm up)/i.test(line))
      ) {
        console.log(`🔥 WARMUP DETECTED: "${line}"`);
        // Save previous section if exists
        if (currentSection && currentContent.length > 0) {
          sections[currentSection as keyof typeof sections] = currentContent.join('\n').trim();
        }
        currentSection = 'warmup';
        currentContent = [];

        // Add any content after the section header on the same line
        const headerMatch = line.match(/(warmup|warm-up|warm up)\s*:?\s*(.*)/i);
        if (headerMatch && headerMatch[2].trim()) {
          currentContent.push(headerMatch[2].trim());
        }
      } else if (
        lowerLine.includes('drill') &&
        (lowerLine.startsWith('drill') ||
          lowerLine.startsWith('# drill') ||
          lowerLine.startsWith('## drill') ||
          lowerLine.startsWith('### drill') ||
          lowerLine.includes('drill:') ||
          /^\s*drill/i.test(line))
      ) {
        console.log(`🎯 DRILL DETECTED: "${line}"`);
        // Save previous section if exists
        if (currentSection && currentContent.length > 0) {
          sections[currentSection as keyof typeof sections] = currentContent.join('\n').trim();
        }
        currentSection = 'drill';
        currentContent = [];

        // Add any content after the section header on the same line
        const headerMatch = line.match(/drill\s*:?\s*(.*)/i);
        if (headerMatch && headerMatch[1].trim()) {
          currentContent.push(headerMatch[1].trim());
        }
      } else if (
        lowerLine.includes('game') &&
        (lowerLine.startsWith('game') ||
          lowerLine.startsWith('# game') ||
          lowerLine.startsWith('## game') ||
          lowerLine.startsWith('### game') ||
          lowerLine.includes('game:') ||
          /^\s*game/i.test(line))
      ) {
        console.log(`🤺 GAME DETECTED: "${line}"`);
        // Save previous section if exists
        if (currentSection && currentContent.length > 0) {
          sections[currentSection as keyof typeof sections] = currentContent.join('\n').trim();
        }
        currentSection = 'game';
        currentContent = [];

        // Add any content after the section header on the same line
        const headerMatch = line.match(/game\s*:?\s*(.*)/i);
        if (headerMatch && headerMatch[1].trim()) {
          currentContent.push(headerMatch[1].trim());
        }
      } else if (currentSection) {
        // Add content to current section
        currentContent.push(line);
        console.log(`📝 Adding to ${currentSection}: "${line}"`);
      }
    }

    // Save the last section
    if (currentSection && currentContent.length > 0) {
      sections[currentSection as keyof typeof sections] = currentContent.join('\n').trim();
    }

    // DEBUG: Log final sections
    console.log('=== FINAL SECTIONS ===');
    console.log('Warmup:', sections.warmup);
    console.log('Drill:', sections.drill);
    console.log('Game:', sections.game);
    console.log('=====================');

    return sections;
  };

  const sections = parsePracticePlan(content);
  const hasValidSections = sections.warmup || sections.drill || sections.game;

  if (!hasValidSections) {
    return <MarkdownText content={content} style={textStyle} />;
  }

  const sectionIcons = {
    warmup: '🏃‍♂️',
    drill: '🎯',
    game: '🤺',
  };

  const sectionColors = {
    warmup: '#FF6B6B',
    drill: '#4ECDC4',
    game: '#45B7D1',
  };

  // Check if all sections are collapsed
  const allCollapsed =
    !expandedSections.warmup && !expandedSections.drill && !expandedSections.game;

  return (
    <View style={styles.accordionContainer}>
      {/* Show a preview when all sections are collapsed */}
      {allCollapsed && (
        <View style={styles.collapsedPreview}>
          <Text style={[textStyle, styles.previewText]}>
            Practice plan with{' '}
            {[sections.warmup && 'warmup', sections.drill && 'drill', sections.game && 'game']
              .filter(Boolean)
              .join(', ')}{' '}
            sections:
          </Text>
        </View>
      )}

      {/* Render sections in specific order: warmup, drill, game */}
      {['warmup', 'drill', 'game'].map((sectionKey) => {
        const sectionContent = sections[sectionKey as keyof typeof sections];
        if (!sectionContent) return null;

        const isExpanded = expandedSections[sectionKey];
        const icon = sectionIcons[sectionKey as keyof typeof sectionIcons];
        const color = sectionColors[sectionKey as keyof typeof sectionColors];

        return (
          <View key={sectionKey} style={styles.accordionSection}>
            <TouchableOpacity
              onPress={() => toggleSection(sectionKey)}
              style={[styles.accordionHeader, { backgroundColor: color }]}
              activeOpacity={0.7}>
              <Text style={styles.accordionHeaderText}>
                {icon} {sectionKey.charAt(0).toUpperCase() + sectionKey.slice(1)}
              </Text>
              <Text style={styles.accordionChevron}>{isExpanded ? '▼' : '▶'}</Text>
            </TouchableOpacity>

            {isExpanded && (
              <View style={styles.accordionContent}>
                <MarkdownText content={sectionContent} style={textStyle} />
              </View>
            )}
          </View>
        );
      })}
    </View>
  );
};

// Enhanced message content renderer
const MessageContent = ({
  message,
  textStyle,
}: {
  message: typeof ChatMessageSchema._type;
  textStyle?: any;
}) => {
  // Improved smart content detection - look for any practice plan indicators
  const isPracticePlan =
    message.role === 'assistant' &&
    /(warmup|drill|game)/i.test(message.content) &&
    message.content.length > 50; // Content length check instead of line count

  if (isPracticePlan) {
    return <PracticePlanAccordion content={message.content} textStyle={textStyle} />;
  }

  // For other assistant messages, use markdown
  if (message.role === 'assistant') {
    return <MarkdownText content={message.content} style={textStyle} />;
  }

  // For user messages, use plain text
  return <ThemedText style={textStyle}>{message.content}</ThemedText>;
};

// Add this constant at the top of the file after imports
const THINKING_MESSAGES = [
  '🧘 Calming Rublev down...',
  '🧹 Sweeping the clay for Rafa...',
  '👯‍♂️ Getting Carlos out of Ibiza...',
  '🎶 Helping Jannik warm up his voice...',
  '👌 Setting up the perfect practice session...',
  '🫦 Nearly there...!',
  '🎈 Checking gluten-free menu for Novak...',
  '🛟 Tossing Daniil a stuffy after that R1 exit...',
  "🕶️ Waiting for Naomi's latest fit...",
  "🍌 Peeling a perfect banana for Andy's changeover...",
  "🎥 Rewatching Roger's touching god highlight reel...",
  "📡 Tracking Ons's drop-shot trajectory...",
  '🥶 Has Kyrgios said something again...?',
];

export default function PracticeSession() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const [chatIdReady, setChatIdReady] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [aiTriggered, setAiTriggered] = useState(false);
  const [waitingForAI, setWaitingForAI] = useState(false);
  const [currentThinkingIndex, setCurrentThinkingIndex] = useState(0);
  const [aiTimeoutId, setAiTimeoutId] = useState<NodeJS.Timeout | null>(null);

  // Get the chatId from the route parameters
  // make sure it's a string that is ready to send to the server
  const { id: chatId } = useLocalSearchParams<{ id: string }>();
  useEffect(() => {
    if (chatId && chatId.length > 0) {
      setChatIdReady(true);
    }
  }, [chatId]);

  const isChatIdValid = typeof chatId === 'string' && chatId.length > 0;
  const queryEnabled = !!user && isChatIdValid;

  // Handle pull-to-refresh
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  };

  // Fetch the chat data using tRPC
  const { data: chat, refetch } = useQuery({
    queryKey: ['chat', 'get', { chatId }],
    queryFn: async () => {
      // Use the exact same format as your working curl command
      const inputJson = JSON.stringify({ json: { chatId } });
      const url = `https://courtly-xi.vercel.app/api/trpc/chat.get?input=${inputJson}`;

      const cookies = authClient.getCookie();
      const headers: Record<string, string> = {};
      if (cookies) {
        headers.Cookie = cookies;
      }

      const response = await fetch(url, { headers });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Manual fetch error:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log('🔍 RAW API RESPONSE:', JSON.stringify(data, null, 2));
      return data.result?.data || data;
    },
    enabled: queryEnabled,
    retry: false,
    refetchInterval: 3000, // Poll every 3 seconds for new messages
    refetchIntervalInBackground: false, // Only when app is active
  });

  // DEBUG: Log everything before validation
  console.log('🔍 CHAT DATA RECEIVED:', JSON.stringify(chat, null, 2));
  console.log('🔍 CHAT.JSON EXISTS:', !!chat?.json);
  console.log('🔍 CHAT.JSON CONTENT:', chat?.json ? JSON.stringify(chat.json, null, 2) : 'NULL');

  const parsedResult = chat?.json ? ChatSchema.safeParse(chat.json) : null;

  // DEBUG: Log the actual data structure to understand the validation failure
  if (chat?.json && !parsedResult?.success) {
    console.log('🔍 DEBUG: Chat data structure:', JSON.stringify(chat.json, null, 2));
    console.log('🔍 DEBUG: Schema validation errors:', parsedResult?.error?.issues);

    // Let's also check if chat.json has the expected structure
    const chatJson = chat.json;
    console.log('🔍 DEBUG: Has id?', !!chatJson?.id);
    console.log('🔍 DEBUG: Has userId?', !!chatJson?.userId);
    console.log('🔍 DEBUG: Has name?', !!chatJson?.name);
    console.log('🔍 DEBUG: Has messages?', !!chatJson?.messages);
    console.log('🔍 DEBUG: Messages is array?', Array.isArray(chatJson?.messages));
    console.log('🔍 DEBUG: Messages length?', chatJson?.messages?.length);

    if (chatJson?.messages?.length > 0) {
      console.log('🔍 DEBUG: First message:', JSON.stringify(chatJson.messages[0], null, 2));
    }
  }

  // Process messages and check for AI trigger - do this before early returns
  const parsedChat = parsedResult?.success ? parsedResult.data : null;
  const uniqueMessages = parsedChat?.messages
    ? parsedChat.messages.reduce((acc: typeof parsedChat.messages, message) => {
        // Check if this message already exists in our accumulator
        const isDuplicate = acc.some(
          (existingMessage) =>
            existingMessage.id === message.id ||
            (existingMessage.content === message.content &&
              existingMessage.role === message.role &&
              Math.abs(
                new Date(existingMessage.createdAt).getTime() -
                  new Date(message.createdAt).getTime()
              ) < 1000)
        );

        if (!isDuplicate) {
          acc.push(message);
        }
        return acc;
      }, [])
    : [];

  // AUTO-TRIGGER AI RESPONSE: Move this effect to top level
  useEffect(() => {
    // Reset aiTriggered when we get a new assistant message
    if (
      uniqueMessages.length > 0 &&
      uniqueMessages[uniqueMessages.length - 1]?.role === 'assistant'
    ) {
      setAiTriggered(false);
    }

    const shouldTriggerAI =
      uniqueMessages.length > 0 &&
      uniqueMessages[uniqueMessages.length - 1]?.role === 'user' &&
      !aiTriggered &&
      // Remove the restrictive length check - trigger for any incomplete conversation
      !uniqueMessages.some(
        (msg, index) =>
          msg.role === 'assistant' &&
          index >
            uniqueMessages.findIndex((m) => m.id === uniqueMessages[uniqueMessages.length - 1].id)
      );

    if (shouldTriggerAI) {
      console.log('🤖 DETECTED INCOMPLETE CONVERSATION - Auto-triggering AI response');
      setAiTriggered(true);
      setWaitingForAI(true);

      // Set timeout to prevent infinite loading
      const timeoutId = setTimeout(() => {
        console.log('⏰ AI response timeout - stopping loading state');
        setWaitingForAI(false);
        setAiTriggered(false);
      }, 30000); // 30 second timeout

      setAiTimeoutId(timeoutId);

      // Trigger AI response
      const triggerAI = async () => {
        try {
          const cookies = authClient.getCookie();
          const headers: Record<string, string> = {
            'Content-Type': 'application/json',
          };
          if (cookies) {
            headers.Cookie = cookies;
          }

          const aiChatData = {
            messages: uniqueMessages,
            id: chatId,
          };

          console.log('🤖 Triggering AI with messages:', aiChatData);

          const aiResponse = await fetch('https://courtly-xi.vercel.app/api/practice-session', {
            method: 'POST',
            headers,
            body: JSON.stringify(aiChatData),
          });

          console.log('🤖 AI Response status:', aiResponse.status);

          if (aiResponse.ok) {
            console.log('✅ AI response triggered successfully');
            // The AI response will be saved to the database
            // Our auto-refresh will pick it up in 3 seconds
          } else {
            console.error('❌ AI response failed:', await aiResponse.text());
            setWaitingForAI(false);
            setAiTriggered(false);
            if (aiTimeoutId) clearTimeout(aiTimeoutId);
          }
        } catch (error) {
          console.error('❌ Error triggering AI:', error);
          setWaitingForAI(false);
          setAiTriggered(false);
          if (aiTimeoutId) clearTimeout(aiTimeoutId);
        }
      };

      triggerAI();
    }
  }, [uniqueMessages, chatId, aiTriggered]);

  // Replace the complex waiting state management effect with this simpler one
  useEffect(() => {
    if (uniqueMessages.length > 0) {
      const lastMessage = uniqueMessages[uniqueMessages.length - 1];

      // Hide waiting state if we get an AI response
      if (lastMessage.role === 'assistant' && waitingForAI) {
        setWaitingForAI(false);
        if (aiTimeoutId) {
          clearTimeout(aiTimeoutId);
          setAiTimeoutId(null);
        }
      }
    }
  }, [uniqueMessages, waitingForAI, aiTimeoutId]);

  // Add this new effect after the existing useEffects
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;

    if (waitingForAI) {
      // Start cycling through thinking messages
      interval = setInterval(() => {
        setCurrentThinkingIndex((prev) => (prev + 1) % THINKING_MESSAGES.length);
      }, 2000); // Change message every 2 seconds
    } else {
      // Reset to first message when not waiting
      setCurrentThinkingIndex(0);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [waitingForAI]);

  // Add cleanup effect for timeout
  useEffect(() => {
    return () => {
      if (aiTimeoutId) {
        clearTimeout(aiTimeoutId);
      }
    };
  }, [aiTimeoutId]);

  // If parsing failed, let's try to show what we have instead of failing completely
  if (!parsedResult?.success) {
    console.log('⚠️ CHAT PARSING FAILED - showing raw data instead');

    // Try to render something useful even if validation fails
    return (
      <ThemedView style={styles.errorContainer}>
        <ThemedText style={styles.errorText}>Chat data validation failed.</ThemedText>
        <ThemedText style={styles.errorText}>Check console for details.</ThemedText>
        <TouchableOpacity
          onPress={() => refetch()}
          style={[
            styles.button,
            { backgroundColor: colorScheme === 'dark' ? '#3b82f6' : '#2563eb', marginBottom: 8 },
          ]}>
          <ThemedText style={styles.buttonText}>Refresh</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => router.back()}
          style={[
            styles.button,
            { backgroundColor: colorScheme === 'dark' ? '#6b7280' : '#4b5563' },
          ]}>
          <ThemedText style={styles.buttonText}>Go Back</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    );
  }

  if (authLoading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colorScheme === 'dark' ? '#ffffff' : '#000000'} />
        <ThemedText style={styles.loadingText}>Loading...</ThemedText>
      </ThemedView>
    );
  }

  if (!user) {
    return (
      <ThemedView style={styles.errorContainer}>
        <ThemedText style={styles.errorText}>Please sign in to view this chat.</ThemedText>
        <TouchableOpacity
          onPress={() => router.back()}
          style={[
            styles.button,
            { backgroundColor: colorScheme === 'dark' ? '#3b82f6' : '#2563eb' },
          ]}>
          <ThemedText style={styles.buttonText}>Go Back</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    );
  }

  if (!parsedChat) {
    return (
      <ThemedView style={styles.errorContainer}>
        <ThemedText style={styles.errorText}>Chat not found.</ThemedText>
        <TouchableOpacity
          onPress={() => router.back()}
          style={[
            styles.button,
            { backgroundColor: colorScheme === 'dark' ? '#3b82f6' : '#2563eb' },
          ]}>
          <ThemedText style={styles.buttonText}>Go Back</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.container} edges={['top']}>
        <ThemedView style={styles.container}>
          {/* Header */}
          <ThemedView style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <ThemedText style={styles.backButtonText}>← Back</ThemedText>
            </TouchableOpacity>
            <ThemedText style={styles.chatTitle}>{parsedChat.name}</ThemedText>
          </ThemedView>

          {/* Messages */}
          <ScrollView
            style={styles.messagesContainer}
            contentContainerStyle={styles.messagesContent}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[colorScheme === 'dark' ? '#ffffff' : '#000000']}
                tintColor={colorScheme === 'dark' ? '#ffffff' : '#000000'}
              />
            }>
            {uniqueMessages && uniqueMessages.length > 0 ? (
              uniqueMessages.map((message: typeof ChatMessageSchema._type, index: number) => (
                <ThemedView
                  key={`${message.id}-${index}`}
                  style={[
                    styles.messageContainer,
                    message.role === 'user' ? styles.userMessage : styles.assistantMessage,
                  ]}>
                  <ThemedText
                    style={[styles.messageRole, message.role === 'user' && styles.userText]}>
                    {message.role === 'user' ? 'You' : 'Coach'}
                  </ThemedText>
                  <MessageContent
                    message={message}
                    textStyle={[styles.messageContent, message.role === 'user' && styles.userText]}
                  />
                </ThemedView>
              ))
            ) : (
              <ThemedView style={styles.emptyContainer}>
                <ThemedText style={styles.emptyText}>No messages in this chat yet.</ThemedText>
              </ThemedView>
            )}
            {/* AI Waiting Indicator */}
            {waitingForAI && (
              <ThemedView style={styles.waitingIndicator}>
                <View style={styles.waitingContent}>
                  <ActivityIndicator
                    size="small"
                    color={colorScheme === 'dark' ? '#ffffff' : '#666666'}
                    style={styles.waitingSpinner}
                  />
                  <ThemedText style={styles.waitingText}>
                    {THINKING_MESSAGES[currentThinkingIndex]}
                  </ThemedText>
                </View>
              </ThemedView>
            )}
          </ScrollView>
        </ThemedView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    opacity: 0.7,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  errorText: {
    textAlign: 'center',
    color: '#ef4444',
    marginBottom: 24,
    fontSize: 16,
  },
  button: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  backButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
  chatTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    marginRight: 56, // Compensate for back button width
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 32,
  },
  messageContainer: {
    marginBottom: 16,
    padding: 16,
    borderRadius: 16,
    maxWidth: '85%',
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#007AFF',
  },
  assistantMessage: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    maxWidth: '95%', // Wider for coach messages with accordions
  },
  messageRole: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
    opacity: 0.8,
  },
  messageContent: {
    fontSize: 16,
    lineHeight: 22,
  },
  messageTime: {
    fontSize: 11,
    opacity: 0.6,
    marginTop: 6,
    alignSelf: 'flex-end',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    opacity: 0.7,
    textAlign: 'center',
  },
  userText: {
    color: '#ffffff',
  },
  // Accordion styles
  accordionContainer: {
    marginVertical: 4,
  },
  accordionSection: {
    marginBottom: 8,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  accordionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
  },
  accordionHeaderText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
    flex: 1,
  },
  accordionChevron: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '600',
  },
  accordionContent: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  collapsedPreview: {
    padding: 16,
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    marginBottom: 8,
  },
  previewText: {
    fontSize: 14,
    opacity: 0.7,
    textAlign: 'center',
  },
  waitingIndicator: {
    alignSelf: 'flex-start',
    marginBottom: 16,
    marginTop: 8,
  },
  waitingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 16,
    maxWidth: '100%',
    minWidth: 200, // Ensure minimum width
  },
  waitingSpinner: {
    marginRight: 8,
  },
  waitingText: {
    fontSize: 14,
    opacity: 0.75,
    fontStyle: 'italic',
    flexWrap: 'wrap',
  },
});
