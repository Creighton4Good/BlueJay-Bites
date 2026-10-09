import React, { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Button,
    Linking,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";

import { Stack, router, useLocalSearchParams, useFocusEffect } from "expo-router";
import { Event, closeEvent, fetchEventById } from "@/lib/api";
import { useSession } from "@/app/contexts/session-context";

/**
 * Shared event-details screen.
 * 
 * Displays the full details for a single food event. This route can be opened
 * from several places in the app, including the dashboard and map views.
 * 
 * The event is reloaded whenever this screen regains focus so edits made on
 * another screen are immediately reflected when the user returns.
 * 
 * Event-management controls are shown based on the authenticated user's role
 * and relationship to the event. Backend autheorization remains the final
 * source of truth for edit/close operations.
 */

/*
    Build a platform-specific maps URL from a building's coordinates.

    - iOS opens Apple Maps
    - Android opens the device's map handler
    - Web falls back to Google Maps
*/
function getDirectionsUrl(latitude: number, longitude: number, label?: string) {
    const latLng = `${latitude},${longitude}`;
    const encodedLabel = label ? encodeURIComponent(label) : "Food Event";
    return Platform.select({
        ios: `maps:0,0?q=${encodedLabel}@${latLng}`,
        android: `geo:0,0?q=${latLng}(${encodedLabel})`,
        default: `https://www.google.com/maps/search/?api=1&query=${latLng}`,
    })!;
}

export default function EventDetailsScreen() {
    /*
        `id` identifies the event to load.

        `from` is optional navigation context supplied by the screen that opened
        this route. It is currently used to customize the back-button label.
    */
    const { id, from } = useLocalSearchParams<{
        id: string;
        from?: string;
    }>();

    const [event, setEvent] = useState<Event | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    /*
        Session data is used to determine whether the current user may see
        event-management controls.
    */
    const { 
        user, 
        loading: sessionLoading,
        isOrganizer, 
        isAdmin,
    } = useSession();

    /*
        Fetch the latest version of the event from the backend.

        Memoized because it is called by useFocusEffect whenever the screen
        becomes active again.
    */
    const loadEvent = React.useCallback(async () => {
        if (!id) {
            setError("Missing event id.");
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const data = await fetchEventById(Number(id));
            setEvent(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Could not load event details.");
        } finally {
            setLoading(false);
        }
    }, [id]);

    /*
        Reload whenever the user returns to this screen.

        This prevents stale event information after editing an event elsewhere.
    */
    useFocusEffect(
        React.useCallback(() => {
            loadEvent();
        }, [loadEvent])
    );

    // Format backend date-time strings using the user's local date/time settings.
    const formatDateTime = (value?: string | null) => {
        if (!value) return "";
        try {
            return new Date(value).toLocaleString();
        } catch {
            return value;
        }
    };

    /*
        Open the event building in the device's map application.
        The button is only rendered when both latitude and longitude exist.
    */
    const handleGetDirections = () => {
        const lat = event?.building?.latitude;
        const lng = event?.building?.longitude;
        if (lat == null || lng == null) return;
        const url = getDirectionsUrl(lat, lng, event?.building?.buildingName);
        Linking.openURL(url).catch((err) =>
            console.error("Failed to open maps:", err)
        );
    };

    /*
        Close an active event after confirmation.

        Web uses browser confirm/alert dialogs, while native platforms use
        React Native Alert dialogs.

        After a successful close, the user is returned to the main dashboard.
    */
    const handleCloseEvent = async () => {
        if (!event) return;

        if (Platform.OS === "web") {
            const confirmed = window.confirm(
                "Are you sure you want to close this event? It will no longer appear in active event views."
            );

            if (!confirmed) return;

            try {
                await closeEvent(event.id);
                window.alert("Event closed successfully.");
                router.replace("/");
            } catch (err: any) {
                console.error("Error closing event:", err);
                window.alert(
                    err.message ?? "Something went wrong while closing the event."
                );
            }

            return;
        }

        Alert.alert(
            "Close Event",
            "Are you sure you want to close this event? It will no longer appear in active event views.",
            [
                { text: "Cancel", style: "cancel" },
                { 
                    text: "Close Event",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await closeEvent(event.id);
                            Alert.alert("Success", "Event closed successfully.", [
                                {
                                    text: "OK",
                                    onPress: () => {
                                        router.replace("/");
                                    },
                                },
                            ]);
                        } catch (err: any) {
                            console.error("Error closing event:", err);
                            Alert.alert(
                                "Error",
                                err.message ?? "Something went wrong while closing the event."
                            );
                        }
                    },
                },
            ]
        );
    };

    // Render dedicated states before attempting to display event content.
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

    if (!event) {
        return (
            <View style={styles.centered}>
                <Text style={styles.errorText}>Event not found.</Text>
            </View>
        );
    }

    // Directions are available only when both coordinates were saved.
    const hasCoordinates =
        event.building?.latitude != null && event.building?.longitude != null;

    // Organizers may manage only events that they created.
    const isCreator = event.createdBy?.id === user?.id;

    /*
        Determine whether management controls should be visible.

        Current behavior:
        - admins may manage any event
        - organizers may manage only events they created

        This frontend check controls visibility only; backend authorization
        should still enforce the same permissions.
    */
    const canManage =
        !sessionLoading &&
        !!user &&
        (isAdmin || (isOrganizer && isCreator));

    return (
        <>
            <Stack.Screen
                options={{
                    title: "Event Details",

                    /*
                        Preserve naviagtion context in the back-button label.
                        Currently only map is treated specially.
                    */
                    headerBackTitle: from === "map" ? "Map" : "Dashboard",
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
                    <Text style={styles.bodyText}>{event.roomNumber}</Text>
                )}

                {!!event.directions && (
                    <Text style={styles.bodyText}>Directions: {event.directions}</Text>
                )}

                {hasCoordinates && (
                    <Pressable
                        style={({ pressed }) => [
                            styles.directionsButton,
                            pressed && styles.directionsButtonPressed,
                        ]}
                        onPress={handleGetDirections}
                    >
                        <Text style={styles.directionsButtonText}>Get Directions</Text>
                    </Pressable>
                )}

                {!!event.foodType && (
                    <>
                        <Text style={styles.sectionTitle}>Food Type</Text>
                        <Text style={styles.bodyText}>{event.foodType.typeName}</Text>
                    </>
                )}

                {!!event.dietaryOptions?.length && (
                    <>
                        <Text style={styles.sectionTitle}>Dietary Options</Text>
                        <Text style={styles.bodyText}>{event.dietaryOptions.map((d) => d.optionName).join(", ")}</Text>
                    </>
                )}

                {event.servingsMin != null && (
                    <>
                        <Text style={styles.sectionTitle}>Minimum # of servings</Text>
                        <Text style={styles.bodyText}>{event.servingsMin}</Text>
                    </>
                )}

                {event.servingsMax != null && (
                    <>
                        <Text style={styles.sectionTitle}>Maximum # of servings</Text>
                        <Text style={styles.bodyText}>{event.servingsMax}</Text>
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

                {/*
                    Management actions are shown only when canManage is true.
                    Closed events cannot be closed again.
                */}
                {canManage && (
                  <>
                    <View style={styles.buttonWrapper}>
                        <Button
                            title="Edit Event"
                            onPress={() =>
                                router.push({
                                    pathname: "/events/[id]/edit",
                                    params: { id: String(event.id) },
                                })
                            }
                        />
                    </View>
                    
                    {event.status === "active" && (
                        <View style={styles.buttonWrapper}>
                            <Button
                                title="Close Event"
                                onPress={handleCloseEvent}
                                color="#C62828"
                            />
                        </View>
                    )}
                  </>
                )}
            </ScrollView>
        </>
    );
}

const styles = StyleSheet.create({
    buttonWrapper: {
        marginTop: 24,
    },
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
    directionsButton: {
        marginTop: 12,
        backgroundColor: "#005CA9",
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        alignItems: "center",
    },
    directionsButtonPressed: {
        opacity: 0.85,
    },
    directionsButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
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
    }
});
