import { Link, useRouter } from "expo-router";
import React from "react";
import {
  Button,
  Pressable,
  StyleSheet,
  Text,
  View
} from "react-native";

export default function SignUpScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Prototype Mode</Text>
      <Text style={styles.subtitle}>
        Sign-up is temporarily disabled for this prototype.
      </Text>

      <Button title="Continue to App" onPress={() => router.replace("/(tabs)")} />

      <Link href="/sign-in" asChild>
        <Pressable style={styles.link}>
          <Text style={styles.linkText}>Back to sign in</Text>
        </Pressable>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20 },
  title: { fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginBottom: 20, color: '#00235D'},
  subtitle: { textAlign: 'center', marginBottom: 20, fontSize: 16, color: '#666' },
  link: { marginTop: 15, alignItems: 'center' },
  linkText: { color: '#005CA9', fontSize: 16 }
});