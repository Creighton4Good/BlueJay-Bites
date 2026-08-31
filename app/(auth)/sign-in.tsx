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

/**
 * Sign-in screen for Microsoft Entra authentication.
 * 
 * The frontend does not authenticate directly with Microsoft. Instead, it opens 
 * the Spring Boot backend's OAuth/OIDC login endpoint in a browser session.
 * The backend completes the Entra flow, creates the authenticated session, and 
 * redirects back to the app.
 * 
 * After the browser flow finishes, `refreshSession()` calls `/api/users/me`
 * to confirm that the backend session was successfully established.
 */

export default function SignInScreen() {
  const router = useRouter();
  const { refreshSession } = useSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      /*
        Open the backend's Entra OAuth/OIDC login flow.

        Authentication is handled by Spring Security rather than by the Expo 
        app itself. A successful login establishes the backend session used by 
        authenticated API requests.
      */
      await WebBrowser.openAuthSessionAsync(ENTRA_LOGIN_URL);

      /*
        The browser flow returning does not by itself guarantee that login 
        succeeded. Refresh the shared SessionContext and ask the backend for 
        the currently authenticated user.
      */
      const user = await refreshSession();
      if (user) {
        // Replace the auth route so the user cannot navigate back to sign-in.
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

      {/* Prevent duplicate login attempts while the browser flow is running. */}
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
