import React from "react";
import { useTheme } from "@react-navigation/native";
import { Tabs } from "expo-router";

export default function TabsLayout() {
  const { colors } = useTheme();
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
        name="create-event"
        options={{
          title: "Create Event",
          tabBarLabel: "Create",
        }}
      />
    </Tabs>
  );
}
