import '~/global.css';

import { useColorScheme } from '@/hooks/useColorScheme';
import { AppStateStorage } from '@/lib/app-state-storage';
import { AuthProvider, useAuth } from '@/lib/auth-context';
import { TRPCClientProvider } from '@/lib/trpc/trpc';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import * as Linking from 'expo-linking';
import { router, Stack, usePathname, useRootNavigationState, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

function NavigationWrapper() {
  const { user, isLoading } = useAuth();
  const hasRestoredState = useRef(false);

  useEffect(() => {
    if (!isLoading && !hasRestoredState.current) {
      hasRestoredState.current = true;

      if (user) {
        // Try to restore last route
        AppStateStorage.getLastRoute().then((lastRoute) => {
          if (lastRoute && lastRoute !== '/auth') {
            console.log('🔄 Restoring route:', lastRoute);
            router.replace(lastRoute as any);
          } else {
            // Default to tabs if no saved route
            const currentPath = router.canGoBack() ? null : '/(tabs)';
            if (currentPath) {
              router.replace(currentPath);
            }
          }
        });
      } else {
        router.replace('/auth');
      }
    }
  }, [isLoading, user]);

  if (isLoading) {
    return null;
  }

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="auth" options={{ headerShown: false }} />
      <Stack.Screen name="practice/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}

// Component to handle route tracking
function RouteTracker() {
  const { user } = useAuth();
  const pathname = usePathname();
  const segments = useSegments();

  useEffect(() => {
    const handleAppStateChange = (nextAppState: string) => {
      if (nextAppState === 'background' && user) {
        // Save current route when app goes to background
        try {
          console.log('📱 App going to background, pathname:', pathname, 'segments:', segments);

          // Use pathname directly as it gives us the current route
          if (pathname && pathname !== '/auth') {
            console.log('💾 Saving route:', pathname);
            AppStateStorage.saveRoute(pathname);
          }
        } catch (error) {
          console.error('Failed to save route:', error);
        }
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription?.remove();
  }, [user, pathname, segments]);

  return null; // This component doesn't render anything
}

export default function RootLayout() {
  const { isDarkColorScheme } = useColorScheme();
  const navigationState = useRootNavigationState();
  const [fontsLoaded] = useFonts({
    IBMPlexSans: require('../assets/fonts/IBMPlexSansRegular.ttf'),
    'IBMPlexSans-Medium': require('../assets/fonts/IBMPlexSansMedium.ttf'),
    'IBMPlexSans-SemiBold': require('../assets/fonts/IBMPlexSansSemiBold.ttf'),
    'IBMPlexSans-Bold': require('../assets/fonts/IBMPlexSansBold.ttf'),
  });

  useEffect(() => {
    if (fontsLoaded && navigationState?.key) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, navigationState?.key]);

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

  if (!fontsLoaded || !navigationState?.key) {
    return null;
  }

  return (
    <AuthProvider>
      <TRPCClientProvider>
        <ThemeProvider value={isDarkColorScheme ? DarkTheme : DefaultTheme}>
          <RouteTracker />
          <NavigationWrapper />
        </ThemeProvider>
      </TRPCClientProvider>
    </AuthProvider>
  );
}
