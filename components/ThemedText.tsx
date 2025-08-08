import { StyleSheet, Text, type TextProps } from 'react-native';

import { useColorScheme } from '@/hooks/useColorScheme';
import { FONTS } from '@/lib/constants';

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link';
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = 'default',
  ...rest
}: ThemedTextProps) {
  const { colorScheme } = useColorScheme();
  const color = colorScheme === 'dark' ? darkColor : lightColor;

  return (
    <Text
      style={[
        { color },
        type === 'default' ? styles.default : undefined,
        type === 'title' ? styles.title : undefined,
        type === 'defaultSemiBold' ? styles.defaultSemiBold : undefined,
        type === 'subtitle' ? styles.subtitle : undefined,
        type === 'link' ? styles.link : undefined,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  default: {
    fontSize: 16,
    lineHeight: 24,
    fontFamily: FONTS.primary,
  },
  defaultSemiBold: {
    fontSize: 16,
    lineHeight: 24,
    fontFamily: FONTS.semiBold,
  },
  title: {
    fontSize: 28,
    lineHeight: 28,
    fontFamily: FONTS.bold,
  },
  subtitle: {
    fontSize: 20,
    fontFamily: FONTS.bold,
  },
  link: {
    lineHeight: 30,
    fontSize: 16,
    color: '#0a7ea4',
    fontFamily: FONTS.primary,
  },
});
