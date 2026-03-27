import { getUserRole } from '@/utils/global';
import { Tabs } from 'expo-router';
import React from 'react';
import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColorScheme } from '@/hooks/use-color-scheme';

/**
 * TabLayout Component
 * 
 * This component defines the bottom tab navigation bar for the app.
 * It creates 4 tabs: Home, Add, Map, and Settings.
 * The "Add" tab is only visible to users with 'admin' or 'creator' roles.
 */
export default function TabLayout() {
  const colorScheme = useColorScheme(); // Detects if user has dark/light mode preference
  const userRole = getUserRole(); // Gets the current user's role (admin, creator, or consumer)

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#FFC72C", // Active tab color
        tabBarInactiveTintColor: "rgba(255,255,255,0.7)",
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          position: 'absolute',
          bottom: 0,
          left: 16,
          right: 16,
          height: 70,
          borderRadius: 20,
          borderTopWidth: 0,
          backgroundColor: '#001F3F',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 5 },
          shadowOpacity: 0.2,
          shadowRadius: 10,
          elevation: 10,
          justifyContent: 'center',
          alignItems: 'center',
        },
      }}
    >
      {/* Home Tab - Shows list of all events */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
      />

      {/* Add Tab - Only visible to admins and creators */}
      <Tabs.Screen
        name="add"
        options={{
          title: 'Add',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="plus" color={color} />,
          href: userRole === 'admin' || userRole === 'creator' ? '/add' : null,
        }}
      />

      {/* Map Tab - Shows events on an interactive map */}
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Map',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="map.fill" color={color} />,
        }}
      />

      {/* Settings Tab - User preferences and app settings */}
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="gearshape.fill" color={color} />,
        }}
      />
    </Tabs>
  );
}
