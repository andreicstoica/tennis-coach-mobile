import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function TabLayout() {
  const { colorScheme } = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#00D2FF', // Bright cyan that works well in both modes
        tabBarInactiveTintColor: colorScheme === 'dark' ? '#9ca3af' : '#6b7280', // Light grey for dark mode, darker grey for light mode
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            position: 'absolute',
            borderTopWidth: 0,
            backgroundColor: 'transparent',
            elevation: 0,
            shadowOpacity: 0,
          },
          default: {
            borderTopWidth: 0,
            backgroundColor: 'transparent',
            elevation: 0,
            shadowOpacity: 0,
          },
        }),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol size={20} name="house.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="Previous"
        options={{
          title: 'Previous',
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol size={20} name="calendar.day.timeline.leading" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="Profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => <IconSymbol size={20} name="person" color={color} />,
        }}
      />
    </Tabs>
  );
}
