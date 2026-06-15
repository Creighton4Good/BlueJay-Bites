import React, { useState } from "react";
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
import { createEvent, NewEvent } from "@/lib/api";
import DateTimePicker from "@react-native-community/datetimepicker";

export default function CreateEventScreen() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [directions, setDirections] = useState("");
  const [roomNumber, setRoomNumber] = useState("");
  const [availableFrom, setAvailableFrom] = useState<Date | null>(null);
  const [availableUntil, setAvailableUntil] = useState<Date | null>(null);
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showUntilPicker, setShowUntilPicker] = useState(false);
  const [submitting, setSubmitting] = useState(false);

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
    if (!title.trim()) {
      Alert.alert("Missing title", "Please enter a title for the post.");
      return;
    }

    if (!description.trim()) {
      Alert.alert("Missing description", "Please enter a description for the post.");
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

   // Prototype-only: hardcoded organizer until auth is wired in
    const payload: NewEvent = {
      title: title.trim(),
      description: description.trim(),        
      directions: directions.trim() || undefined,
      roomNumber: roomNumber.trim() || undefined,
      availableFrom: availableFrom.toISOString(),          
      availableUntil: availableUntil.toISOString(),        
      createdBy: { id: 1 },
    };

    setSubmitting(true);

    try {
      await createEvent(payload);

      Alert.alert("Success", "Food event created successfully!");
      
      setTitle("");
      setDescription("");
      setDirections("");
      setRoomNumber("");
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
      <TextInput
        style={styles.input}
        placeholder="Directions (optional)"
        placeholderTextColor="#999"
        value={directions}
        onChangeText={setDirections}
        editable={!submitting}
      />
      <TextInput
        style={styles.input}
        placeholder="Room number (optional)"
        placeholderTextColor="#999"
        value={roomNumber}
        onChangeText={setRoomNumber}
        editable={!submitting}
      />
      <Pressable
        style={styles.input}
        onPress={() => setShowFromPicker(true)}
      >
        <Text style={availableFrom ? styles.inputText : styles.placeholderText}>
          {availableFrom
            ? formatDisplayDateTime(availableFrom)
            : "Available from * (tap to pick date & time)"}
        </Text>
      </Pressable>

      <Pressable style={styles.input} onPress={() => setShowUntilPicker(true)}>
        <Text
          style={availableUntil ? styles.inputText : styles.placeholderText}
        >
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
            if (Platform.OS !== "ios") {
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
          title={submitting ? "Posting..." : "Post Food Event"}
          onPress={handleSubmit}
          disabled={submitting}
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
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    backgroundColor: "#fff",
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
});