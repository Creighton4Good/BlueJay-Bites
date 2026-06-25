import React, { useEffect, useState } from "react";
import { ActivityIndicator, Button, ScrollView, StyleSheet, Text, View } from "react-native";
import { Stack, router, useLocalSearchParams } from "expo-router";
import { Event, fetchEventById } from "@/lib/api";

export default function EventDetailsScreen() {
    const { id, from } = useLocalSearchParams<{
        id: string;
        from?: string;
    }>();

    const [currentEvent, setCurrentEvent] = useState<Event | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadEvent = async () => {
            if (!id) {
                setError("Missing even id.");
                setLoading(false);
                return;
            }

            try {
                const data = await fetchEventById(Number(id));
                setCurrentEvent(data);
            } catch (err: any) {
                console.error("Error fetching event details:", err);
                setError("Could not load event details.");
            } finally {
                setLoading(false);
            }
        };

        loadEvent();
    }, [id]);

    const formatDateTime = (value?: string | null) => {
        if (!value) return "";
        try {
            return new Date(value).toLocaleString();
        } catch {
            return value;
        }
    };

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator />
                <Text style={styles.statusText}>Loading event details...</Text>
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

    if (!currentEvent) {
        return (
            <View style={styles.centered}>
                <Text style={styles.errorText}>Event not found.</Text>
            </View>
        );
    }

    return (
        <>
            <Stack.Screen
                options={{
                    title: "Event Details",
                    headerBackTitle: from === "map" ? "Map" : "Dashboard",
                }}
            />
            <ScrollView contentContainerStyle={styles.container}>
                <Text style={styles.title}>{currentEvent.title}</Text>

                {!!currentEvent.description && (
                    <>
                        <Text style={styles.sectionTitle}>Description</Text>
                        <Text style={styles.bodyText}>{currentEvent.description}</Text>
                    </>
                )}

                <Text style={styles.sectionTitle}>Location</Text>

                {!!currentEvent.building && (
                    <Text style={styles.bodyText}>
                        Building: {currentEvent.building.buildingName}
                    </Text>
                )}

                {!!currentEvent.roomNumber && (
                    <Text style={styles.bodyText}>Room: {currentEvent.roomNumber}</Text>
                )}

                {!!currentEvent.directions && (
                    <Text style={styles.bodyText}>Directions: {currentEvent.directions}</Text>
                )}

                {!!currentEvent.foodType && (
                    <>
                        <Text style={styles.sectionTitle}>Food Type</Text>
                        <Text style={styles.bodyText}>{currentEvent.foodType.typeName}</Text>
                    </>
                )}

                {(currentEvent.availableFrom || currentEvent.availableUntil) && (
                    <>
                        <Text style={styles.sectionTitle}>Availability</Text>
                        {!!currentEvent.availableFrom && (
                            <Text style={styles.bodyText}>
                                From: {formatDateTime(currentEvent.availableFrom)}
                            </Text>
                        )}
                        {!!currentEvent.availableUntil && (
                            <Text style={styles.bodyText}>
                                Until: {formatDateTime(currentEvent.availableUntil)}
                            </Text>
                        )}
                    </>
                )}

                <View style={styles.buttonWrapper}>
                    <Button
                        title="Edit Event"
                        onPress={() =>
                            router.push({
                                pathname: "/events/[id]/edit",
                                params: { id: String(currentEvent.id) },
                            })
                        }
                    />
                </View>
            </ScrollView>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
        backgroundColor: "#fff",
        paddingBottom: 40,
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
        marginBottom: 16,
        color: "#00235D",
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "600",
        marginTop: 16,
        marginBottom: 6,
        color: "#005CA9",
    },
    bodyText: {
        fontSize: 16,
        lineHeight: 22,
        color: "#222",
    },
    statusText: {
        marginTop: 8,
        fontSize: 14,
        color: "#666",
    },
    errorText: {
        fontSize: 16,
        color: "red",
        textAlign: "center",
    },
    buttonWrapper: {
        marginTop: 24,
    },
});