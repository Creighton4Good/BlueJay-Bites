import { DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { Stack, useRouter, useSegments } from "expo-router";
import React, { useEffect } from "react";
import {
  ActivityIndicator, StyleSheet, View,
} from "react-native";
import { 
  SessionProvider,
  useSession,
} from "@/app/contexts/session-context";
 
const MyTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: "#005CA9",
    background: "#6CADDE",
    card: "#005CA9",
    text: "#00235D",
    border: "#005CA9",
    notification: "#005CA9",
  }
};

export { ErrorBoundary } from "expo-router";

/**
 * Main layout component. Will be expanded to handle Entra SSO
 * authentication routing once that's wired up.
 */
function InitialLayout() {
  const router = useRouter();
  const segments = useSegments();
  const { loading, isAuthenticated } = useSession();

  useEffect(() => {
    // Wait until SessionContext has checked /api/users/me
    if (loading) return;

    const isInAuthGroup = segments[0] === "(auth)";

    // Signed-out users should remain within the auth group
    if (!isAuthenticated && !isInAuthGroup) {
      router.replace("/(auth)/sign-in");
      return;
    }

    // Signed-in users should not remain on sign-in or sign-up
    if (isAuthenticated && isInAuthGroup) {
      router.replace("/(tabs)");
    }
  }, [loading, isAuthenticated, segments, router]);

  return (
    <>
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: MyTheme.colors.card },
          headerTintColor: "#FFF",
          contentStyle: { backgroundColor: MyTheme.colors.background },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      </Stack>

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" />
        </View>
      )}
    </>
  );
}

export default function RootLayout() {
  return (
    <SessionProvider>
      <ThemeProvider value={MyTheme}>
        <InitialLayout />
      </ThemeProvider>
    </SessionProvider>
  );
}

const styles = StyleSheet.create({
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: MyTheme.colors.background,
  },
});
