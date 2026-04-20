import { useSignUp } from "@clerk/clerk-expo";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Picker } from "@react-native-picker/picker";
import { Link, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Button,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";

type Notif = "push" | "email";
type Stage = "form" | "confirm" | "verify";

export default function SignUpScreen() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const router = useRouter();

  // State for user inputs
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");

  // State for preferences
  const [notif, setNotif] = useState<Notif>("push");

  // State for the verification flow
  const [stage, setStage] = useState<Stage>("form");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Step 1: Create the user account
  const onSignUpPress = async () => {
    if (!isLoaded) return;

    setError("");
    setIsLoading(true);

    try {
      // Create the user with Clerk
      await signUp.create({
        emailAddress,
        password,
        firstName,
        lastName,
      });

      // Send the verification email
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });

      // Move to the verification screen
      setStage("verify");
    } catch (err: any) {
      const errorMessage =
        err.errors?.[0]?.longMessage || "An error occurred. Please try again.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Verify the email code
  const onPressVerify = async () => {
    if (!isLoaded) return;

    setError("");
    setIsLoading(true);

    try {
      // Attempt to verify the code the user entered
      const signUpAttempt = await signUp.attemptEmailAddressVerification({
        code,
      });

      if (signUpAttempt.status === "complete") {
        // If successful, set the session active and navigate
        await setActive({ session: signUpAttempt.createdSessionId });
        router.replace("/(tabs)");
        await AsyncStorage.setItem(
          "@prefs",
          JSON.stringify({ notif })
        );
      } else {
        setError("Verification incomplete. Please try again.");
      }
    } catch (err: any) {
      const errorMessage =
        err.errors?.[0]?.longMessage || "Invalid verification code.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Simple validation before confirm
  const onReviewAndConfirm = () => {
    if (!firstName || !lastName || !emailAddress || !password) {
      setError("Please complete all fields before continuing.");
      return;
    }
    setError("");
    setStage("confirm");
  }

  return (
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          nestedScrollEnabled
        >
  
        <View style={styles.container}>
        {stage !== "verify" ? (
          // Show the sign-up form
          <>
            <Text style={styles.title}>Sign Up</Text>

            {!!error && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            {stage === "form" && (
              <>
                <TextInput
                  value={firstName}
                  placeholder="First Name..."
                  onChangeText={setFirstName}
                  style={styles.input}
                  editable={!isLoading} />
                <TextInput
                  value={lastName}
                  placeholder="Last Name..."
                  onChangeText={setLastName}
                  style={styles.input}
                  editable={!isLoading} />
                <TextInput
                  autoCapitalize="none"
                  value={emailAddress}
                  placeholder="Email..."
                  onChangeText={setEmailAddress}
                  style={styles.input}
                  editable={!isLoading} />
                <TextInput
                  value={password}
                  placeholder="Password..."
                  secureTextEntry
                  onChangeText={setPassword}
                  style={styles.input}
                  editable={!isLoading} />
                
                <Text style={styles.sectionLabel}>Notification Preferences</Text>
                <Picker selectedValue={notif} onValueChange={setNotif} style={styles.input}>
                  <Picker.Item label="Push" value="push" />
                  <Picker.Item label="Email" value="email" />
                  <Picker.Item label="Both" value="push and email" />
                </Picker>

                <Button
                  title="Review & Confirm"
                  onPress={onReviewAndConfirm}
                  disabled={isLoading} />

                <Link href="/sign-in" asChild>
                  <Pressable style={styles.link} disabled={isLoading}>
                    <Text style={styles.linkText}>Have an account? Sign In</Text>
                  </Pressable>
                </Link>
              </>
            )}

            {stage === "confirm" && (
              <View style={styles.confirmBox}>
                <Text style={styles.confirmTitle}>Confirm your details</Text>
                <Text>Name: {firstName} {lastName}</Text>
                <Text>Email: {emailAddress}</Text>
                <Text>Notifications: {notif}</Text>

                <View style={{ height: 12 }} />

                <Button
                  title={isLoading ? "Creating Account..." : "Looks good — Create Account"}
                  onPress={onSignUpPress}
                  disabled={isLoading} />
                <View style={{ height: 8 }} />
                <Button title="Edit" onPress={() => setStage("form")} />
              </View>
            )}
          </>
        ) : (
          // Show the email verification form
          <>
            <Text style={styles.title}>Verify Your Email</Text>
            <Text style={styles.subtitle}>
              Enter the verification code sent to {emailAddress}
            </Text>

            {!!error && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            <TextInput
              value={code}
              placeholder="Verification Code..."
              onChangeText={setCode}
              style={styles.input}
              editable={!isLoading}
              keyboardType="number-pad" />
            <Button
              title={isLoading ? "Verifying..." : "Verify Email"}
              onPress={onPressVerify}
              disabled={isLoading} />
          </>
        )}
      </View>
    </ScrollView>
  </KeyboardAvoidingView>
  );
}

// Use similar styles as the sign-in screen...
const styles = StyleSheet.create({
  chipRow: {
  flexDirection: "row",
  flexWrap: "wrap",
  gap: 8,
  marginBottom: 12,
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#005CA9",
    backgroundColor: "transparent",
  },
  chipSelected: {
    backgroundColor: "#005CA9",
  },
  chipText: {
    color: "#005CA9",
    fontSize: 14,
    fontWeight: "600",
  },
  chipTextSelected: {
    color: "white",
  },
  anyButton: { marginTop: 4, marginBottom: 12 },
  anyButtonText: { color: "#007AFF", fontSize: 14, textDecorationLine: "underline" },
  scroll: { flexGrow: 1, paddingBottom: 24},
  container: { flexGrow: 1, justifyContent: "center", padding: 20 },
  title: { fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginBottom: 20, color: '#00235D'},
  subtitle: { textAlign: 'center', marginBottom: 20, fontSize: 16, color: '#666' },
  input: { borderWidth: 1, borderColor: '#005CA9', padding: 12, marginBottom: 15, borderRadius: 5, fontSize: 16 },
  errorContainer: { backgroundColor: '#005CA9', padding: 12, borderRadius: 5, marginBottom: 15 },
  errorText: { color: '#00235D', textAlign: 'center' },
  link: { marginTop: 15, alignItems: 'center' },
  linkText: { color: '#005CA9', fontSize: 16 },
  sectionLabel: { fontSize: 16, fontWeight: '600', marginTop: 10, marginBottom: 6, color: '#00235D' },
  confirmBox: { borderWidth: 1, borderColor: '#005CA9', borderRadius: 8, padding: 16, backgroundColor: '#E9F2FB', marginTop: 12 },
  confirmTitle: { fontSize: 18, fontWeight: '700', marginBottom: 10, color: '#00235D' }
});