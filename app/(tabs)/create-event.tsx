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
import {
    createEvent,
    NewEvent,
    Building,
    fetchBuildings,
    FoodType,
    fetchFoodTypes, 
    DietaryOption, 
    fetchDietaryOptions,
    uploadPhoto
} from "@/lib/api";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import { useSession } from "@/app/contexts/session-context";
import { OrganizerRouteGuard } from "@/components/organizer-route-guard";

export default function CreateEventScreen() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [directions, setDirections] = useState("");
  const [roomNumber, setRoomNumber] = useState("");
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [selectedBuildingId, setSelectedBuildingId] = useState<string>("");
  const [loadingBuildings, setLoadingBuildings] = useState(false);
  const [foodTypes, setFoodTypes] = useState<FoodType[]>([]);
  const [selectedFoodTypeId, setSelectedFoodTypeId] = useState<string>("");
  const [loadingFoodTypes, setLoadingFoodTypes] = useState(false);
  const [dietaryOptionsList, setDietaryOptionsList] = useState<DietaryOption[]>([]);
  const [selectedDietaryOptionIds, setSelectedDietaryOptionIds] = useState<string[]>([]);
  const [loadingDietaryOptions, setLoadingDietaryOptions] = useState(false);
  const [servingsMin, setServingsMin] = useState<number | null>(null);
  const [servingsMax, setServingsMax] = useState<number | null>(null);
  const [availableFrom, setAvailableFrom] = useState<Date | null>(null);
  const [availableUntil, setAvailableUntil] = useState<Date | null>(null);
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showUntilPicker, setShowUntilPicker] = useState(false);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const { user } = useSession();

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
    const loadFoodTypes = async () => {
      setLoadingFoodTypes(true);
      try {
        const data = await fetchFoodTypes();
        setFoodTypes(data);
      } catch (err) {
        console.error("Error fetching food types:", err);
        Alert.alert("Error", "Could not load food type options.");
      } finally {
        setLoadingFoodTypes(false);
      }
    };

    loadFoodTypes();
  }, []);

    useEffect(() => {
        const loadDietaryOptions = async () => {
            setLoadingDietaryOptions(true);
            try {
                const data = await fetchDietaryOptions();
                setDietaryOptionsList(data);


            } catch (err) {
                console.error("Error fetching dietary options:", err);
                Alert.alert("Error", "Could not load dietary options.");
            } finally {
                setLoadingDietaryOptions(false);
            }
        };
    loadDietaryOptions();
}, []);


    const toggleDietaryOption = (id: string) => {
        setSelectedDietaryOptionIds((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
        );
    };

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

    const min = servingsMin ?? 0;
    const max = servingsMax ?? 0;
    let validType: boolean = true;
    if (!Number.isInteger(min) || !Number.isInteger(max) || max < 0 || min < 0) {
      validType = false;
    }

    if (!validType) {
      Alert.alert(
          "Invalid entry",
          "Please enter a positive whole number for serving sizes.",
      )
    }

    if (max < min && servingsMax != null) {
      Alert.alert(
          "Invalid serving estimate",
          "Minimum servings must be less or equal to maximum servings."
      );
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
      foodType: selectedFoodTypeId ? {id: Number(selectedFoodTypeId)} : undefined,
      dietaryOptions: selectedDietaryOptionIds.length > 0  ? selectedDietaryOptionIds.map((id) => ({ id: Number(id) }))
            : undefined,
      directions: directions.trim() || undefined,
      roomNumber: roomNumber.trim() || undefined,
      servingsMin: servingsMin ?? undefined,
      servingsMax: servingsMax ?? undefined,
      availableFrom: toLocalDateTimeString(availableFrom),          
      availableUntil: toLocalDateTimeString(availableUntil),        
      createdBy: { id: user.id },
      status: "active",
      createdAt: now,
      updatedAt: now,
    };

    setSubmitting(true);

    try {
      const createdEvent = await createEvent(payload);

      if (photoUrl) {
        const filename = photoUrl.split("/").pop() ?? "photo.jpg";
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : "image/jpeg";

        await uploadPhoto({ uri: photoUrl, name: filename, type }, createdEvent.id);
      }


      Alert.alert("Success", "Food event created successfully!");
      
      setTitle("");
      setDescription("");
      setDirections("");
      setRoomNumber("");
      setSelectedBuildingId("");
      setSelectedFoodTypeId("");
      setSelectedDietaryOptionIds([]);
      setServingsMin(null);
      setServingsMax(null);
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
    <OrganizerRouteGuard>
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

          <Text style={styles.label}>Food Type (optional)</Text>
          <View style={styles.pickerWrapper}>
            <Picker
                selectedValue={selectedFoodTypeId}
                enabled={!submitting && !loadingFoodTypes}
                onValueChange={(itemValue) =>
                    setSelectedFoodTypeId(String(itemValue))}
                style={styles.picker}
            >
              <Picker.Item
                  label={loadingFoodTypes ? "Loading food types..." : "Select a food type..."}
                  value=""
              />
              {foodTypes.map((foodType) => (
                  <Picker.Item
                      key={foodType.id}
                      label={foodType.typeName}
                      value={String(foodType.id)}
                  />
              ))}
            </Picker>
          </View>

            <Text style={styles.label}>Dietary Option Tags {loadingDietaryOptions ? "(loading...)" : "(optional)"}</Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
                {dietaryOptionsList.map((option) => {
                    const idStr = String(option.id);
                    const selected = selectedDietaryOptionIds.includes(idStr);
                    return (
                        <Pressable
                            key={option.id}
                            onPress={() => toggleDietaryOption(idStr)}
                            disabled={submitting || loadingDietaryOptions}
                            style={{
                                paddingVertical: 6,
                                paddingHorizontal: 12,
                                borderRadius: 16,
                                borderWidth: 1,
                                borderColor: "#005CA9",
                                backgroundColor: selected ? "#005CA9" : "#fff",
                            }}
                        >
                            <Text style={{ color: selected ? "#fff" : "#005CA9" }}>{option.optionName}</Text>
                        </Pressable>
                    );
                })}
            </View>

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
        
          <Text style={styles.label}>Minimum servings (optional)</Text>
          <TextInput
              style={styles.input}
              placeholderTextColor="#999"
              value={servingsMin === null ? "" : servingsMin.toString()}
              onChangeText={(text) => {
                if (text === "") {
                  setServingsMin(null);
                } else {
                  const n = Number(text);
                  if (!Number.isNaN(n)) setServingsMin(n);
                }
              }}
              editable={!submitting}
              keyboardType="numeric"
          />


          <Text style={styles.label}>Maximum servings (optional)</Text>
          <TextInput
              style={styles.input}
              placeholderTextColor="#999"
              value={servingsMax === null ? "" : servingsMax.toString()}
              onChangeText={(text) => {
                if (text === "") {
                  setServingsMax(null);
                } else {
                  const n = Number(text);
                  if (!Number.isNaN(n)) setServingsMax(n);
                }
              }}
              editable={!submitting}
              keyboardType="numeric"
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
    </OrganizerRouteGuard>
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