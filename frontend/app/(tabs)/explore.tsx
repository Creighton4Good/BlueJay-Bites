import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import MapComponent from '@/mapcomponents/MapComponent';

/**
 * ExploreScreen Component
 * 
 * Displays an interactive map showing food drop event locations.
 * The MapComponent handles fetching event data and rendering map pins.
 * Users can view all active events and their locations on this screen.
 */
export default function ExploreScreen() {
  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        {/* Screen title */}
        <Text style={styles.header}>Map</Text>

        {/* Map container with rounded corners and white background */}
        <View style={styles.mapContainer}>
          <MapComponent />
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0054A6",
    padding: 20,
  },
  header: { 
    fontSize: 36, 
    fontWeight: "bold", 
    marginTop: 16,
    marginBottom: 16, 
    textAlign: "center", 
    color: "white" 
  },
  mapContainer: {
    flex: 1,
    borderRadius: 12, 
    overflow: 'hidden',
    marginTop: 10,
    marginBottom: 40,
    backgroundColor: 'white',
  },
});
