import React, { useEffect, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { Event, fetchMyEvents } from "@/lib/api";

// TODO: Replace with the signed-in user's id once SSO/auth is wired up.
// For now this is the test event_organizer account (id 1).
const CURRENT_USER_ID = 1;

export default function MyEventsScreen() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadMyEvents = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchMyEvents(CURRENT_USER_ID);
      setEvents(data);
    } catch (err: any) {
      console.error("Error fetching my events:", err);
      setError("Could not load your events.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMyEvents();
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
      <Text style={styles.title}>My Events</Text>
      <Text style={styles.subtitle}>Events you have created</Text>

      <View style={styles.separator} />

      {loading ? (
        <View style={styles.stateContainer}>
          <Text style={styles.statusText}>Loading your events...</Text>
        </View>
      ) : error ? (
        <View style={styles.stateContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : events.length === 0 ? (
        <View style={styles.stateContainer}>
          <Text style={styles.emptyText}>You have not created any events yet.</Text>
        </View>
      ) : (
        <FlatList
          data={events}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <Pressable
              style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
              onPress={() =>
                router.push({
                  pathname: "/events/[id]",
                  params: { id: String(item.id), from: "my-events" },
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

              <Text style={styles.cardStatus}>Status: {item.status}</Text>

              {(item.availableFrom || item.availableUntil) && (
                <Text style={styles.cardMeta}>
                  {item.availableFrom ? `From: ${formatDateTime(item.availableFrom)} ` : ""}
                  {item.availableUntil ? `To: ${formatDateTime(item.availableUntil)}` : ""}
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
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#FFFFFF",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 4,
    color: "#00235D",
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
  stateContainer: {
    paddingVertical: 24,
    alignItems: "center",
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
    color: "#00235D",
  },
  cardLocation: {
    fontSize: 14,
    marginBottom: 4,
  },
  cardStatus: {
    fontSize: 13,
    color: "#444",
    marginTop: 2,
  },
  cardMeta: {
    marginTop: 4,
    fontSize: 13,
    fontStyle: "italic",
  },
});
