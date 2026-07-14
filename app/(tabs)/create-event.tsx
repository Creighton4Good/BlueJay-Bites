import React, { useEffect, useState } from "react";
import {
  Alert,
  Button,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  KeyboardAvoidingView,
} from "react-native";
import { createEvent, NewEvent, Building, fetchBuildings } from "@/lib/api";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import { useSession } from "@/app/contexts/session-context";


export default function CreateEventScreen() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [directions, setDirections] = useState("");
  const [roomNumber, setRoomNumber] = useState("");
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [selectedBuildingId, setSelectedBuildingId] = useState<string>("");
  const [loadingBuildings, setLoadingBuildings] = useState(false);
  const [availableFrom, setAvailableFrom] = useState<Date | null>(null);
  const [availableUntil, setAvailableUntil] = useState<Date | null>(null);
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showUntilPicker, setShowUntilPicker] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const { user, isOrganizer, isAdmin } = useSession();
  const canCreateEvent = isOrganizer || isAdmin;

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

  const toLocalDateTimeString = (date: Date) => {
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
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

  const handleSubmit = async () => {
    if (!canCreateEvent) {
      return ( 
        <View style={styles.centered}>
          <Text style={styles.errorText}>
            Only event organizers can create food events.
          </Text>
        </View>
      );
    }

    if (!title.trim()) {
      Alert.alert("Missing title", "Please enter a title for the post.");
      return;
    }

    if (!description.trim()) {
      Alert.alert("Missing description", "Please enter a description for the post.");
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
    
   // Prototype-only: hardcoded organizer until auth is wired in
    const payload: NewEvent = {
      title: title.trim(),
      description: description.trim(),    
      building: { id: Number(selectedBuildingId) },
      directions: directions.trim() || undefined,
      roomNumber: roomNumber.trim() || undefined,
      availableFrom: toLocalDateTimeString(availableFrom),          
      availableUntil: toLocalDateTimeString(availableUntil),        
      createdBy: { id: user.id },
      status: "active",
      createdAt: now,
      updatedAt: now,
    };

    setSubmitting(true);

    try {
      await createEvent(payload);

      Alert.alert("Success", "Food event created successfully!");
      
      setTitle("");
      setDescription("");
      setDirections("");
      setRoomNumber("");
      setSelectedBuildingId("");
      setAvailableFrom(null);
      setAvailableUntil(null);
    } catch (err: any) {
      console.error("Error creating event:", err);
      Alert.alert(
        "Error",
        err.message ?? "Something went wrong while creating the event."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const WebNativeInput = ({
    type,
    value,
    onChange,
    placeholder,
  }: {
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
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.bigText}>Create Food Event</Text>
      <Text style={styles.subText}>
        Prototype mode: posting as test organizer
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
            setSelectedBuildingId(String(itemValue))}
          style={styles.picker}
        >
          <Picker.Item
            label={loadingBuildings ? "Loading buildings..." : "Select a building..."}
            value=""
          />
          {buildings.map((building) => (
            <Picker.Item
              key={building.id}
              label={building.buildingName}
              value={String(building.id)}
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
      ) : (
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
            if (Platform.OS !== "ios") {
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

      <View style={styles.buttonWrapper}>
        <Button
          title={submitting ? "Posting..." : "Post Food Event"}
          onPress={handleSubmit}
          disabled={submitting || loadingBuildings}
        />
      </View>
    </ScrollView>
  </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 40,
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
    marginTop: 16
  },
  webDateTimeRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  webDateInput: {
    flex: 2,
    marginBottom: 0,
  },
  webTimeInput: {
    flex: 1,
    marginBottom: 0,
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
  picker: {
    color: "#000",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#fff",
  },
  errorText: {
    fontSize: 16,
    color: "red",
    textAlign: "center",
  },
});