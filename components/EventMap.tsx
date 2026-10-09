import React, { useCallback, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import MapView, { Callout, Marker } from "react-native-maps";
import { Event, fetchEvents } from "@/lib/api";
import { useFocusEffect, router } from "expo-router";

/*
  Default map viewport centered on Creighton University's campus.

  This is used only as the initial map region; users can still pan and zoom
  normally after the map loads.
*/
const CREIGHTON_REGION = {
  latitude: 41.2627,
  longitude: -95.9491,
  latitudeDelta: 0.01,
  longitudeDelta: 0.01,
};

/*
  Represents one map marker and all active events associated with that building.

  Multiple events may share the same building, so the map groups them into a
  single marker instead of rendering several overlapping markers at the same
  coordinates.
*/
type BuildingGroup = {
  buildingId: number;
  buildingName?: string;
  latitude: number;
  longitude: number;
  events: Event[];
};

/*
  Group active events by building for map display.

  Events without a building ID or valid coordinates are skipped because they
  cannot be placed on the map.
*/
function groupEventsByBuilding(events: Event[]): BuildingGroup[] {
  const groups = new Map<number, BuildingGroup>();

  for (const event of events) {
    const building = event.building;
    if (
      building?.id == null ||
      building.latitude == null ||
      building.longitude == null
    ) {
      continue;
    }

    const existing = groups.get(building.id);
    if (existing) {
      existing.events.push(event);
    } else {
      groups.set(building.id, {
        buildingId: building.id,
        buildingName: building.buildingName,
        latitude: building.latitude,
        longitude: building.longitude,
        events: [event],
      });
    }
  }

  return Array.from(groups.values());
}

/*
  Interactive map of currently active food events.

  Events are grouped by building so each building has a single marker.

  Marker behavior:
  - one event at a building -> opens that event's details directly
  - multiple events at a building -> opens the building-specific event list
*/
export default function EventMap() {
  const [groups, setGroups] = useState<BuildingGroup[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Fetch active events and convert them into building marker groups.
  const loadEvents = useCallback(async () => {
    setError(null);

    try {
        const data = await fetchEvents();
        setGroups(groupEventsByBuilding(data));
      } catch (err: any) {
        console.error("Error fetching events for map:", err);
        setError(err.message ?? "Failed to load events");
      }
  }, []);

  /*
    Refresh the map whenever this screen regains focus.

    This ensures newly created, edited, or closed events are reflected without
    requiring the Map tab to be remounted.
  */
  useFocusEffect(
    useCallback(() => {
      loadEvents();
    }, [loadEvents])
  );
    
  /*
    Navigate based on how many events are associated with the selected building.

    Single-event buildings can go directly to event details.
    Multi-event buildings first show the building's event list.
  */
  const handleGroupPress = (group: BuildingGroup) => {
    if (group.events.length === 1) {
      // Only one event here, go straight to its details
      router.push({
        pathname: "/events/[id]",
        params: { id: String(group.events[0].id), from: "map" },
      });
    } else {
      // Multiple events, open the building events list
      router.push({
        pathname: "/buildings/[id]",
        params: { id: String(group.buildingId) },
      });
    }
  };

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={CREIGHTON_REGION}
        showsUserLocation
        showsMyLocationButton
      >
        {groups.map((group) => {
          const count = group.events.length;
          const isMulti = count > 1;
          return (
            <Marker
              key={group.buildingId}
              coordinate={{
                latitude: group.latitude,
                longitude: group.longitude,
              }}
              title={group.buildingName}
              description={
                isMulti ? `${count} events here` : group.events[0].title
              }
            >
              {/*
                Multi-event buildings show a count badge so users can tell
                immediately that more than one event is available there.
              */}
              {isMulti ? (
                <View style={styles.markerBadgeWrap}>
                  <View style={styles.markerPin} />
                  <View style={styles.countBadge}>
                    <Text style={styles.countBadgeText}>{count}</Text>
                  </View>
                </View>
              ) : (
                <View style={styles.markerPin} />
              )}
              {/*
                The callout provides a short preview before navigation.
                For multi-event buildings, only the first three event titles
                are shown to keep the callout compact.
              */}
              <Callout onPress={() => handleGroupPress(group)}>
                <View style={styles.callout}>
                  <Text style={styles.calloutTitle}>
                    {group.buildingName ?? "Building"}
                  </Text>
                  {isMulti ? (
                    <>
                      <Text style={styles.calloutText}>{count} events here:</Text>
                      {group.events.slice(0, 3).map((e) => (
                        <Text key={e.id} style={styles.calloutEvent}>
                          • {e.title}
                        </Text>
                      ))}
                      {count > 3 && (
                        <Text style={styles.calloutText}>
                          and {count - 3} more
                        </Text>
                      )}
                      <Text style={styles.calloutLink}>Tap to view all</Text>
                    </>
                  ) : (
                    <>
                      <Text style={styles.calloutText}>
                        {group.events[0].title}
                      </Text>
                      {!!group.events[0].foodType?.typeName && (
                        <Text style={styles.calloutText}>
                          {group.events[0].foodType.typeName}
                        </Text>
                      )}
                      <Text style={styles.calloutLink}>Tap for details</Text>
                    </>
                  )}
                </View>
              </Callout>
            </Marker>
          );
        })}
      </MapView>
      {/*
        Keep the map visible if loading fails and display the error as an
        overlay rather than replacing the whole screen.
      */}
      {error && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  markerBadgeWrap: {
    alignItems: "center",
    justifyContent: "center",
  },
  markerPin: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#005CA9",
    borderWidth: 2,
    borderColor: "#fff",
  },
  countBadge: {
    position: "absolute",
    top: -8,
    right: -10,
    minWidth: 20,
    height: 20,
    paddingHorizontal: 4,
    borderRadius: 10,
    backgroundColor: "#E24B4A",
    borderWidth: 2,
    borderColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  countBadgeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "700",
  },
  callout: {
    minWidth: 180,
    padding: 4,
  },
  calloutTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#00235D",
    marginBottom: 4,
  },
  calloutText: {
    fontSize: 13,
    color: "#333",
    marginBottom: 2,
  },
  calloutEvent: {
    fontSize: 13,
    color: "#005CA9",
    marginBottom: 2,
  },
  calloutDescription: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },
  calloutLink: {
    fontSize: 12,
    color: "#005CA9",
    marginTop: 6,
    textDecorationLine: "underline",
  },
  errorBanner: {
    position: "absolute",
    top: 16,
    left: 16,
    right: 16,
    backgroundColor: "rgba(255,0,0,0.8)",
    padding: 12,
    borderRadius: 8,
  },
  errorText: {
    color: "#fff",
    textAlign: "center",
  },
});
