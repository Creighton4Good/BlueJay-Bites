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

export default function BuildingEventsScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();

    const [events, setEvents] = useState<Event[]>([]);
    const [buildingName, setBuildingName] = useState<string>("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

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

    const formatDateTime = (value?: string | null) => {
        if (!value) return "";
        try {
            return new Date(value).toLocaleString();
        } catch {
            return value;
        }
    };

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
