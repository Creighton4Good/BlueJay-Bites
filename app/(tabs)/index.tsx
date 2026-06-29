import React, { useEffect, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { Event, fetchEvents } from "@/lib/api";

export default function HomeScreen() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadEvents = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await fetchEvents();
      setEvents(data);
    } catch (err: any) {
      console.error("Error fetching events:", err);
      setError("Could not load active food events.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

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
          renderItem={({ item }) => (
            <Pressable
              style={({ pressed }) => [
                styles.card,
                pressed && styles.cardPressed,
              ]}
              onPress={() =>
                router.push({
                  pathname: "/events/[id]",
                  params: { id: String(item.id), from: "dashboard" },
                })
              }
            >
              <Text style={styles.cardTitle}>{item.title}</Text>

              {!!item.building && (
                <Text style={styles.cardLocation}>
                  {item.building.buildingName}
                  {item.roomNumber ? `, Room ${item.roomNumber}` : ""}
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
            </Pressable>
          )}
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
  cardMeta: {
    marginTop: 4,
    fontSize: 13,
    fontStyle: "italic",
  },
});