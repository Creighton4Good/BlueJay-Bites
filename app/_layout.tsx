import { DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { Stack } from "expo-router";
import React from "react";
import { useColorScheme } from "react-native";

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

// These are just some nice-to-haves from Expo Router
export { ErrorBoundary } from "expo-router";
export const unstable_settings = { initialRouteName: "(tabs)" };

/**
 * Main layout component. Will be expanded to handle Entra SSO
 * authentication routing once that's wired up.
 */
function InitialLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: MyTheme.colors.card },
        headerTintColor: "#FFF",
        contentStyle: { backgroundColor: MyTheme.colors.background },
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="modal" options={{ presentation: "modal" }}/>
      <Stack.Screen
        name="change-password"
        options={{
          presentation: "modal",
          headerShown: true,
          title: "Change Password",
          headerBackTitle: "Profile",
        }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  const scheme = useColorScheme();
  return (
    <ThemeProvider value={MyTheme}>
      <InitialLayout />
    </ThemeProvider>
  );
}
