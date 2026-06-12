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
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [dietarySpecification, setDietarySpecification] = useState("");
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

    if (!location.trim()) {
    Alert.alert("Missing location", "Please enter a location for the post.");
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

   // Prototype-only: hardcoded organizer until auth/user accounts are wired in
    const userId = 1;

    const payload: NewEvent = {
      userId,
      title: title.trim(),
      location: location.trim(),                    // required
      description: description.trim() || "",        // optional
      dietarySpecification: dietarySpecification.trim() || "",
      availableFrom: availableFrom.toISOString(),          // required ISO string
      availableUntil: availableUntil.toISOString(),        // required ISO string
      imageUrl: "",                                 // optional
      status: "active",
    };

    setSubmitting(true);

    try {
      await createEvent(payload);

      Alert.alert("Success", "Food event created successfully!");
      
      setTitle("");
      setLocation("");
      setDescription("");
      setDietarySpecification("");
      setAvailableFrom(null);
      setAvailableUntil(null);
    } catch (err: any) {
      console.error("Error creating event:", err);
      Alert.alert(
        "Error",
        err.message ?? "Something went wrong while creating the post."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
  <KeyboardAvoidingView>
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
        style={styles.input}
        placeholder="Location *"
        placeholderTextColor="#999"
        value={location}
        onChangeText={setLocation}
      />
      <TextInput
        style={[styles.input, styles.multiline]}
        placeholder="Description"
        placeholderTextColor="#999"
        value={description}
        onChangeText={setDescription}
        multiline
      />
      <TextInput
        style={styles.input}
        placeholder="Dietary specification (e.g., vegan, gluten-free)"
        placeholderTextColor="#999"
        value={dietarySpecification}
        onChangeText={setDietarySpecification}
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