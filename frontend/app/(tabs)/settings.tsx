import React, { useState } from 'react';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import {
  View,
  Text,
  Switch,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Keyboard,
  Platform,
  TouchableWithoutFeedback,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

/**
 * KeyboardDismissWrapper Component
 * 
 * Wraps mobile content to dismiss keyboard when tapping outside input fields.
 * Does nothing on web platform.
 */
const KeyboardDismissWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  if (Platform.OS === 'web') {
    return <>{children}</>;
  } else {
    return <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>{children}</TouchableWithoutFeedback>;
  }
};

/**
 * SettingsScreen Component
 * 
 * User settings page for configuring app preferences.
 * Features:
 * - Toggle push notifications on/off
 * - Add/remove dietary restrictions for personalized event filtering
 * - All settings stored in local state (could be persisted to backend/storage in future)
 */
export default function SettingsScreen() {
  const [pushNotifications, setPushNotifications] = useState<boolean>(true);
  const [newRestriction, setNewRestriction] = useState<string>('');
  const [dietaryRestrictions, setDietaryRestrictions] = useState<string[]>([]);

  const addRestriction = () => {
    const trimmed = newRestriction.trim();
    if (trimmed !== '') {
      setDietaryRestrictions([...dietaryRestrictions, trimmed]);
      setNewRestriction('');
      Keyboard.dismiss();
    }
  };

  const removeRestriction = (index: number) => {
    const updated = [...dietaryRestrictions];
    updated.splice(index, 1);
    setDietaryRestrictions(updated);
  };

  return (
    <SafeAreaProvider>
      <LinearGradient colors={['#0070C0', '#003E7E']} style={styles.gradient}>
        <SafeAreaView style={styles.container}>
          <KeyboardDismissWrapper>
            <ScrollView
              contentContainerStyle={styles.scrollContainer}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <Text style={styles.title}>Settings</Text>
              <Text style={styles.subheader}>Customize your experience</Text>

              {/* Push Notifications */}
              <View style={styles.settingRow}>
                <Text style={styles.settingLabel}>Push Notifications</Text>
                <Switch
                  value={pushNotifications}
                  onValueChange={setPushNotifications}
                  thumbColor="white"
                  trackColor={{ false: '#FF5555', true: '#00C851' }}
                />
              </View>

              {/* Dietary Restrictions */}
              <View style={styles.settingRow}>
                <Text style={styles.settingLabel}>Dietary Restrictions</Text>
                <View style={styles.inputRow}>
                  <TextInput
                    style={styles.input}
                    placeholder="Type restriction..."
                    placeholderTextColor="rgba(255,255,255,0.7)"
                    value={newRestriction}
                    onChangeText={setNewRestriction}
                  />
                  <TouchableOpacity style={styles.addButton} onPress={addRestriction}>
                    <Text style={styles.addButtonText}>Add</Text>
                  </TouchableOpacity>
                </View>

                {/* List of restrictions */}
                {dietaryRestrictions.length > 0 && (
                  <View style={{ marginTop: 12 }}>
                    {dietaryRestrictions.map((item, index) => (
                      <View style={styles.restrictionRow} key={index}>
                        <Text style={styles.restrictionItem}>• {item}</Text>
                        <TouchableOpacity onPress={() => removeRestriction(index)}>
                          <Text style={styles.removeText}>Remove</Text>
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            </ScrollView>
          </KeyboardDismissWrapper>
        </SafeAreaView>
      </LinearGradient>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 16,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  title: {
    fontSize: 36,
    fontWeight: '800',
    color: 'white',
    textAlign: 'center',
    marginBottom: 4,
  },
  subheader: {
    color: 'white',
    fontSize: 16,
    opacity: 0.85,
    textAlign: 'center',
    marginBottom: 30,
  },
  settingRow: {
    marginBottom: 28,
  },
  settingLabel: {
    fontSize: 18,
    color: 'white',
    fontWeight: '700',
    marginBottom: 12,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: 'white',
    borderRadius: 8,
    padding: 12,
    color: 'white',
    marginRight: 10,
  },
  addButton: {
    backgroundColor: 'white',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  addButtonText: {
    fontWeight: '700',
    color: '#0054A6',
  },
  restrictionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
  },
  restrictionItem: {
    color: 'white',
    fontSize: 16,
  },
  removeText: {
    color: '#FF5555',
    fontSize: 14,
    fontWeight: '600',
  },
});
