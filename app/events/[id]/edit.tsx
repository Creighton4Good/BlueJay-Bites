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
import { Stack, router, useLocalSearchParams } from "expo-router";
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

    const [saveMessage, setSaveMessage] = useState<string | null>(null);
    const [saveError, setSaveError] = useState<string | null>(null);

    const currentUserId = 1;

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

                if (event.createdBy?.id !== currentUserId) {
                    Alert.alert("Not allowed", "Only the event creator can edit this event.", [
                        {
                            text: "OK",
                            onPress: () => router.back(),
                        },
                    ]);
                    return;
                }

                setTitle(event.title ?? "");
                setDescription(event.description ?? "");
                setDirections(event.directions ?? "");
                setRoomNumber(event.roomNumber ?? "");
                setSelectedBuildingId(event.building?.id ?? null);
                setAvailableFrom(event.availableFrom ? new Date(event.availableFrom) : null);
                setAvailableUntil(event.availableUntil ? new Date(event.availableUntil) : null);
            } catch (err) {
                console.error("Error fetching event:", err);
                setLoadError("Could not load event details.");
            } finally {
                setLoadingEvent(false);
            }
        };

        loadEvent();
    }, [id]);

    const pad = (n: number) => String(n).padStart(2, "0");

    const formatDateForWebInput = (date: Date | null) => {
        if (!date || Number.isNaN(date.getTime())) return "";
        return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
    };

    const formatTimeForWebInput = (date: Date | null) => {
        if (!date || Number.isNaN(date.getTime())) return "";
        return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
    };

    const updateDatePart = (current: Date | null, dateValue: string) => {
        if (!dateValue) return null;
        const [year, month, day] = dateValue.split("-").map(Number);
        const base =
            current && !Number.isNaN(current.getTime()) ? new Date(current) : new Date();
        base.setFullYear(year, month - 1, day);
        return base;
    };

    const updateTimePart = (current: Date | null, timeValue: string) => {
        if (!timeValue) return current;
        const [hours, minutes] = timeValue.split(":").map(Number);
        const base =
            current && !Number.isNaN(current.getTime()) ? new Date(current) : new Date();
        base.setHours(hours, minutes, 0, 0);
        return base;
    };

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

    const toLocalDateTimeString = (date: Date) => {
        const pad = (n: number) => String(n).padStart(2, "0");

        return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
    }

    const handleSubmit = async () => {
        setSaveMessage(null);
        setSaveError(null);
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
            availableFrom: toLocalDateTimeString(availableFrom),
            availableUntil: toLocalDateTimeString(availableUntil),
            createdBy: { id: 1 },
            status: "active",
            updatedAt: now,
        };

        setSubmitting(true);

        try {
            await updateEvent(Number(id), 1, payload);
            setSaveMessage("Food event updated successfully!");

            setTimeout(() => {
                router.back();
            }, 800);
        } catch (err: any) {
            console.error("Error updating event:", err);
            setSaveError(
                err.message ?? "Something went wrong while updaing the event."
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

    const WebNativeInput = ({
        type,
        value,
        onChange,
        placeholder,
    } : {
        type: "date" | "time";
        value: string;
        onChange: (value: string) => void;
        placeholder?: string;
    }) => {
        return React.createElement("input", {
            type,
            value,
            placeholder,
            disabled: submitting,
            onChange: (e: any) => onChange(e.target.value),
            style: {
                width: "100%",
                height: 44,
                border: "1px solid #ccc",
                borderRadius: 8,
                padding: "0 10px",
                fontSize: 16,
                backgroundColor: "#fff",
                boxSizing: "border-box",
            },
        });
    };

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

                    {Platform.OS === "web" ? (
                        <>
                            <Text style={styles.label}>Available from *</Text>
                            <View style={styles.webDateTimeRow}>
                                <View style={styles.webInputGroup}>
                                    <Text style={styles.webInputLabel}>Date</Text>
                                    <WebNativeInput
                                        type="date"
                                        value={formatDateForWebInput(availableFrom)}
                                        onChange={(value) =>
                                            setAvailableFrom(updateDatePart(availableFrom, value))
                                        }
                                    />
                                </View>

                                <View style={styles.webInputGroup}>
                                    <Text style={styles.webInputLabel}>Time</Text>
                                    <WebNativeInput
                                        type="time"
                                        value={formatTimeForWebInput(availableFrom)}
                                        onChange={(value) =>
                                            setAvailableFrom(updateTimePart(availableFrom, value))
                                        }
                                    />
                                </View>
                            </View>
                        </>
                    ):(
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
                    )}

                    {Platform.OS === "web" ? (
                        <>
                            <Text style={styles.label}>Available until *</Text>
                            <View style={styles.webDateTimeRow}>
                                <View style={styles.webInputGroup}>
                                    <Text style={styles.webInputLabel}>Date</Text>
                                    <WebNativeInput
                                        type="date"
                                        value={formatDateForWebInput(availableUntil)}
                                        onChange={(value) =>
                                            setAvailableUntil(updateDatePart(availableUntil, value))
                                        }
                                    />
                                </View>

                                <View style={styles.webInputGroup}>
                                    <Text style={styles.webInputLabel}>Time</Text>
                                    <WebNativeInput
                                        type="time"
                                        value={formatTimeForWebInput(availableUntil)}
                                        onChange={(value) =>
                                            setAvailableUntil(updateTimePart(availableUntil, value))
                                        }
                                    />
                                </View>
                            </View>
                        </>
                    ) : (
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
                    )}

                    {Platform.OS !== "web" && showFromPicker && (
                        <DateTimePicker
                            value={availableFrom ?? new Date()}
                            mode="datetime"
                            display={Platform.OS === "ios" ? "inline" : "default"}
                            onChange={(event, selectedDate) => {
                                if (Platform.OS != "ios") {
                                    setShowFromPicker(false);
                                }
                                
                                if (event.type === "set" && selectedDate) {
                                    setAvailableFrom(selectedDate);
                                }
                            }}
                        />
                    )}

                    {Platform.OS !== "web" && showUntilPicker && (
                        <DateTimePicker
                            value={availableUntil ?? availableFrom ?? new Date()}
                            mode="datetime"
                            display={Platform.OS === "ios" ? "inline" : "default"}
                            onChange={(event, selectedDate) => {
                                if (Platform.OS !== "ios") {
                                    setShowUntilPicker(false);
                                }
                                
                                if (event.type === "set" && selectedDate) {
                                    setAvailableUntil(selectedDate);
                                }
                            }}
                        />
                    )}

                    {saveMessage && <Text style={styles.successText}>{saveMessage}</Text>}
                    {saveError && <Text style={styles.errorText}>{saveError}</Text>}

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
    webDateTimeRow: {
        flexDirection: "row",
        gap: 12,
        marginBottom: 12,
    },
    webInputGroup: {
        flex: 1,
    },
    webInputLabel: {
        fontSize: 14,
        fontWeight: "500",
        marginBottom: 6,
        color: "#555",
    },
    webDateInput: {
        flex: 2,
        marginBottom: 0,
    },
    webTimeInput: {
        flex: 1,
        marginBottom: 0,
    },
    successText: {
        fontSize: 16,
        color: "green",
        textAlign: "center",
        marginBottom: 12,
    },
});