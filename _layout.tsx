import { ClerkProvider, useAuth } from "@clerk/clerk-expo";
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
 * This little object tells Clerk how to save and retrieve that token.
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

const CLERK_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

if (!CLERK_PUBLISHABLE_KEY) {
  throw new Error(
    "Missing Clerk Publishable Key. Did you forget to set EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY in your env?"
  );
}

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
  // These hooks are our main tools from Clerk and Expo Router
  const { isLoaded, isSignedIn } = useAuth(); // Clerk's hook to check auth status
  const segments = useSegments(); // Expo Router's hook to know where the user is
  const router = useRouter(); // Expo Router's hook to navigate the user

  // This effect hides the splash screen once Clerk has loaded
  useEffect(() => {
    if (isLoaded) {
      SplashScreen.hideAsync();
    }
  }, [isLoaded]);

  const pathname = usePathname();

  // This is the core logic that handles our routing!
  useEffect(() => {
    if (!isLoaded || !pathname) return;

    // segments is like ["(tabs)", "admin"] or ["(auth)", "sign-in"]
    const rootSegment = segments[0] as string | undefined;

    const inTabsGroup = rootSegment === "(tabs)";
    const inAuthGroup = rootSegment === "(auth)";

    const authScreen = segments[1] as string | undefined;
    const isOnPublicAuthRoute =
      inAuthGroup &&
      ["sign-in", "sign-up", "forgot-password"].includes(authScreen ?? "");

    if (isSignedIn && !inTabsGroup) {
      // Signed in but not in the main app area → send to tabs
      router.replace("/(tabs)");
    } else if (!isSignedIn && !isOnPublicAuthRoute) {
      // Not signed in → force to sign-in
      router.replace("/sign-in");
    }
  }, [isLoaded, isSignedIn, segments, pathname, router]);

  // While Clerk is loading, we'll show a simple loading spinner
  if (!isLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 10 }}>Loading...</Text>
      </View>
    );
  }

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
 * We wrap everything in the `ClerkProvider` so that all our components
 * can access the user's authentication state.
 */
export default function RootLayout() {
  const scheme = useColorScheme();
  return (
    <ClerkProvider
      publishableKey={CLERK_PUBLISHABLE_KEY}
      tokenCache={tokenCache}
    >
      <ThemeProvider value={MyTheme}>
        <InitialLayout />
      </ThemeProvider>
    </ClerkProvider>
  );
}