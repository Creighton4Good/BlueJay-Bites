import React, { useEffect, useState } from "react";
import {
  Alert,
  Button,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  KeyboardAvoidingView,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { createEvent, NewEvent, Building, fetchBuildings } from "@/lib/api";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";


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
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
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

  const pickFromLibrary = async () => {
    const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
          "Permission needed",
          "We need access to your photos to attach an image."
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled) {
      setPhotoUrl(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
          "Permission needed",
          "We need camera access so you can take a picture."
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled) {
      setPhotoUrl(result.assets[0].uri);
    }
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
      availableFrom: availableFrom.toISOString(),          
      availableUntil: availableUntil.toISOString(),
      photoUrl: photoUrl ?? undefined, // send URI as imageUrl
      createdBy: { id: 1 },
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
      setPhotoUrl(null);
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

      <Text style={{ marginTop: 8, marginBottom: 4, fontWeight: "600" }}>
        Add a photo (optional)
      </Text>
      <View style={{ flexDirection: "row", gap: 8, marginBottom: 8 }}>
        <View style={{ flex: 1 }}>
          <Button title="Take Photo" onPress={takePhoto} />
        </View>
        <View style={{ flex: 1 }}>
          <Button title="Choose from Library" onPress={pickFromLibrary} />
        </View>
      </View>

      {photoUrl && (
          <View style={{ marginBottom: 12, alignItems: "center" }}>
            <Image
                source={{ uri: photoUrl }}
                style={{ width: "100%", height: 180, borderRadius: 8 }}
                resizeMode="cover"
            />
            <Text style={{ fontSize: 12, color: "#555", marginTop: 4 }}>
              This image will be attached to the event.
            </Text>
          </View>
      )}



    
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
        <Text
          style={availableUntil ? styles.inputText : styles.placeholderText}>
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
  picker: {
    color: "#000",
  },
});