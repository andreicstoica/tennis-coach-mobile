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
          'rgba(15,40,15,0.95)',
          'rgba(15,40,15,0.7)',
          'rgba(15,40,15,0.3)',
          'rgba(15,40,15,0.0)',
        ] as [ColorValue, ColorValue, ...ColorValue[]])
      : ([
          'rgba(15,40,15,0.18)',
          'rgba(15,40,15,0.10)',
          'rgba(15,40,15,0.04)',
          'rgba(15,40,15,0.0)',
        ] as [ColorValue, ColorValue, ...ColorValue[]]);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <LinearGradient
        colors={gradientColors}
        locations={[0, 0.5, 0.85, 1]}
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
