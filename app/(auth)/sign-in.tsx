import { Link, useRouter } from "expo-router";
import React from "react";
import {
  Button,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

export default function SignInScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>BlueJay-Bites</Text>
      <Text style={styles.subtitle}>
        Sign-in is temporarily disabled in prototype mode.
      </Text>
      
      <Button title="Continue to App" onPress={() => router.replace("/(tabs)")} />
      
      <Link href="/sign-up" asChild>
        <Pressable style={styles.link}>
          <Text style={styles.linkText}>View prototype sign-up screen</Text>
        </Pressable>
      </Link>
    </View>
  );
}

// Add some basic styling to make it look nice
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
    color: "#555"
  },
  link: {
    marginTop: 15,
    alignItems: "center",
  },
  linkText: {
    color: "#005CA9",
    fontSize: 16,
  },
});