import React from "react";
import { useTheme } from "@react-navigation/native";
import { Tabs } from "expo-router";
import { useSession } from "@/app/contexts/session-context";
import {IconSymbol} from "@/components/ui/icon-symbol";

/**
 * Main tab navigation for authenticated users.
 * 
 * Tab visbility is based on the authenticated user's role from SessionContext:
 * - All signed-in users can access Dashboard, Map, and Settings.
 * - Event organizers and admins can access My Events and Create Event.
 * - Only admins can access the Admin / All Events screen.
 * 
 * Note: `href: null` hides a route from the tab bar. Authentication itself is 
 * handled by `app/_layout.tsx`; this file only controls which authenticated 
 * features are visible for each role.
 */

export default function TabsLayout() {
  const { colors } = useTheme();
  const { isOrganizer, isAdmin } = useSession();

  // Both organizers and admins are allowed to create and manage events.
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
          
          // `href: null` removes the tab for users without event-management access.
          href: canManageEvents ? undefined : null,
        }}
      />
      <Tabs.Screen
        name="create-event"
        options={{
          title: "Create Event",
            tabBarLabel: "Create Event",
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="plus" color={color} />,
            
            // Only event organizers and admins should see event creation.
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
          
          // The admin event-management tab is hidden from non-admin users.
          href: isAdmin ? undefined : null,
        }}
      />
    </Tabs>
  );
}
