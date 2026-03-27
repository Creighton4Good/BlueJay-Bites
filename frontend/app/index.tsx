import { setUserRole } from '@/utils/global';
import { useRouter } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

/**
 * LoginScreen Component
 * 
 * Initial landing/login screen where users select their role.
 * This is a simplified role selection system (no actual authentication).
 * 
 * User roles:
 * - Consumer: Can only view events (home, map, settings tabs)
 * - Creator: Can view and create events (all tabs including "add")
 * - Admin: Full access to all features (all tabs)
 * 
 * The selected role is stored globally and determines tab visibility.
 */
export default function LoginScreen() {
  // Router for navigation after role selection
  const router = useRouter();

  /**
   * Handles role selection and navigation
   * Sets the user role globally and navigates to the tab navigation
   */
  function handleClick(role: string) {
    setUserRole(role); // Store role in global state
    console.log("User role set to:", role);
    router.replace("/(tabs)"); // Navigate to tabs, replacing this screen in history
  }

  return (
    <View style={styles.container}>
      {/* App welcome title */}
      <Text style={styles.title}>Welcome to Jay-Drop</Text>

      {/* Consumer role button - view-only access */}
      <TouchableOpacity style={styles.button} onPress={() => handleClick("consumer")}>
        <Text style={styles.buttonText}>Login As Consumer</Text>
      </TouchableOpacity>

      {/* Creator role button - can create events */}
      <TouchableOpacity style={styles.button} onPress={() => handleClick("creator")}>
        <Text style={styles.buttonText}>Login As Creator</Text>
      </TouchableOpacity>

      {/* Admin role button - full access */}
      <TouchableOpacity style={styles.button} onPress={() => handleClick("admin")}>
        <Text style={styles.buttonText}>Login As Admin</Text>
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  // Main container centered with blue background
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0054A6"
  },
  // Welcome title styling
  title: {
    fontSize: 24,
    marginBottom: 20,
    color: "white"
  },
  // Role selection button styling
  button: {
    backgroundColor: "white",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10
  },
  // Button text styling
  buttonText: {
    color: "#0054A6",
    fontSize: 18,
    fontWeight: "bold"
  }
});
