import InputField from '@/components/ui/intput-field';
import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Keyboard,
  Platform,
  TouchableWithoutFeedback,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useEventContext } from '../../context/EventContext';
import { Picker } from '@react-native-picker/picker';

// Get API URL from environment variable, fallback to localhost
let API_URL: string;
if (process.env.EXPO_PUBLIC_API_URL) {
  API_URL = process.env.EXPO_PUBLIC_API_URL;
} else {
  API_URL = 'http://localhost:3000/api';
}

/**
 * KeyboardDismissWrapper Component
 */
const KeyboardDismissWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  if (Platform.OS === 'web') return <>{children}</>;
  return <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>{children}</TouchableWithoutFeedback>;
};

/**
 * AddScreen Component
 */
export default function AddScreen() {
  // Form state variables
  const [description, setDescription] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [customLocation, setCustomLocation] = useState("");
  const [availableQuantity, setAvailableQuantity] = useState("");
  const [dietaryRestrictions, setDietaryRestrictions] = useState<string[]>([""]);
  
  // UI state
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [locations, setLocations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const { addEvent } = useEventContext();

  // Fetch locations from API on mount
  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    try {
      const response = await fetch(`${API_URL}/locations`);
      const data = await response.json();
      
      const formattedLocations = [
        { locationID: '', locationName: 'Select a location...', locationLatitude: null, locationLongitude: null },
        ...data,
        { locationID: 'other', locationName: 'Other', locationLatitude: null, locationLongitude: null }
      ];
      
      setLocations(formattedLocations);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching locations:', error);
      setLocations([
        { locationID: '', locationName: 'Select a location...', locationLatitude: null, locationLongitude: null },
        { locationID: 'other', locationName: 'Other', locationLatitude: null, locationLongitude: null }
      ]);
      setLoading(false);
    }
  };

  const updateDietaryRestriction = (index: number, value: string) => {
    const newRestrictions = [...dietaryRestrictions];
    newRestrictions[index] = value;

    if (value !== "" && index === dietaryRestrictions.length - 1) {
      newRestrictions.push("");
    }

    const filteredRestrictions = newRestrictions.filter((restriction, i) =>
      restriction !== "" || i === newRestrictions.length - 1
    );

    setDietaryRestrictions(filteredRestrictions);
  };

  const handleSubmit = async () => {
    const locationData = locations.find(loc => loc.locationID?.toString() === selectedLocation);

    let finalLocation: string;
    if (selectedLocation === "other") {
      finalLocation = customLocation;
    } else {
      finalLocation = locationData?.locationName || "";
    }

    if (!finalLocation || finalLocation.trim() === "" || finalLocation === "Select a location...") {
      Alert.alert("Missing Field", "Please select or enter a location before submitting.");
      return;
    }
    if (!description.trim()) {
      Alert.alert("Missing Field", "Please enter a description before submitting.");
      return;
    }
    if (!availableQuantity.trim()) {
      Alert.alert("Missing Field", "Please enter an available quantity before submitting.");
      return;
    }

    const validDietaryRestrictions = dietaryRestrictions.filter(restriction => restriction.trim() !== "");

    let latitude = selectedLocation === "other" ? null : locationData?.locationLatitude || null;
    let longitude = selectedLocation === "other" ? null : locationData?.locationLongitude || null;

    try {
      await addEvent({
        id: selectedLocation,
        description,
        location: finalLocation,
        availableQuantity,
        dietaryRestrictions: validDietaryRestrictions,
        latitude,
        longitude,
      });
      Alert.alert("Success", "Event submitted successfully!");

      setDescription("");
      setSelectedLocation("");
      setCustomLocation("");
      setAvailableQuantity("");
      setDietaryRestrictions([""]);
    } catch (error) {
      Alert.alert("Error", "Failed to create event. Please try again.");
    }
  };

  return (
    <SafeAreaProvider>
      <LinearGradient colors={['#0070C0', '#003E7E']} style={styles.gradient}>
        <SafeAreaView style={styles.container}>
          <KeyboardDismissWrapper>
            <ScrollView
              style={{ flex: 1 }}
              contentContainerStyle={styles.scrollContainer}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <Text style={styles.header}>Add Event</Text>

              <InputField
                label="Description"
                value={description}
                onChangeText={setDescription}
                placeholder="Enter description"
              />

              <Text style={styles.label}>Location</Text>
              {loading ? (
                <Text style={styles.loadingText}>Loading locations...</Text>
              ) : Platform.OS === 'web' ? (
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={selectedLocation}
                    onValueChange={(itemValue) => setSelectedLocation(itemValue)}
                    style={styles.picker}
                    dropdownIconColor="#0054A6"
                  >
                    {locations.map(location => (
                      <Picker.Item
                        key={location.locationID?.toString() || 'select'}
                        label={location.locationName}
                        value={location.locationID?.toString() || ''}
                        color="#0054A6"
                      />
                    ))}
                  </Picker>
                </View>
              ) : (
                <View style={styles.dropdownWrapper}>
                  <TouchableOpacity
                    style={styles.customDropdown}
                    onPress={() => setIsDropdownVisible(!isDropdownVisible)}
                  >
                    <Text style={styles.customDropdownText}>
                      {locations.find(loc => loc.locationID?.toString() === selectedLocation)?.locationName || "Select a location..."}
                    </Text>
                    <Text
                      style={[styles.dropdownArrow, { transform: [{ rotate: isDropdownVisible ? '180deg' : '0deg' }] }]}
                    >
                      ▼
                    </Text>
                  </TouchableOpacity>

                  {isDropdownVisible && (
                    <ScrollView style={styles.dropdownList} nestedScrollEnabled={true}>
                      {locations.map(location => (
                        <TouchableOpacity
                          key={location.locationID?.toString() || 'select'}
                          style={styles.dropdownItem}
                          onPress={() => {
                            setSelectedLocation(location.locationID?.toString() || '');
                            setIsDropdownVisible(false);
                          }}
                        >
                          <Text style={styles.dropdownItemText}>{location.locationName}</Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  )}
                </View>
              )}

              {selectedLocation === "other" && (
                <InputField
                  label="Custom Location"
                  value={customLocation}
                  onChangeText={setCustomLocation}
                  placeholder="Enter custom location"
                />
              )}

              <InputField
                label="Available Quantity (servings)"
                value={availableQuantity}
                onChangeText={setAvailableQuantity}
                placeholder="Enter available quantity"
                keyboardType="numeric"
              />

              {dietaryRestrictions.map((restriction, index) => (
                <InputField
                  key={index}
                  label={index === 0 ? "Dietary Restrictions" : ""}
                  value={restriction}
                  onChangeText={(value: string) => updateDietaryRestriction(index, value)}
                  placeholder={`Enter dietary restriction ${index + 1}`}
                />
              ))}

              <TouchableOpacity style={styles.button} onPress={handleSubmit}>
                <Text style={styles.buttonText}>Submit Event</Text>
              </TouchableOpacity>
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
    paddingBottom: 60,
  },
  header: {
    fontSize: 38,
    fontWeight: '800',
    textAlign: 'center',
    color: 'white',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  subheader: {
    color: 'white',
    fontSize: 16,
    opacity: 0.85,
    textAlign: 'center',
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    marginBottom: 6,
    color: 'white',
    fontWeight: '700',
  },
  button: {
    backgroundColor: 'white',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 30,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  buttonText: {
    color: '#0054A6',
    fontSize: 17,
    fontWeight: '700',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: 'white',
    borderRadius: 8,
    marginBottom: 16,
    backgroundColor: 'white',
  },
  picker: {
    color: '#0054A6',
  },
  dropdownWrapper: {
    marginBottom: 16,
    position: 'relative',
    zIndex: 1000,
  },
  customDropdown: {
    borderWidth: 1,
    borderColor: 'white',
    borderRadius: 8,
    backgroundColor: 'white',
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  customDropdownText: {
    color: '#0054A6',
    fontSize: 16,
    flex: 1,
  },
  dropdownArrow: {
    color: '#0054A6',
    fontSize: 16,
  },
  dropdownList: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: 'white',
    borderTopWidth: 0,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    maxHeight: 200,
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    zIndex: 1001,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  dropdownItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  dropdownItemText: {
    color: '#0054A6',
    fontSize: 16,
  },
  loadingText: {
    color: "white",
    fontSize: 16,
    marginBottom: 16,
  },
});
