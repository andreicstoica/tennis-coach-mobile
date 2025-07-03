import '~/global.css';

import { useColorScheme } from '@/hooks/useColorScheme';
import { AuthProvider } from '@/lib/auth-context';
import { TRPCClientProvider } from '@/lib/trpc/trpc';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import * as Linking from 'expo-linking';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export default function RootLayout() {
  const { isDarkColorScheme } = useColorScheme();
  const [loaded] = useFonts({
    LumberSans: require('../assets/fonts/LumberSans.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  useEffect(() => {
    // Handle deep links for OAuth callbacks
    const handleDeepLink = (url: string) => {
      console.log('Deep link received:', url);

      // Check if this is an OAuth callback
      if (url.includes('tenniscoachmobile://') && url.includes('auth')) {
        console.log('OAuth callback detected, app will check session');
        // The auth context will automatically check session when app becomes active
      }
    };

    // Listen for deep links when app is already open
    const subscription = Linking.addEventListener('url', (event) => {
      handleDeepLink(event.url);
    });

    // Check if app was opened by a deep link
    Linking.getInitialURL().then((url) => {
      if (url) {
        handleDeepLink(url);
      }
    });

    return () => {
      subscription?.remove();
    };
  }, []);

  if (!loaded) {
    return null;
  }

  return (
    <AuthProvider>
      <TRPCClientProvider>
        <ThemeProvider value={isDarkColorScheme ? DarkTheme : DefaultTheme}>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="auth" options={{ headerShown: false }} />
            <Stack.Screen name="practice/[id]" options={{ headerShown: false }} />
            <Stack.Screen name="+not-found" />
          </Stack>
        </ThemeProvider>
      </TRPCClientProvider>
    </AuthProvider>
  );
}
