import { useTheme } from "@react-navigation/native";
import { Stack } from "expo-router";

export default function AuthLayout() {
  const { colors } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.card },
        headerTintColor: "#fff",
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      {/* No header on sign-in: there is nothing to navigate back to when
          the user is signed out, and a back arrow let them reach the tabs. */}
      <Stack.Screen name="sign-in" options={{ headerShown: false }} />
      <Stack.Screen name="sign-up" options={{ title: "Create Account" }} />
    </Stack>
  );
}
