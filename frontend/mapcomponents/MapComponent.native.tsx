import MapView, { PROVIDER_GOOGLE, Marker, Callout } from 'react-native-maps';
import { Platform, StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { useEventContext } from '../context/EventContext';
import { useRouter } from 'expo-router';
import { useRef, useEffect } from 'react';

// Styles for map markers and callout popups
const styles = StyleSheet.create({
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  calloutContainer: {
    width: 200,
    padding: 10,
  },
  calloutTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0054A6',
    marginBottom: 5,
  },
  calloutDescription: {
    fontSize: 14,
    color: '#333',
    marginBottom: 5,
  },
  calloutServings: {
    fontSize: 12,
    color: '#666',
    marginBottom: 3,
  },
  calloutRestrictions: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
    fontStyle: 'italic',
  },
  calloutButton: {
    backgroundColor: '#0054A6',
    padding: 8,
    borderRadius: 5,
    alignItems: 'center',
  },
  calloutButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

/**
 * MapComponent for Native Mobile Platforms (iOS/Android)
 * 
 * Uses react-native-maps to display an interactive map with event markers.
 * Features:
 * - Shows all events with valid coordinates as map markers
 * - Tappable callouts showing event details (location, description, servings, dietary info)
 * - Auto-focuses on specific events when navigating from "View on Map" button
 * - Centered on Creighton University campus
 * - Uses Google Maps on Android, Apple Maps on iOS
 */
export default function MapComponent() {
  // Get events and selected event state from context
  const { events, selectedEventId, setSelectedEventId } = useEventContext();
  // Router for navigation to home screen
  const router = useRouter();
  // Reference to MapView for programmatic control (zooming, panning)
  const mapRef = useRef<MapView>(null);

  /**
   * Handles marker callout press
   * Navigates to home screen and stores event ID to auto-expand that event
   */
  const handleMarkerPress = (eventId: string) => {
    setSelectedEventId(eventId);
    router.push('/(tabs)');
  };

  /**
   * Auto-focus effect when navigating from "View on Map" button
   * Animates the map to zoom in on the selected event's location
   */
  useEffect(() => {
    if (selectedEventId && mapRef.current) {
      const focusEvent = events.find(e => e.id === selectedEventId);
      if (focusEvent && focusEvent.latitude && focusEvent.longitude) {
        mapRef.current.animateToRegion({
          latitude: focusEvent.latitude,
          longitude: focusEvent.longitude,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        }, 1000);
        // Clear the selected event ID after focusing
        setTimeout(() => setSelectedEventId(null), 1500);
      }
    }
  }, [selectedEventId, events, setSelectedEventId]);

  return (
    <MapView
      ref={mapRef}
      provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined} // Use Google Maps on Android
      style={styles.map}
      initialRegion={{
        latitude: 41.2665,      // Creighton University latitude
        longitude: -95.9477,    // Creighton University longitude
        latitudeDelta: 0.01,    // Zoom level (smaller = more zoomed in)
        longitudeDelta: 0.01,
      }}
    >
      {/* Render markers only for events with valid coordinates */}
      {events.filter(event => event.latitude && event.longitude).map((event) => (
        <Marker
          key={event.id}
          coordinate={{
            latitude: event.latitude!,
            longitude: event.longitude!,
          }}
        >
          {/* Callout popup that appears when marker is tapped */}
          <Callout onPress={() => handleMarkerPress(event.id)}>
            <View style={styles.calloutContainer}>
              <Text style={styles.calloutTitle}>{event.location}</Text>
              <Text style={styles.calloutDescription}>{event.description}</Text>
              <Text style={styles.calloutServings}>Available: {event.availableQuantity} servings</Text>
              {event.dietaryRestrictions && event.dietaryRestrictions.length > 0 && (
                <Text style={styles.calloutRestrictions}>
                  Dietary: {event.dietaryRestrictions.join(', ')}
                </Text>
              )}
              <View style={styles.calloutButton}>
                <Text style={styles.calloutButtonText}>View Details</Text>
              </View>
            </View>
          </Callout>
        </Marker>
      ))}
    </MapView>
  );
}