import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    View,
} from "react-native";

import { exchangeMobileAuthCode } from "@/lib/api";
import { useSession } from "@/app/contexts/session-context";

export default function AuthCallbackScreen() {
    const router = useRouter();
    const { code } = useLocalSearchParams<{ code?: string }>();
    const { refreshSession } = useSession();

    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const finishSignIn = async () => {
            if (!code) {
                setError("Authentication code was not provided.");
                return;
            }

            try {
                /*
                    Exchange the short-lived code returned by the backend for
                    an authenticated session that can be used by the native app.
                */
               await exchangeMobileAuthCode(code);
               
               const user = await refreshSession();

               if (!user) {
                setError("Could not load the authenticated user.");
                return;
               }

               router.replace("/(tabs)");
            } catch (err) {
                console.error("Mobile auth callback failed:", err);
                setError("Could not complet sign-in.");
            }
        };

        finishSignIn();
    }, [code, refreshSession, router]);

    return (
        <View style={styles.container}>
            {error ? (
                <Text style={styles.errorText}>{error}</Text>
            ) : (
                <>
                    <ActivityIndicator size="large" />
                    <Text style={styles.text}>Completing sign-in...</Text>
                </>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  text: {
    marginTop: 12,
    fontSize: 16,
  },
  errorText: {
    color: "red",
    textAlign: "center",
    fontSize: 16,
  },
});