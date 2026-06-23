import React, { useEffect, useState } from "react";
import {
    Alert, 
    Button, 
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Stack, useLocalSearchParams } from "expo-router";
import {
    Building,
    Event,
    fetchBuildings,
    fetchEventById,
    NewEvent,
    updateEvent,
} from "@/lib/api";

export default function EditEventScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [directions, setDirections] = useState("");
    const [roomNumber, setRoomNumber] = useState("");

    const [buildings, setBuildings] = useState<Building[]>([]);
    const [selectedBuildingId, setSelectedBuildingId] = useState<number | null>(null);
    const [loadingBuildings, setLoadingBuildings] = useState(false);
    const [loadingEvent, setLoadingEvent] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);

    const [availableFrom, setAvailableFrom] = useState<Date | null>(null);
    const [availableUntil, setAvailableUntil] = useState<Date | null>(null);
    const [showFromPicker, setShowFromPicker] = useState(false);
    const [showUntilPicker, setShowUntilPicker] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const loadBuildings = async () => {
            setLoadingBuildings(true);
            try {
                const data = await fetchBuildings();
                setBuildings(data);
            } catch (err) {
                console.error("Error fetching buildings:", err);
                Alert.alert("Error", "Could not load building options.");
            } finally {
                setLoadingBuildings(false);
            }
        };

        loadBuildings();
    }, []);

    useEffect(() => {
        const loadEvent = async () => {
            if (!id) {
                Alert.alert("Missing event id.");
                setLoadingEvent(false);
                return;
            }

            try {
                const event: Event = await fetchEventById(Number(id));

                setTitle(event.title ?? "");
                setDescription(event.description ?? "");
                setDirections(event.directions ?? "");
                setRoomNumber(event.roomNumber ?? "");
                setSelectedBuildingId(event.building?.id ?? null);
                setAvailableFrom(event.availableFrom ? new Date(event.availableFrom) : null);
                setAvailableUntil(event.availableUntil ? new Date(event.availableUntil) : null);
            } catch (err) {
                console.error("Error fetching event:", err);
                Alert.alert("Could not load event details.");
            } finally {
                setLoadingEvent(false);
            }
        };

        loadEvent();
    }, [id]);

    const formatDisplayDateTime = (date: Date | null) => {
        if (!date) return "";

        return date.toLocaleString([], {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit",
        });
    };

    const handleSubmit = async () => {
        if (!id) {
            Alert.alert("Error", "Missing event id.");
            return;
        }

        if (!title.trim()) {
            Alert.alert("Missing title", "Please enter a title for the event.");
            return;
        }

        if (!description.trim()) {
            Alert.alert("Missing description", "Please enter a description for the event.");
            return;
        }

        if (!selectedBuildingId) {
            Alert.alert("Missing building", "Please select a building for this event.");
            return;
        }

        if (!availableFrom || !availableUntil) {
            Alert.alert(
                "Missing availability",
                "Please enter both start and end times."
            );
            return;
        }

        if (availableUntil <= availableFrom) {
            Alert.alert(
                "Invalid time range",
                "Available until must be after available from."
            );
            return;
        }

        const now = new Date().toISOString();

        const payload: NewEvent = {
            title: title.trim(),
            description: description.trim(),
            building: { id: selectedBuildingId },
            directions: directions.trim() || undefined,
            roomNumber: roomNumber.trim() || undefined,
            availableFrom: availableFrom.toISOString(),
            availableUntil: availableUntil.toISOString(),
            createdBy: { id: 1 },
            status: "active",
            updatedAt: now,
        };

        setSubmitting(true);

        try {
            await updateEvent(Number(id), 1, payload);
            Alert.alert("Success", "Food event updated successfully!");
        } catch (err: any) {
            console.error("Error updating event:", err);
            Alert.alert(
                "Error",
                err.message ?? "Something went wrong while updating the event."
            );
        } finally {
            setSubmitting(false);
        }
    };

    if (loadingEvent) {
        return (
            <View style={styles.centered}>
                <Text style={styles.subText}>Loading event...</Text>
            </View>
        );
    }

    if (loadError) {
        return (
            <View style={styles.centered}>
                <Text style={styles.errorText}>{loadError}</Text>
            </View>
        );
    }

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
            <>
                <Stack.Screen options={{ title: "Edit Event" }} />
                <ScrollView contentContainerStyle={styles.container}>
                    <Text style={styles.bigText}>Edit Food Event</Text>
                    <Text style={styles.subText}>
                        Prototype mode: editing as test organizer
                    </Text>

                    <TextInput
                        style={styles.input}
                        placeholder="Title *"
                        placeholderTextColor="#999"
                        value={title}
                        onChangeText={setTitle}
                        editable={!submitting}
                    />

                    <TextInput
                        style={[styles.input, styles.multiline]}
                        placeholder="Description *"
                        placeholderTextColor="#999"
                        value={description}
                        onChangeText={setDescription}
                        editable={!submitting}
                        multiline
                    />

                    <Text style={styles.label}>Building *</Text>
                    <View style={styles.pickerWrapper}>
                        <Picker
                            selectedValue={selectedBuildingId}
                            enabled={!submitting && !loadingBuildings}
                            onValueChange={(itemValue) =>
                                setSelectedBuildingId(itemValue ? Number(itemValue) : null)
                            }
                        >
                            <Picker.Item
                                label={loadingBuildings ? "Loading buildings..." : "Select a building..."}
                                value={null}
                            />
                            {buildings.map((building) => (
                                <Picker.Item
                                    key={building.id}
                                    label={building.buildingName}
                                    value={building.id}
                                />
                            ))}
                        </Picker>
                    </View>

                    <TextInput
                        style={styles.input}
                        placeholder="Room number (optional)"
                        placeholderTextColor="#999"
                        value={roomNumber}
                        onChangeText={setRoomNumber}
                        editable={!submitting}
                    />

                    <TextInput
                        style={styles.input}
                        placeholder="Directions (optional)"
                        placeholderTextColor="#999"
                        value={directions}
                        onChangeText={setDirections}
                        editable={!submitting}
                    />

                    <Pressable
                        style={styles.input}
                        onPress={() => setShowFromPicker(true)}
                        disabled={submitting}
                    >
                        <Text style={availableFrom ? styles.inputText : styles.placeholderText}>
                            {availableFrom
                                ? formatDisplayDateTime(availableFrom)
                                : "Available from * (tap to pick date & time)"}
                        </Text>
                    </Pressable>

                    <Pressable
                        style={styles.input}
                        onPress={() => setShowUntilPicker(true)}
                        disabled={submitting}
                    >
                        <Text style={availableUntil ? styles.inputText : styles.placeholderText}>
                            {availableUntil
                                ? formatDisplayDateTime(availableUntil)
                                : "Available until * (tap to pick date & time)"}
                        </Text>
                    </Pressable>

                    {showFromPicker && (
                        <DateTimePicker
                            value={availableFrom ?? new Date()}
                            mode="datetime"
                            display={Platform.OS === "ios" ? "inline" : "default"}
                            onChange={(_event, selectedDate) => {
                                if (Platform.OS != "ios") {
                                    setShowFromPicker(false);
                                }
                                if (selectedDate) {
                                    setAvailableFrom(selectedDate);
                                }
                            }}
                        />
                    )}

                    {showUntilPicker && (
                        <DateTimePicker
                            value={availableUntil ?? availableFrom ?? new Date()}
                            mode="datetime"
                            display={Platform.OS === "ios" ? "inline" : "default"}
                            onChange={(_event, selectedDate) => {
                                if (Platform.OS !== "ios") {
                                    setShowUntilPicker(false);
                                }
                                if (selectedDate) {
                                    setAvailableUntil(selectedDate);
                                }
                            }}
                        />
                    )}

                    <View style={styles.buttonWrapper}>
                        <Button
                            title={submitting ? "Saving..." : "Save Changes"}
                            onPress={handleSubmit}
                            disabled={submitting || loadingBuildings}
                        />
                    </View>
                </ScrollView>
            </>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
        paddingBottom: 40,
        backgroundColor: "#fff",
    },
    centered: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
        backgroundColor: "#fff",
    },
    bigText: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 8,
        textAlign: "center",
    },
    subText: {
        fontSize: 14,
        color: "#555",
        marginBottom: 16,
        textAlign: "center",
    },
    label: {
        fontSize: 16,
        fontWeight: "600",
        marginBottom: 6,
        color: "#00235D",
    },
    input: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        padding: 10,
        marginBottom: 12,
        backgroundColor: "#fff",
    },
    pickerWrapper: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        marginBottom: 12,
        backgroundColor: "#fff",
        overflow: "hidden",
    },
    inputText: {
        color: "#000",
        fontSize: 16,
    },
    placeholderText: {
        color: "#999",
        fontSize: 16,
    },
    multiline: {
        minHeight: 80,
        textAlignVertical: "top",
    },
    buttonWrapper: {
        marginTop: 16,
    },
    errorText: {
        fontSize: 16,
        color: "red",
        textAlign: "center",
    },
});