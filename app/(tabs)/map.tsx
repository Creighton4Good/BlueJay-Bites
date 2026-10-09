import React from "react";
import EventMap from "@/components/EventMap";

/**
 * Map tab for viewing food events by campus location.
 * 
 * This route is intentionally lightweight. All map rendering, event loading,
 * marker grouping, and map interaction logic is handled by the shared
 * `EventMap` component in `components/EventMap.tsx`.
 * 
 * Keeping the route wrapper separate allows Expo Router to treat the map as a 
 * tab while the reusable map funtionality remains contained in its component.
 */
export default function MapScreen() {
  return <EventMap />;
}
