import { View, type ViewProps } from 'react-native';

import { useColorScheme } from '@/hooks/useColorScheme';

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
};

export function ThemedView({ style, lightColor, darkColor, ...otherProps }: ThemedViewProps) {
  const { colorScheme } = useColorScheme();
  const backgroundColor = colorScheme === 'dark' ? darkColor : lightColor;

  return <View style={[{ backgroundColor }, style]} {...otherProps} />;
}
