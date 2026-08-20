import React, { useCallback, useState } from "react";
import { Alert, FlatList, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "expo-router";
import { Event, fetchAllEvents, closeEvent } from "@/lib/api";
import { AdminRouteGuard } from "@/components/admin-route-guard";

export default function AdminEventsScreen() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadAllEvents = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await fetchAllEvents();
      setEvents(data);
    } catch (err) {
      console.error("Error fetching all events:", err);
      setError("Could not load events.");
    } finally {
      setLoading(false);
    }
  }, []);

  const performClose = useCallback(
    async (eventId: number) => {
      try {
        await closeEvent(eventId);
        await loadAllEvents();
      } catch (err) {
        console.error("Error closing event:", err);
        Alert.alert("Error", "Could not close the event. Please try again.");
      }
    },
    [loadAllEvents]
  );

  const handleClose = useCallback(
    (eventId: number, eventTitle: string) => {
      const message = `Close "${eventTitle}"? This will move it to closed for everyone.`;
      if (Platform.OS === "web") {
        if (window.confirm(message)) {
          performClose(eventId);
        }
        return;
      }
      Alert.alert("Close event?", message, [
        { text: "Cancel", style: "cancel" },
        {
          text: "Close",
          style: "destructive",
          onPress: () => performClose(eventId),
        },
      ]);
    },
    [performClose]
  );

  // Reload whenever the tab regains focus so newly created, edited, or closed
  // events show without needing a remount.
  useFocusEffect(
    useCallback(() => {
      loadAllEvents();
    }, [loadAllEvents])
  );

  const activeEvents = events.filter(
    (event) => event.status === "active"
  );

  const closedEvents = events.filter(
    (event) => event.status === "closed"
  );

  const formatDateTime = (value?: string | null) => {
    if (!value) return "";
    try {
      return new Date(value).toLocaleString();
    } catch {
      return value;
    }
  };

  return (
    <AdminRouteGuard>
    <View style={styles.container}>
      <Text style={styles.title}>All Events</Text>
      <Text style={styles.subtitle}>
        View active and closed events from all organizers
      </Text>

      <View style={styles.separator} />

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
          <Text style={styles.emptyText}>No events found.</Text>
        </View>
      ) : (
        <FlatList
          data={[
            {
                title: "Active Events",
                events: activeEvents,
            },
            {
                title: "Closed Events",
                events: closedEvents,
            },
          ]}
          keyExtractor={(section) => section.title}
          contentContainerStyle={styles.listContent}
          renderItem={({ item: section }) => (
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>
                    {section.title} ({section.events.length})
                </Text>

                {section.events.length === 0 ? (
                    <Text style={styles.emptyText}>
                        No {section.title.toLowerCase()}.
                    </Text>
                ) : (
                    section.events.map((event) => (
                        <View
                          key={event.id}
                          style={styles.card}
                        >
                            <Text style={styles.cardTitle}>{event.title}</Text>
                            
                            {!!event.building && (
                                <Text style={styles.cardLocation}>
                                    {event.building.buildingName}
                                    {event.roomNumber ? `, Room ${event.roomNumber}` : ""}
                                </Text>
                            )}

                            <Text style={styles.cardStatus}>
                                Status: {event.status}
                            </Text>

                            {(event.availableFrom || event.availableUntil) && (
                                <Text style={styles.cardMeta}>
                                    {event.availableFrom
                                        ? `From: ${formatDateTime(event.availableFrom)}`
                                        : ""}
                                    {event.availableUntil
                                        ? ` To: ${formatDateTime(event.availableUntil)}`
                                        : ""}
                                </Text>
                            )}
                            {event.status === "active" && (
                                <Pressable
                                    style={({ pressed }) => [
                                        styles.closeButton,
                                        pressed && styles.closeButtonPressed,
                                    ]}
                                    onPress={() => handleClose(event.id, event.title)}
                                >
                                    <Text style={styles.closeButtonText}>Close event</Text>
                                </Pressable>
                            )}
                        </View>
                    ))
                )}
            </View>
          )}
        />
      )}
    </View>
    </AdminRouteGuard>
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
  closeButton: {
    marginTop: 10,
    backgroundColor: "#B00020",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignSelf: "flex-start",
  },
  closeButtonPressed: {
    opacity: 0.85,
  },
  closeButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#00235D",
    marginBottom: 10,
  },
});
