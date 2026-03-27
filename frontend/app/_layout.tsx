import React, { ReactNode } from 'react';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { EventProvider } from '../context/EventContext';

// Expo Router configuration - sets the default route anchor to the tabs folder
export const unstable_settings = {
  anchor: '(tabs)',
};

/**
 * RootLayout Component
 * 
 * The root layout component that wraps the entire application.
 * This is the highest-level component and runs on every screen.
 * 
 * Key responsibilities:
 * - Provides EventContext to all screens (event data and API calls)
 * - Sets up theme provider for dark/light mode support
 * - Configures navigation stack with hidden headers
 * - Renders status bar with automatic styling
 */
export default function RootLayout({ children }: { children: ReactNode }) {
  // Detect system color scheme (light or dark mode)
  const colorScheme = useColorScheme();

  return (
    // EventProvider wraps the app to make event data available everywhere
    <EventProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack initialRouteName="index">
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        </Stack>
        {children}
        <StatusBar style="auto" />
      </ThemeProvider>
    </EventProvider>
  );
}
