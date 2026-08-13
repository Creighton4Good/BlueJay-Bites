import React, { useCallback, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { router, useFocusEffect } from "expo-router";
import { Event, fetchAllEvents } from "@/lib/api";
import { AdminRouteGuard } from "@/components/admin-route-guard";

/**
 * Admin-only screen for viewing all events in the system.
 * 
 * Unlike the regular event feed or "My Events" screen, this page loads events 
 * created by every organizer and separates them into active and closed groups.
 * 
 * Access is wrapped in `AdminRouteGuard`, which prevents non-admin users from
 * using the screen event if they navigate directly to the route.
 */
export default function AdminEventsScreen() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /*
    Fetch the complete event list from the backend.

    This function is wrapped in `useCallback` because it is used insie
    `useFocusEffect` below.
   */
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

  /*
    Reload whenever this tab regains focus.

    This keeps the admin list current after an event is created, edited,
    or closed elsewhere in the app without requiring the screen to remount.
  */
  useFocusEffect(
    useCallback(() => {
      loadAllEvents();
    }, [loadAllEvents])
  );

  // Split the backend response into the two sections shown on this screen.
  const activeEvents = events.filter(
    (event) => event.status === "active"
  );

  const closedEvents = events.filter(
    (event) => event.status === "closed"
  );

  /*
    Convert backend date/time strings into a readable local date/time. 
    Falls back to the original value if parsing fails.
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
    <AdminRouteGuard>
    <View style={styles.container}>
      <Text style={styles.title}>All Events</Text>
      <Text style={styles.subtitle}>
        View active and closed events from all organizers
      </Text>

      <View style={styles.separator} />

      {/* Handle loading, error, and empty states before rendering the list. */}
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
          // The FlatList contains two logical sections rather than individual
          // events: one for active events and one for closed events.
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
                        <Pressable
                            key={event.id}
                            style={({ pressed }) => [
                                styles.card,
                                pressed && styles.cardPressed,
                            ]}
                            // Open the shared event-details route. The `from`
                            // parameter allows the details screen to know that the 
                            // user arrived from the admin event list.
                            onPress={() =>
                                router.push({
                                    pathname: "/events/[id]",
                                    params: {
                                        id: String(event.id),
                                        from: "admin-events",
                                    },
                                })
                            }
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
                        </Pressable>
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
