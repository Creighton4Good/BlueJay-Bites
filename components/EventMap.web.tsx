import React from "react";
import { StyleSheet, Text, View } from "react-native";

export default function EventMap() {
  return (
    <View style={styles.fallback}>
      <Text style={styles.fallbackTitle}>Map View</Text>
      <Text style={styles.fallbackText}>
        The campus map is available on the mobile app.
      </Text>
      <Text style={styles.fallbackText}>
        Open BlueJay-Bites on your phone to view events on a map.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  fallback: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  fallbackTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 12,
  },
  fallbackText: {
    fontSize: 16,
    color: "#fff",
    textAlign: "center",
    marginBottom: 8,
  },
});
