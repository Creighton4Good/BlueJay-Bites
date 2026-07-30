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
            name="settings"
            options={{
                title: "Settings",
                //  href: isAdmin ? undefined : null,
                // commented out for local testing, role changes will only be viewable for admins
                // while settings page will be viewable for all for notification preferences
                // and display name changes
            }}
        />
    </Tabs>
  );
}
