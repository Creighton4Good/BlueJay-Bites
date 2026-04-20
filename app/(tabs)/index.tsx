import { useClerk, useUser } from "@clerk/clerk-expo";
import React, { useEffect, useState } from "react";
import { Button, FlatList, StyleSheet, Text, View } from "react-native";
import { Event, fetchEvents } from "@/lib/api";

export default function HomeScreen() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchEvents();
        setEvents(data.filter((e) => e.status === "active"));
      } catch (err: any) {
        console.error("Error fetching events:", err);
        setError(err.message ?? "Failed to load events");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const formatDateTime = (value?: string | null) => {
    if (!value) return "";
    try {
      const date = new Date(value);
      return date.toLocaleString();
    } catch {
      return value;
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome Back!</Text>
      <Text style={styles.userInfo}>
        Hello, {user?.firstName || "User"}!
      </Text>
      <Text style={styles.userEmail}>
        Your email is: {user?.primaryEmailAddress?.emailAddress}
      </Text>

      <View style={styles.separator} />

      <Text style={styles.sectionTitle}>Available Food Events</Text>

      {loading ? (
        <Text>Loading events...</Text>
      ) : error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : events.length === 0 ? (
        <Text style={styles.emptyText}>No events yet.</Text>
      ) : (
        <FlatList
          data={events}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={{ paddingVertical: 8 }}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              
              {!!item.location && <Text>{item.location}</Text>}

              {!!item.description && (
                <Text style={{ marginTop: 4 }}>{item.description}</Text>
              )}

              {!!item.dietarySpecification && (
                <Text style={{ marginTop: 4 }}>
                  Dietary: {item.dietarySpecification}
                </Text>
              )}

              {(item.availableFrom || item.availableUntil) && (
                <Text style={{ marginTop: 4, fontStyle: "italic" }}>
                  {item.availableFrom &&
                    `From: ${formatDateTime(item.availableFrom)} `}
                  {item.availableUntil &&
                    `To: ${formatDateTime(item.availableUntil)}`}
                </Text>
              )}
            </View>
          )}
        />
      )}

      <View style={styles.separator} />
      <Button title="Sign Out" onPress={() => signOut()} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 12 },
  userInfo: { fontSize: 18, marginBottom: 4 },
  userEmail: { fontSize: 16, color: "#666" },
  separator: {
    marginVertical: 16,
    height: 1,
    width: "100%",
    backgroundColor: "#eee",
  },
  sectionTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 8 },
  emptyText: { fontSize: 14, color: "#888" },
  errorText: { fontSize: 14, color: "red", marginBottom: 8 },
  card: {
    borderWidth: 1,
    borderColor: "#005CA9",
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    backgroundColor: "#E9F2FB",
  },
  cardTitle: { fontSize: 16, fontWeight: "bold", marginBottom: 4 },
});
