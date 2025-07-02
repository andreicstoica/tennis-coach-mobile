import '~/global.css';

import { useColorScheme } from '@/hooks/useColorScheme';
import { DarkTheme, DefaultTheme, Theme, ThemeProvider } from '@react-navigation/native';
import * as Font from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as React from 'react';
import { ActivityIndicator, Platform, View } from 'react-native';
import { AuthProvider, useAuth } from '~/lib/auth-context';
import { NAV_THEME } from '~/lib/constants';
import { TRPCClientProvider } from '~/lib/trpc/trpc';

const LIGHT_THEME: Theme = {
  ...DefaultTheme,
  colors: NAV_THEME.light,
};
const DARK_THEME: Theme = {
  ...DarkTheme,
  colors: NAV_THEME.dark,
};

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export default function RootLayout() {
  const hasMounted = React.useRef(false);
  const [isColorSchemeLoaded, setIsColorSchemeLoaded] = React.useState(false);
  const [fontsLoaded, setFontsLoaded] = React.useState(false);
  const { isDarkColorScheme } = useColorScheme();

  React.useEffect(() => {
    async function loadFonts() {
      await Font.loadAsync({
        IBMPlexSans: require('../assets/fonts/IBMPlexSansRegular.ttf'),
        IBMPlexSansMedium: require('../assets/fonts/IBMPlexSansMedium.ttf'),
        IBMPlexSansSemiBold: require('../assets/fonts/IBMPlexSansSemiBold.ttf'),
        IBMPlexSansBold: require('../assets/fonts/IBMPlexSansBold.ttf'),
      });
      setFontsLoaded(true);
    }
    loadFonts();
  }, []);

  useIsomorphicLayoutEffect(() => {
    if (hasMounted.current) {
      return;
    }

    if (Platform.OS === 'web') {
      // Adds the background color to the html element to prevent white background on overscroll.
      document.documentElement.classList.add('bg-background');
    }
    setIsColorSchemeLoaded(true);
    hasMounted.current = true;
  }, []);

  if (!isColorSchemeLoaded || !fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <TRPCClientProvider>
      <AuthProvider>
        <ThemeProvider value={isDarkColorScheme ? DARK_THEME : LIGHT_THEME}>
          <AuthGate />
          <StatusBar style={isDarkColorScheme ? 'light' : 'dark'} />
        </ThemeProvider>
      </AuthProvider>
    </TRPCClientProvider>
  );
}

function AuthGate() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <Stack>
      {!user ? (
        <Stack.Screen name="auth" options={{ headerShown: false }} />
      ) : (
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      )}
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}

const useIsomorphicLayoutEffect =
  Platform.OS === 'web' && typeof window === 'undefined' ? React.useEffect : React.useLayoutEffect;
