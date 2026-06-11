import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { Stack, usePathname, useRouter, useSegments } from "expo-router";
import * as SecureStore from "expo-secure-store";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { ActivityIndicator, Text, useColorScheme, View } from "react-native";

// This tells the splash screen to stay visible until we're ready
SplashScreen.preventAutoHideAsync();

/*
 * We need a secure place to store the user's session token.
 * `expo-secure-store` is perfect because it encrypts the data on the device.
 */
const tokenCache = {
  async getToken(key: string) {
    try {
      return SecureStore.getItemAsync(key);
    } catch (err) {
      return null;
    }
  },
  async saveToken(key: string, value: string) {
    try {
      return SecureStore.setItemAsync(key, value);
    } catch (err) {
      return;
    }
  },
};

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
 * This is our main layout component. It's the "bouncer" for our app,
 * deciding who gets to go where based on their login status.
 */
function InitialLayout() {
  const segments = useSegments(); // Expo Router's hook to know where the user is
  const router = useRouter(); // Expo Router's hook to navigate the user

  const pathname = usePathname();

  // Once loaded, we define our app's screens
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor : MyTheme.colors.card },
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
};

/**
 * This is the root component of our app.
 */
export default function RootLayout() {
  const scheme = useColorScheme();
  return (
    <ThemeProvider value={MyTheme}>
      <InitialLayout />
    </ThemeProvider>
  );
}