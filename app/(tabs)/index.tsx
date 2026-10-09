import React, {useCallback, useEffect, useState} from "react";
import { FlatList, Pressable, StyleSheet, Text, View, Image } from "react-native";
import {router, useFocusEffect} from "expo-router";
import { BASE_URL, Event, fetchEvents } from "@/lib/api";

/**
 * Main dashboard / home feed for authenticated users.
 * 
 * This screen loads the currently active food events from the backend and 
 * displays them as cards. Selecting an event opens the shared event-details
 * route.
 * 
 * The list reloads whenever the tab regains focus so newly created, eited, 
 * or closed events appear without requiring the app to remount.
 */
export default function HomeScreen() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /*
    Fetch the active-event feed from the backend.
  */
  const loadEvents = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await fetchEvents();
      setEvents(data);
    } catch (err: any) {
      console.error("Error fetching events:", err);
      setError(err.message ?? "Failed to load events");
    } finally {
      setLoading(false);
    }
  }, []);

  /*
    Refresh the feed whenever the Dashboard tab becomes active again.

    This is preferred over a one-time `useEffect` because event data may have
    changed while the user was on another screen.
  */
  useFocusEffect(
    useCallback(() => {
      loadEvents();
    }, [loadEvents])
  );

  /*
    Format backend date/time values for display using the device's locale.
    Falls back to the original string if parsing fails.
  */
  const formatDateTime = (value?: string | null) => {
    if (!value) return "";
    try {
      return new Date(value).toLocaleString();
    } catch {
      return value;
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>BlueJay-Bites</Text>
      <Text style={styles.subtitle}>Find free food on campus</Text>

      <View style={styles.separator} />

      <Text style={styles.sectionTitle}>Available Food Events</Text>

      {/* Handle loading, error, and empty state before rendering event cards. */}
      {loading ? (
        <View style={styles.stateContainer}>
          <Text style={styles.statusText}>Loading events...</Text>
        </View>
      ) : error ? (
        <View style={styles.stateContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : events.length === 0 ? (
        <View style={styles.stateContainer}>
          <Text style={styles.emptyText}>No active food events right now.</Text>
        </View>
      ) : (
        <FlatList
          data={events}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => {
            /*
              Photo URLs may currently be stored as backend-relative paths.
              Prefix those with BASE_URL so they can be loaded by the frontend.

              TODO: Revisit this when event photos are stored in cloud storage,
              where photoUrl should likely already be a complete public URL.
            */
            const displayUrl = item.photoUrl
            ? (item.photoUrl.startsWith("http") ? item.photoUrl : `${BASE_URL}${item.photoUrl}`)
            : undefined;
            return (
            <Pressable
              style={({ pressed }) => [
                styles.card,
                pressed && styles.cardPressed,
              ]}
              /*
                Open the shared event-details screen. The `from` parameter 
                tells that screen that navigation originated on Dashboard.
              */
              onPress={() =>
                router.push({
                  pathname: "/events/[id]",
                  params: { id: String(item.id), from: "dashboard" },
                })
              }
            >

              {displayUrl ? (
                  <Image
                      source={{ uri: displayUrl }}
                      style={styles.cardImage}
                      resizeMode="cover"
                      onError={() => console.warn(`Failed to load image for event ${item.id}`)}
                  />
              ) : null}

              <Text style={styles.cardTitle}>{item.title}</Text>

              {!!item.building && (
                <Text style={styles.cardLocation}>
                  {item.building.buildingName}
                  {item.roomNumber ? `, ${item.roomNumber}` : ""}
                </Text>
              )}

              {!!item.description && (
                <Text style={styles.cardDescription}>{item.description}</Text>
              )}

              {!!item.foodType && (
                <Text style={styles.cardMeta}>
                  Food type: {item.foodType.typeName}
                </Text>
              )}

              {!!item.dietaryOptions?.length && (
                  <Text style={styles.cardMeta}>
                    Dietary options: {item.dietaryOptions.map((d) => d.optionName).join(", ")}
                  </Text>
              )}

              {!!item.directions && (
                <Text style={styles.cardMeta}>
                  Directions: {item.directions}
                </Text>
              )}

              {(item.availableFrom || item.availableUntil) && (
                <Text style={styles.cardMeta}>
                  {item.availableFrom
                    ? `From: ${formatDateTime(item.availableFrom)} `
                    : ""}
                  {item.availableUntil
                    ? `To: ${formatDateTime(item.availableUntil)}`
                    : ""}
                </Text>
              )}

              {item.servingsMin != null && (
                  <Text style={styles.cardMeta}>
                    Minimum # of servings: {item.servingsMin}
                  </Text>
              )}

              {item.servingsMax != null && (
                  <Text style={styles.cardMeta}>
                    Maximum # of servings: {item.servingsMax}
                  </Text>
              )}


            </Pressable>
          )}}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  stateContainer: {
    paddingVertical: 24,
    alignItems: "center",
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#FFFFFF",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
  },
  separator: {
    marginVertical: 16,
    height: 1,
    width: "100%",
    backgroundColor: "#eee",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  statusText: {
    fontSize: 14,
    color: "#666",
  },
  emptyText: {
    fontSize: 14,
    color: "#888",
  },
  errorText: {
    fontSize: 14,
    color: "red",
    marginBottom: 8,
  },
  listContent: {
    paddingVertical: 8,
  },
  card: {
    borderWidth: 1,
    borderColor: "#005CA9",
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    backgroundColor: "#E9F2FB",
  },
  cardPressed: {
    opacity: 0.9,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  cardLocation: {
    fontSize: 14,
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 14,
    marginTop: 4,
  },
  cardImage: {
    width: "100%",
    height: 140,
    borderRadius: 8,
    marginBottom: 8,
  },
  cardMeta: {
    marginTop: 4,
    fontSize: 13,
    fontStyle: "italic",
  },
});