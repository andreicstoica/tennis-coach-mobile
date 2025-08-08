import { useColorScheme } from '@/hooks/useColorScheme';
import { NAV_THEME } from '@/lib/constants';
import { SymbolView, SymbolViewProps, SymbolWeight } from 'expo-symbols';
import { StyleProp, ViewStyle } from 'react-native';

export function IconSymbol({
  name,
  size = 24,
  color,
  style,
  weight = 'regular',
  isActive = false,
}: {
  name: SymbolViewProps['name'];
  size?: number;
  color: string;
  style?: StyleProp<ViewStyle>;
  weight?: SymbolWeight;
  isActive?: boolean;
}) {
  const { colorScheme } = useColorScheme();
  const primary = NAV_THEME[colorScheme ?? 'light'].primary;
  return (
    <SymbolView
      weight={weight}
      tintColor={isActive ? primary : color}
      resizeMode="scaleAspectFit"
      name={name}
      style={[{ width: size, height: size }, style]}
    />
  );
}
