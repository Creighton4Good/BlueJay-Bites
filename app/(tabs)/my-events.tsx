import React, { useCallback, useState } from "react";
import { Alert, FlatList, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { router, useFocusEffect } from "expo-router";
import { closeEvent, Event, fetchMyEvents } from "@/lib/api";

/**
 * Organizer/admin screen for managing events created by the current user.
 * 
 * This screen:
 * - loads only events owned by the authenticated user
 * - refreshes whenever the tab regains focus
 * - allows active events to be edited or closed
 * - allows closed events to remain visible for reference
 * 
 * Ownership is determined by the backend session through `fetchMyEvents()`;
 * the frontend does not pass a user ID when requesting this list.
 */
export default function MyEventsScreen() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Tracks which event is currently being closed so only that action is disabled.
  const [closingEventId, setClosingEventId] = useState<number | null>(null);

  /*
    Fetch events created by the current authenticated user.
  */
  const loadMyEvents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchMyEvents();
      setEvents(data);
    } catch (err: any) {
      console.error("Error fetching my events:", err);
      setError("Could not load your events.");
    } finally {
      setLoading(false);
    }
  }, []);

  /*
    Reload whenever this tab regains focus.

    This keeps the list current after an event is created, edited, or closed
    elsewhere in the app without requiring the screen to remount.
  */
  useFocusEffect(
    useCallback(() => {
      loadMyEvents();
    }, [loadMyEvents])
  );

  /*
    Open the shared edit-event route.

    The `from` parameter lets the destination screen know that navigation
    originated from My Events.
  */
  const handleEdit = (eventId: number) => {
    router.push({
      pathname: "/events/[id]/edit",
      params: { id: String(eventId), from: "my-events" },
    });
  };

  /*
    Confirm and clsoe an active event.

    Web uses `window.confirm()` because React Native's `Alert.alert()` does not 
    reliably provide confirmation dialogs in the browser. Native platforms use the standard React Native Alert API.

    After the backend closes the event, the list is refreshed so the new status 
    appears immediately.
  */
  const handleClose = (event: Event) => {
    const closeSelectedEvent = async () => {
      setClosingEventId(event.id);

      try {
        await closeEvent(event.id);
        await loadMyEvents();
      } catch (err) {
        console.error("Error closing event:", err);

        if (Platform.OS === "web") {
          window.alert("Something went wrong while closing this event.");
        } else {
          Alert.alert(
            "Could not close event",
            "Something went wrong while closing this event."
          );
        }
      } finally {
        setClosingEventId(null);
      }
    };

    if (Platform.OS === "web") {
      const confirmed = window.confirm(
        `Are you sure you want to close "${event.title}"?`
      );

      if (confirmed) {
        void closeSelectedEvent();
      }

      return;
    }

    Alert.alert(
      "Close event?",
      `Are you sure you want to close "${event.title}"?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Close Event",
          style: "destructive",
          onPress: closeSelectedEvent,
        },
      ]
    );
  };

  /*
    Format backend date/time values using the device's local display format.
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
    <View style={styles.container}>
      <Text style={styles.title}>My Events</Text>
      <Text style={styles.subtitle}>Events you have created</Text>

      <View style={styles.separator} />

      {/* Handle loading, error, and empty states before rendering event cards. */}
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
          renderItem={({ item }) => {
            const isClosing = closingEventId === item.id;
            const isClosed = item.status === "closed";

            return(
              <View style={styles.card}>
                <Pressable
                  style={({ pressed }) => [styles.cardContent, pressed && styles.cardPressed]}
                  // Open the shared event-details screen.
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

              <View style={styles.actionRow}>
                <Pressable
                  style={({ pressed }) => [
                    styles.actionButton,
                    styles.editButton,
                    pressed && styles.actionButtonPressed,
                  ]}
                  onPress={() => handleEdit(item.id)}
                >
                  <Text style={styles.editButtonText}>Edit</Text>
                </Pressable>

                {/*
                  Closed events remain visible, but cannot be closed again.
                  While a close request is running, only that event's button
                  is disabled and shows "Closing...".
                */}
                {!isClosed && (
                  <Pressable
                    style={({ pressed }) => [
                      styles.actionButton,
                      styles.closeButton,
                      (pressed || isClosing) && styles.actionButtonPressed,
                    ]}
                    onPress={() => handleClose(item)}
                    disabled={isClosing}
                  >
                    <Text style={styles.closeButtonText}>
                      {isClosing ? "Closing..." : "Close Event"}
                    </Text>
                  </Pressable>
                )}
              </View>
            </View>
          );
        }}
      />)}
    </View>
  )
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
    marginBottom: 10,
    backgroundColor: "#E9F2FB",
    overflow: "hidden",
  },
  cardContent: {
    padding: 12,
  },
  cardPressed: {
    opacity: 0.9,
  },
  actionRow: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  editButton: {
    borderWidth: 1,
    borderColor: "#005CA9",
    backgroundColor: "#FFFFFF",
  },
  editButtonText: {
    color: "#005CA9",
    fontWeight: "600",
  },
  closeButton: {
    backgroundColor: "#B42318",
  },
  closeButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  actionButtonPressed: {
    opacity: 0.65,
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
