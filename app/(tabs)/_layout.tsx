import React from "react";
import { useTheme } from "@react-navigation/native";
import { Tabs } from "expo-router";
import { useSession } from "@/app/contexts/session-context";

export default function TabsLayout() {
  const { colors } = useTheme();

  const { isOrganizer, isAdmin } = useSession();
  const canManageEvents = isOrganizer || isAdmin;

  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: colors.card },
        headerTintColor: "#fff",
        tabBarActiveTintColor: "#fff",
        tabBarInactiveTintColor: "#cce0ff",
        sceneStyle: { backgroundColor: colors.background },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Dashboard",
          tabBarLabel: "Dashboard",
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          title: "Map",
          tabBarLabel: "Map",
        }}
      />
      <Tabs.Screen
        name="my-events"
        options={{
          title: "My Events",
          tabBarLabel: "My Events",
          href: canManageEvents ? undefined : null,
        }}
      />
      <Tabs.Screen
        name="create-event"
        options={{
          title: "Create Event",
          href: canManageEvents ? undefined : null,
        }}
      />
      <Tabs.Screen
        name="admin-events"
        options={{
          title: "All Events",
          tabBarLabel: "Admin",
          href: isAdmin ? undefined : null,
        }}
      />
    </Tabs>
  );
}
