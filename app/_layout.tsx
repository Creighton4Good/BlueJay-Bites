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
 
/**
 * Shared navigation theme for the entire app.
 * 
 * ThemeProvider makes these colors available to Expo Router / React Navigation
 * screens, while individual screens may still define their own local styles.
 */
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

/*
  Top-level navigation layout.

  This component sits inside SessionProvider, so it can react to the current
  authenticated session and decide whether the user belongs in the auth routes
  or the main tab routes.

  Authentication state comes from SessionContext, which checks the backend
  session through `/api/users/me`.
*/
function InitialLayout() {
  const router = useRouter();
  const segments = useSegments();
  const { loading, isAuthenticated } = useSession();

  /*
    Keep the current route consistent with authentication state.

    - Signed-out users are reditected into the `(auth)` route group.
    - Signed-in users are redirected out of `(auth)` and into `(tabs)`.

    The redirect waits until SessionContext finishes its initial session check
    so users are not redirected based on an unresolved authentication state.
  */
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

  if (loading) {
    return ( 
      <View style={styles.loadingOverlay}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    {/*
        These are the two top-level route groups in the app:

        `(tabs)` contains the authenticated application.
        `(auth)` contains sign-in and other unauthenticated routes.

        The actual redirect logic is handled above rather than by these
        Stack.Screen declarations themselves.
      */}
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: MyTheme.colors.card },
        headerTintColor: "#FFF",
        contentStyle: { backgroundColor: MyTheme.colors.background },
      }}
    >
      {isAuthenticated ? (
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      ) : (
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      )}
    </Stack>
  );
}

/*
  Root application layout.

  SessionProvider wraps the entire router so session/auth state is available
  everywhere in the app. ThemeProvider applies the shared navigation theme.
*/
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
