import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import * as WebBrowser from "expo-web-browser";
import { MOBILE_LOGIN_URL, exchangeMobileAuthCode } from "@/lib/api";
import { useSession } from "@/app/contexts/session-context";

export default function SignInScreen() {
  const router = useRouter();
  const { refreshSession } = useSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignIn = async () => {
  setLoading(true);
  setError(null);

  try {
    const result = await WebBrowser.openAuthSessionAsync(
      MOBILE_LOGIN_URL,
      "bjbites://auth/callback"
    );

    console.log("Auth session result:", result);

    if (result.type !== "success" || !result.url) {
      setError("Sign-in was cancelled or did not complete.");
      return;
    }

    const callbackUrl = new URL(result.url);
    const code = callbackUrl.searchParams.get("code");

    console.log("Mobile auth code received:", code);

    if (!code) {
      setError("Sign-in did not return an authentication code.");
      return;
    }

    console.log("Exchanging mobile auth code...");
    await exchangeMobileAuthCode(code);
    console.log("Mobile auth exchange succeeded");

    console.log("Refreshing session...");
    const user = await refreshSession();

    console.log("Authenticated user:", user);

    if (!user) {
      setError("Sign-in completed, but the app session could not be loaded.");
      return;
    }

    router.replace("/(tabs)");
  } catch (err) {
    console.error("Sign-in error:", err);
    setError("Something went wrong during sign-in.");
  } finally {
    setLoading(false);
  }
};

  return (
    <View style={styles.container}>
      <Text style={styles.title}>BlueJay-Bites</Text>
      <Text style={styles.subtitle}>
        Sign in with your Creighton account to continue.
      </Text>

      {loading ? (
        <ActivityIndicator />
      ) : (
        <Pressable style={styles.button} onPress={handleSignIn}>
          <Text style={styles.buttonText}>Sign in with Creighton</Text>
        </Pressable>
      )}

      {!!error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 12,
    color: "#00235D",
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 30,
    color: "#555",
  },
  button: {
    backgroundColor: "#005CA9",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  errorText: {
    color: "red",
    textAlign: "center",
    marginTop: 16,
  },
});
