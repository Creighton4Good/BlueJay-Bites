import { useTheme } from "@react-navigation/native";
import { Stack } from "expo-router";

/**
 * Layout for unauthenticated routes.
 * 
 * This stack contains the screen a user can access before signing in.
 * Authentication-based redirects are handled higher up in `app/layout.tsx`,
 * while this file controls the appearance and navigation behavior of the 
 * auth-specific screen itself.
 */

export default function AuthLayout() {
  const { colors } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.card },
        headerTintColor: "#fff",
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      {/* 
        The sign-in screen intentionally has no header/back button.
        When a user is signed out, there is no previous authenticated screen
        they should be able to navigate back to.
      */}
      <Stack.Screen name="sign-in" options={{ headerShown: false }} />
    </Stack>
  );
}
