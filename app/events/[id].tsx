import React, { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from "react-native";
import { Stack, useLocalSearchParams } from "expo-router";
import { Event, fetchEventById } from "@/lib/api";

export default function EventDetailsScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const [event, setEvent] = useState<Event | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadEvent = async () => {
            if (!id) {
                setError("Missing event id.");
                setLoading(false);
                return;
            }  

            try {
                const data = await fetchEventById(Number(id));
                setEvent(data);
            } catch (err: any) {
                console.error("Error fetching event details: ", err);
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

    if (!event) {
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
                    headerBackTitle: "Dashboard",
                }} 
            />
            <ScrollView contentContainerStyle={styles.container}>
                <Text style={styles.title}>{event.title}</Text>

                {!!event.description && (
                    <>
                        <Text style={styles.sectionTitle}>Description</Text>
                        <Text style={styles.bodyText}>{event.description}</Text>
                    </>
                )}

                <Text style={styles.sectionTitle}>Location</Text>

                {!!event.building && (
                    <Text style={styles.bodyText}>Building: {event.building.buildingName}</Text>
                )}

                {!!event.roomNumber && (
                    <Text style={styles.bodyText}>Room: {event.roomNumber}</Text>
                )}

                {!!event.directions && (
                    <Text style={styles.bodyText}>Directions: {event.directions}</Text>
                )}

                {!!event.foodType && (
                    <>
                        <Text style={styles.sectionTitle}>Food Type</Text>
                        <Text style={styles.bodyText}>{event.foodType.typeName}</Text>
                    </>
                )}

                {(event.availableFrom || event.availableUntil) && ( 
                    <>
                        <Text style={styles.sectionTitle}>Availability</Text>
                        {!!event.availableFrom && (
                            <Text style={styles.bodyText}>
                                From: {formatDateTime(event.availableFrom)}
                            </Text>
                        )}
                        {!!event.availableUntil && (
                            <Text style={styles.bodyText}>
                                Until: {formatDateTime(event.availableUntil)}
                            </Text>
                        )}
                    </>
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
});