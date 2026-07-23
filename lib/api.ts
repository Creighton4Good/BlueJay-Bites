import { Platform } from "react-native";
import Constants from "expo-constants";

export type EventStatus = "active" | "closed";

// Lookup table types — match the backend entities
export type Building = {
  id: number;
  buildingName: string;
  latitude?: number;
  longitude?: number;
};

export type FoodType = {
  id: number;
  typeName: string;
};

export type DietaryOption = {
  id: number;
  optionName: string;
};

export type Role = {
  id: number;
  roleName: string;
  description?: string;
};

export type User = {
  id: number;
  email: string;
  displayName: string;
  role: Role;
  entraId?: string;
  authProvider: string;
  createdAt?: string;
};

// Post / Event — matches backend Post entity with @ManyToOne relationships
export type Event = {
  id: number;
  title: string;
  description: string;
  notes?: string;
  photoUrl?: string;
  building?: Building;
  directions?: string;
  roomNumber?: string;
  foodType?: FoodType;
  servingsMin?: number;
  servingsMax?: number;
  availableFrom?: string; // ISO string
  availableUntil?: string; // ISO string
  status: EventStatus;
  createdBy: User;
  createdAt?: string;
  updatedAt?: string;
};

// What we send when creating a new event
export type NewEvent = {
  title: string;
  description: string;
  notes?: string;
  photoUrl?: string;
  building?: { id: number };
  directions?: string;
  roomNumber?: string;
  foodType?: { id: number };
  servingsMin?: number;
  servingsMax?: number;
  availableFrom?: string;
  availableUntil?: string;
  createdBy: { id: number };
  status?: EventStatus;
  createdAt?: string;
  updatedAt?: string;
};

export type UpdateEvent = {
  title: string;
  description: string;
  notes?: string;
  photoUrl?: string;
  building?: { id: number };
  directions?: string;
  roomNumber?: string;
  foodType?: { id: number};
  servingsMin?: number;
  servingsMax?: number;
  availableFrom?: string;
  availableUntil?: string;
  status?: EventStatus;
  updatedAt?: string;
}

// Resolve the backend host automatically so the same code works on web,
// simulators, and physical devices without editing .env:
//   - EXPO_PUBLIC_API_URL always wins when it is set
//   - web talks to localhost
//   - a physical device reuses the LAN IP of the Expo dev server
//   - simulators fall back to their usual loopback addresses
const BACKEND_PORT = 8080;

function resolveBaseUrl(): string {
  const configured = process.env.EXPO_PUBLIC_API_URL;
  if (configured) return configured;

  if (Platform.OS === "web") return `http://localhost:${BACKEND_PORT}`;

  // hostUri looks like "192.168.86.154:8081" when served to a device.
  const hostUri =
    Constants.expoConfig?.hostUri ??
    (Constants.expoGoConfig as { debuggerHost?: string } | undefined)?.debuggerHost;

  const host = hostUri?.split(":")[0];
  if (host && host !== "localhost" && host !== "127.0.0.1") {
    return `http://${host}:${BACKEND_PORT}`;
  }

  return Platform.OS === "android"
    ? `http://10.0.2.2:${BACKEND_PORT}` // Android emulator
    : `http://localhost:${BACKEND_PORT}`; // iOS simulator
}

const BASE_URL = resolveBaseUrl();

const POSTS_URL = `${BASE_URL}/api/posts`;
const BUILDINGS_URL = `${BASE_URL}/api/buildings`;
const FOODTYPES_URL = `${BASE_URL}/api/foodtypes`;
const DIETARY_URL = `${BASE_URL}/api/dietary-options`;

export const PROTOTYPE_CURRENT_USER_ID = Number(
  process.env.EXPO_PUBLIC_TEST_USER_ID ?? 1
);

// Fetch active food events (for home feed)
// URL that starts the backend's Entra OAuth login flow.
export const ENTRA_LOGIN_URL = `${BASE_URL}/oauth2/authorization/azure`;

// Fetch the currently authenticated user. Returns null if not logged in (401).
export async function fetchCurrentUser(): Promise<User | null> {
  const res = await fetch(`${BASE_URL}/api/users/me`, { credentials: "include" });
  if (res.status === 401) {
    return null;
  }
  if (!res.ok) {
    throw new Error("Failed to fetch current user");
  }
  return res.json();
}

export async function fetchEvents(): Promise<Event[]> {
  const res = await fetch(`${POSTS_URL}/active`);
  if (!res.ok) {
    const text = await res.text();
    console.error("Failed to fetch events", res.status, text);
    throw new Error(text || "Failed to fetch events");
  }
  return res.json();
}

// Fetch events created by a specific user (their "My Events")
export async function fetchMyEvents(userId: number): Promise<Event[]> {
  const res = await fetch(`${POSTS_URL}/created?userId=${userId}`);
  if (!res.ok) {
    const text = await res.text();
    console.error("Failed to fetch my events", res.status, text);
    throw new Error(text || "Failed to fetch my events");
  }
  return res.json();
}

// Fetch a single event by ID
export async function fetchEventById(id: number): Promise<Event> {
  const res = await fetch(`${POSTS_URL}/${id}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch event ${id}`);
  }
  return res.json();
}

// Create a new event
export async function createEvent(event: NewEvent): Promise<Event> {
  const res = await fetch(`${POSTS_URL}/create`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(event),
  });
  if (!res.ok) {
    const text = await res.text();
    console.error("Create event failed", res.status, text);
    throw new Error(`Failed to create event (${res.status})${text ? `: ${text}` : ""}`);
  }
  return res.json();
}

// Update an existing event
export async function updateEvent(
  id: number,
  userId: number,
  event: UpdateEvent
): Promise<Event> {

  // TODO: Remove the userId query parameter once authentication is integrated.
  // The backend should derive the current user from the authenticated session.
  const res = await fetch(`${POSTS_URL}/${id}?userId=${userId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(event),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("Update event failed", res.status, text);
    throw new Error(
      `Failed to update event (${res.status})${text ? `: ${text}` : ""}`
    );
  }

  return res.json();
}

// Close an event
export async function closeEvent(
  id: number,
  userId: number
): Promise<void> {
  const res = await fetch(`${POSTS_URL}/${id}?userId=${userId}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("Close event failed", res.status, text);
    throw new Error(
      `Failed to close event (${res.status})${text ? `: ${text}` : ""}`
    );
  }
}

// Fetch all buildings (for create event dropdown)
export async function fetchBuildings(): Promise<Building[]> {
  const res = await fetch(`${BUILDINGS_URL}/all`);
  if (!res.ok) throw new Error("Failed to fetch buildings");
  return res.json();
}

// Fetch all food types (for create event dropdown)
export async function fetchFoodTypes(): Promise<FoodType[]> {
  const res = await fetch(`${FOODTYPES_URL}/all`);
  if (!res.ok) throw new Error("Failed to fetch food types");
  return res.json();
}

// Fetch all dietary options (for create event dropdown)
export async function fetchDietaryOptions(): Promise<DietaryOption[]> {
  const res = await fetch(`${DIETARY_URL}/all`);
  if (!res.ok) throw new Error("Failed to fetch dietary options");
  return res.json();
}
