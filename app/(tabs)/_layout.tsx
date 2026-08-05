import React from "react";
import { useTheme } from "@react-navigation/native";
import { Tabs } from "expo-router";
import { useSession } from "@/app/contexts/session-context";
import {IconSymbol} from "@/components/ui/icon-symbol";

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
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="arrowtriangle.up.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          title: "Map",
          tabBarLabel: "Map",
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="mappin" color={color} />,
        }}
      />
      <Tabs.Screen
        name="my-events"
        options={{
          title: "My Events",
          tabBarLabel: "My Events", tabBarIcon: ({ color }) => <IconSymbol size={28} name="person" color={color} />,
          href: canManageEvents ? undefined : null,
        }}
      />
      <Tabs.Screen
        name="create-event"
        options={{
          title: "Create Event",
            tabBarLabel: "Create Event",
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="plus" color={color} />,
            href: canManageEvents ? undefined : null,
        }}
      />
        <Tabs.Screen
            name="settings"
            options={{
                title: "Settings",
                tabBarLabel: "Settings",
                tabBarIcon: ({ color }) => <IconSymbol size={28} name="gearshape.fill" color={color} />,
            }}
        />
      <Tabs.Screen
        name="admin-events"
        options={{
          title: "All Events",
          tabBarLabel: "Admin",
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="magnifyingglass" color={color} />,
          href: isAdmin ? undefined : null,
        }}
      />
    </Tabs>
  );
}
