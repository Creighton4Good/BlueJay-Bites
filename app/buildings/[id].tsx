import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { Stack, router, useLocalSearchParams } from "expo-router";
import { Event, fetchEvents } from "@/lib/api";

/**
 * Building-specific event list opened from the campus map.
 * 
 * The building ID comes from the dynamic route `/buildings/[id]`.
 * This screen currently fetches the active-event feed and filters it
 * client-side to only events associated with the selected building.
 * 
 * If a dedicated backend endpoint for building events is added later,
 * this screen can be updated to fetch only the relevant events directly.
 */
export default function BuildingEventsScreen() {
    // Dynamic route parameter supplied by `/buildings/[id]`.
    const { id } = useLocalSearchParams<{ id: string }>();

    const [events, setEvents] = useState<Event[]>([]);
    const [buildingName, setBuildingName] = useState<string>("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    /*
        Load active events and keep only those assigned to this building.

        The building name is taken from the first matching event because this
        screen currently receives only the building ID through the route.
    */
    useEffect(() => {
        const loadEvents = async () => {
            if (!id) {
                setError("Missing building id.");
                setLoading(false);
                return;
            }

            try {
                const all = await fetchEvents();
                const atBuilding = all.filter(
                    (e) => e.building?.id === Number(id)
                );
                setEvents(atBuilding);
                if (atBuilding.length > 0 && atBuilding[0].building?.buildingName) {
                    setBuildingName(atBuilding[0].building.buildingName);
                }
            } catch (err: any) {
                console.error("Error fetching building events: ", err);
                setError("Could not load events for this building.");
            } finally {
                setLoading(false);
            }
        };

        loadEvents();
    }, [id]);

    /*
        Format backend date/time values using the device's local display format.
        Falls back to the original vlaue if parsing fails.
    */
    const formatDateTime = (value?: string | null) => {
        if (!value) return "";
        try {
            return new Date(value).toLocaleString();
        } catch {
            return value;
        }
    };

    /*
        Open the shared event-details screen.

        The `from: "map"` parameter tells the event-details route that navigation
        originated from the map/building flow so it can preserve appropriate
        back-navigation behavior.
    */
    const openEvent = (eventId: number) => {
        router.push({
            pathname: "/events/[id]",
            params: { id: String(eventId), from: "map" },
        });
    };

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator />
                <Text style={styles.statusText}>Loading events...</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.centered}>
                <Text style={styles.errorText}>{error}</Text>
            </View>
        );
    }

    return (
        <>
            {/*
                Configure the route header dynamically once the building name is known.
                The back title reflects that this screen is normally reached from Map.
            */}
            <Stack.Screen
                options={{
                    title: buildingName || "Building Events",
                    headerBackTitle: "Map",
                }}
            />
            <ScrollView contentContainerStyle={styles.container}>
                <Text style={styles.title}>{buildingName || "This building"}</Text>
                <Text style={styles.subtitle}>
                    {events.length} {events.length === 1 ? "event" : "events"} here
                </Text>

                {events.length === 0 ? (
                    <Text style={styles.emptyText}>
                        No active events at this building right now.
                    </Text>
                ) : (
                    events.map((event) => (
                        <Pressable
                            key={event.id}
                            style={({ pressed }) => [
                                styles.card,
                                pressed && styles.cardPressed,
                            ]}
                            onPress={() => openEvent(event.id)}
                        >
                            <Text style={styles.cardTitle}>{event.title}</Text>
                            {!!event.roomNumber && (
                                <Text style={styles.cardMeta}>Room {event.roomNumber}</Text>
                            )}
                            {!!event.availableUntil && (
                                <Text style={styles.cardMeta}>
                                    Until {formatDateTime(event.availableUntil)}
                                </Text>
                            )}
                        </Pressable>
                    ))
                )}
            </ScrollView>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
        backgroundColor: "#fff",
    },
    centered: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
        backgroundColor: "#fff",
    },
    title: {
        fontSize: 26,
        fontWeight: "bold",
        marginBottom: 4,
        color: "#00235D",
    },
    subtitle: {
        fontSize: 14,
        color: "#666",
        marginBottom: 16,
    },
    card: {
        borderWidth: 1,
        borderColor: "#005CA9",
        borderRadius: 8,
        padding: 14,
        marginBottom: 10,
        backgroundColor: "#E9F2FB",
    },
    cardPressed: {
        opacity: 0.85,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#00235D",
        marginBottom: 4,
    },
    cardMeta: {
        fontSize: 13,
        color: "#444",
        marginTop: 2,
    },
    statusText: {
        marginTop: 8,
        fontSize: 14,
        color: "#666",
    },
    emptyText: {
        fontSize: 14,
        color: "#888",
    },
    errorText: {
        fontSize: 16,
        color: "red",
        textAlign: "center",
    },
});
