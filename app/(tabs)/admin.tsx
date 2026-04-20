import React, { useState } from "react";
import {
  Alert,
  Button,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { createEvent, NewEvent } from "@/lib/api";
import { useUser } from "@clerk/clerk-expo";

export default function AdminPost() {
  const { user } = useUser();
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [dietarySpecification, setDietarySpecification] = useState("");
  const [availableFrom, setAvailableFrom] = useState("");
  const [availableUntil, setAvailableUntil] = useState("");
  const [submitting, setSubmitting] = useState(false);

  console.log("AdminPost screen rendered");

  const handleSubmit = async () => {
    console.log("Post Food Event button pressed");
    if (!title.trim()) {
      Alert.alert("Missing title", "Please enter a title for the post.");
      return;
    }

    if (!location.trim()) {
    Alert.alert("Missing location", "Please enter a location for the post.");
    return;
    }

    if (!availableFrom.trim() || !availableUntil.trim()) {
      Alert.alert(
        "Missing availability",
        "Please enter both start and end times."
      );
      return;
    }

   // TEMP: hard-coded user id until we wire real users
    const userId = 1;

    const payload: NewEvent = {
      userId,
      title: title.trim(),
      location: location.trim(),                    // required
      description: description.trim() || "",        // optional
      dietarySpecification: dietarySpecification.trim() || "",
      availableFrom: availableFrom.trim(),          // required ISO string
      availableUntil: availableUntil.trim(),        // required ISO string
      imageUrl: "",                                 // optional
      status: "active",
    };

    setSubmitting(true);
    try {
      await createEvent(payload);
      Alert.alert("Success", "Post created successfully!");
      
      setTitle("");
      setLocation("");
      setDescription("");
      setDietarySpecification("");
      setAvailableFrom("");
      setAvailableUntil("");
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
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.bigText}>Create Food Post</Text>
      <Text style={styles.subText}>
        Logged in as: {user?.primaryEmailAddress?.emailAddress ?? "Unknown"}
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Title *"
        placeholderTextColor="#999"
        value={title}
        onChangeText={setTitle}
      />
      <TextInput
        style={styles.input}
        placeholder="Location"
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
      <TextInput
        style={styles.input}
        placeholder='Available from (e.g. 12/6/25 2:30PM)'
        placeholderTextColor="#999"
        value={availableFrom}
        onChangeText={setAvailableFrom}
      />
      <TextInput
        style={styles.input}
        placeholder='Available until (e.g. 12/6/25 4:00PM)'
        placeholderTextColor="#999"
        value={availableUntil}
        onChangeText={setAvailableUntil}
      />

      <View style={{ marginTop: 16 }}>
        <Button
          title={submitting ? "Posting..." : "Post Food Event"}
          onPress={handleSubmit}
          disabled={submitting}
        />
      </View>
    </ScrollView>
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
    color: "#000000",
  },
  multiline: {
    minHeight: 80,
    textAlignVertical: "top",
  },
});