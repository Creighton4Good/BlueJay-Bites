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
import { ENTRA_LOGIN_URL } from "@/lib/api";
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
      // Open the backend's Entra OAuth login in a browser. The backend handles
      // the OAuth flow and establishes the session.
      await WebBrowser.openAuthSessionAsync(ENTRA_LOGIN_URL);

      // After the browser flow, confirm the session by asking the backend who we are.
      const user = await refreshSession();
      if (user) {
        router.replace("/(tabs)");
      } else {
        setError("Sign-in did not complete. Please try again.");
      }
    } catch (err: any) {
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
