import { useColorScheme } from '@/hooks/useColorScheme';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { LinearGradient } from 'expo-linear-gradient';
import type { ColorValue } from 'react-native';
import { StyleSheet, View } from 'react-native';

export default function GradientTabBarBackground() {
  const { colorScheme } = useColorScheme();

  // Define gradient colors for light and dark mode as tuples (at least two colors)
  const gradientColors =
    colorScheme === 'dark'
      ? ([
          'rgba(0, 0, 0, 0.95)',
          'rgba(0, 0, 0, 0.7)',
          'rgba(0, 0, 0, 0.3)',
          'rgba(0, 0, 0, 0.0)',
        ] as [ColorValue, ColorValue, ...ColorValue[]])
      : ([
          'rgba(255, 255, 255, 0.95)',
          'rgba(255, 255, 255, 0.7)',
          'rgba(255, 255, 255, 0.3)',
          'rgba(255, 255, 255, 0.0)',
        ] as [ColorValue, ColorValue, ...ColorValue[]]);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <LinearGradient
        colors={gradientColors}
        locations={[0, 0.4, 0.8, 1]}
        start={{ x: 0.5, y: 1 }}
        end={{ x: 0.5, y: 0 }}
        style={StyleSheet.absoluteFill}
      />
    </View>
  );
}

export function useBottomTabOverflow() {
  return useBottomTabBarHeight();
}
