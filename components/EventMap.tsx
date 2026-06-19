import React, { useEffect, useState } from "react";
import { Linking, Platform, StyleSheet, Text, View } from "react-native";
import MapView, { Callout, Marker } from "react-native-maps";
import { Event, fetchEvents } from "@/lib/api";

const CREIGHTON_REGION = {
  latitude: 41.2627,
  longitude: -95.9491,
  latitudeDelta: 0.01,
  longitudeDelta: 0.01,
};

// Format a building's coordinates into a maps URL that opens the
// native maps app (Apple Maps on iOS, Google Maps on Android).
function getDirectionsUrl(latitude: number, longitude: number, label?: string) {
  const latLng = `${latitude},${longitude}`;
  const encodedLabel = label ? encodeURIComponent(label) : "Food Event";
  return Platform.select({
    ios: `maps:0,0?q=${encodedLabel}@${latLng}`,
    android: `geo:0,0?q=${latLng}(${encodedLabel})`,
    default: `https://www.google.com/maps/search/?api=1&query=${latLng}`,
  })!;
}

function openDirections(event: Event) {
  const lat = event.building?.latitude;
  const lng = event.building?.longitude;
  if (lat == null || lng == null) return;
  const url = getDirectionsUrl(lat, lng, event.building?.buildingName);
  Linking.openURL(url).catch((err) =>
    console.error("Failed to open maps:", err)
  );
}

export default function EventMap() {
  const [events, setEvents] = useState<Event[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchEvents();
        const withCoords = data.filter(
          (e) => e.building?.latitude != null && e.building?.longitude != null
        );
        setEvents(withCoords);
      } catch (err: any) {
        console.error("Error fetching events for map:", err);
        setError(err.message ?? "Failed to load events");
      }
    };
    load();
  }, []);

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={CREIGHTON_REGION}
        showsUserLocation
        showsMyLocationButton
      >
        {events.map((event) => (
          <Marker
            key={event.id}
            coordinate={{
              latitude: event.building!.latitude!,
              longitude: event.building!.longitude!,
            }}
            title={event.title}
            description={event.building?.buildingName}
          >
            <Callout onPress={() => openDirections(event)}>
              <View style={styles.callout}>
                <Text style={styles.calloutTitle}>{event.title}</Text>
                {event.building?.buildingName && (
                  <Text style={styles.calloutText}>{event.building.buildingName}</Text>
                )}
                {event.foodType?.typeName && (
                  <Text style={styles.calloutText}>{event.foodType.typeName}</Text>
                )}
                {event.description && (
                  <Text style={styles.calloutDescription}>{event.description}</Text>
                )}
                <Text style={styles.calloutAction}>Tap for directions</Text>
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>
      {error && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  callout: {
    minWidth: 180,
    padding: 4,
  },
  calloutTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#00235D",
    marginBottom: 4,
  },
  calloutText: {
    fontSize: 13,
    color: "#333",
    marginBottom: 2,
  },
  calloutDescription: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },
  calloutAction: {
    fontSize: 13,
    fontWeight: "600",
    color: "#005CA9",
    marginTop: 8,
  },
  errorBanner: {
    position: "absolute",
    top: 16,
    left: 16,
    right: 16,
    backgroundColor: "rgba(255,0,0,0.8)",
    padding: 12,
    borderRadius: 8,
  },
  errorText: {
    color: "#fff",
    textAlign: "center",
  },
});
