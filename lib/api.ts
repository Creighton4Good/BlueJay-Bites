import { Platform } from "react-native";
import Constants from "expo-constants";

/**
 * Frontend API client and shared backend data types.
 * 
 * This file is the main boundary between the React Native frontend and the
 * Spring Boot backend. It defines:
 * 
 * - TypeScript types that mirror backend entitites / request payloads
 * - backend base-URL resolution for web, simulators, and physical devices
 * - authentication/session requests
 * - event, lookup, photo, user, role, and preference API helpers
 * 
 * Keep these types and endpoint paths synchronized with the backend whenever
 * backend entitites, DTOs, or controller route change.
 */

export type EventStatus = "active" | "closed";

/*
  Lookup-table types returned by the backend.
*/
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

export type Photo = {
  id: number;
  post: Event;
  photoUrl: string;
  displayOrder: number;
  createdAt?: string;
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
  userPreference: UserPreference;
  entraId?: string;
  authProvider: string;
  createdAt?: string;
};

export type UpdateUser = {
  displayName: string;
  updatedAt?: string;
};

export type UserPreference = {
  id: number;
  notificationPreference: string;
  description?: string | null;
  updatedAt?: string;
}

/*
  Full event representation returned by the backend.

  Relationship fields contain expanded backend objects rather than only IDs.
*/
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
  dietaryOptions?: DietaryOption[];
  servingsMin?: number;
  servingsMax?: number;
  availableFrom?: string; // ISO string
  availableUntil?: string; // ISO string
  status: EventStatus;
  createdBy: User;
  createdAt?: string;
  updatedAt?: string;
};

/*
  Payload sent when creating a new event.

  Related entities are sent as ID-only objects because the backend resolves
  those IDs to the corresponding Building, FoodType, DietaryOption, and User.
*/
export type NewEvent = {
  title: string;
  description: string;
  notes?: string;
  photoUrl?: string;
  building?: { id: number };
  directions?: string;
  roomNumber?: string;
  foodType?: { id: number };
  dietaryOptions?: { id : number}[];
  servingsMin?: number;
  servingsMax?: number;
  availableFrom?: string;
  availableUntil?: string;
  createdBy: { id: number };
  status?: EventStatus;
  createdAt?: string;
  updatedAt?: string;
};

/*
  Payload sent when editing an existing event.

  Relationship fields use the same ID-only format as NewEvent.
*/
export type UpdateEvent = {
  title: string;
  description: string;
  notes?: string;
  photoUrl?: string;
  building?: { id: number };
  directions?: string;
  roomNumber?: string;
  foodType?: { id: number};
  dietaryOptions?: { id : number}[];
  servingsMin?: number;
  servingsMax?: number;
  availableFrom?: string;
  availableUntil?: string;
  status?: EventStatus;
  updatedAt?: string;
}

// Backend port used during local development.
const BACKEND_PORT = 8080;

/*
  Resolve the Spring Boot backend URL for the current runtime.

  Resolution order:
  - web always uses localhost
  - EXPO_PUBLIC_API_URL overrides native auto-detection when configured
  - physical devices reuse the LAN host running the Expo dev server
  - Android emulator falls back to 10.0.2.2
  - iOS simulator falls back to localhost

  This allows the same frontend code to run across web, simulators, and
  physical devices without manually changing the backend host each time.
*/
function resolveBaseUrl(): string {
  if (Platform.OS === "web") return `http://localhost:${BACKEND_PORT}`;

  const configured = process.env.EXPO_PUBLIC_API_URL;
  if (configured) return configured;

  /*
    Expo's host URI typically looks like "192.168.x.x:8081" when the app is
    being served to a physical device on the same local network.
  */
  const hostUri =
    Constants.expoConfig?.hostUri ??
    (Constants.expoGoConfig as { debuggerHost?: string } | undefined)?.debuggerHost;

  const host = hostUri?.split(":")[0];
  if (host && host !== "localhost" && host !== "127.0.0.1") {
    return `http://${host}:${BACKEND_PORT}`;
  }

  return Platform.OS === "android"
    ? `http://10.0.2.2:${BACKEND_PORT}`
    : `http://localhost:${BACKEND_PORT}`;
}

export const BASE_URL = resolveBaseUrl();

// Shared endpoint roots.
const POSTS_URL = `${BASE_URL}/api/posts`;
const BUILDINGS_URL = `${BASE_URL}/api/buildings`;
const FOODTYPES_URL = `${BASE_URL}/api/foodtypes`;
const DIETARY_URL = `${BASE_URL}/api/dietary-options`;
const PHOTO_URL = `${BASE_URL}/api/post-photos`
const UPLOAD_URL = `${BASE_URL}/api/uploads`
const USERS_URL = `${BASE_URL}/api/users`
const PREFERENCE_URL = `${BASE_URL}/api/user-preferences`
const ROLES_URL = `${BASE_URL}/api/roles` 

// Backend endpoint that starts the Microsoft Entra OAuth/OIDC login flow.
export const ENTRA_LOGIN_URL = `${BASE_URL}/oauth2/authorization/azure`;

/*
  Fetch the currently authenticated user.

  The backend session cookie is included with the request.
  A 401 is treated as "not signed in" and returns null rather than throwing.

  SessionContext uses this endpoint to determine the app's authentication state.
*/
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

// Fetch active food events for the main feed and map.
export async function fetchEvents(): Promise<Event[]> {
  const res = await fetch(`${POSTS_URL}/active`);
  if (!res.ok) {
    const text = await res.text();
    console.error("Failed to fetch events", res.status, text);
    throw new Error(text || "Failed to fetch events");
  }
  return res.json();
}

/*
  Fetch events created by the currently authenticated user.

  Ownership is determined by the backend session; no user ID is supplied by
  the frontend.
*/
export async function fetchMyEvents(): Promise<Event[]> {
  const res = await fetch(`${POSTS_URL}/created`, { credentials: "include" });
  if (!res.ok) {
    const text = await res.text();
    console.error("Failed to fetch my events", res.status, text);
    throw new Error(text || "Failed to fetch my events");
  }
  return res.json();
}

// Fetch one event by its backend ID
export async function fetchEventById(id: number): Promise<Event> {
  const res = await fetch(`${POSTS_URL}/${id}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch event ${id}`);
  }
  return res.json();
}

/*
  Create a new event.

  This request is authenticated through the backend session cookie.
*/
export async function createEvent(event: NewEvent): Promise<Event> {
  const res = await fetch(`${POSTS_URL}/create`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(event),
  });
  if (!res.ok) {
    const text = await res.text();
    console.error("Create event failed", res.status, text);
    throw new Error(`Failed to create event (${res.status})${text ? `: ${text}` : ""}`);
  }
  return res.json();
}

/*
  Update an existing event.

  Backend authorization determines whether the current user may edit
  the requested event.
*/
export async function updateEvent(
  id: number,
  event: UpdateEvent
): Promise<Event> {
  const res = await fetch(`${POSTS_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
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

/*
  Close an event.

  The backend uses DELETE as the close-event action. The event remains in the 
  system with a closed status rather than being removed from admin/history views.
*/
export async function closeEvent(
  id: number
): Promise<void> {
  const res = await fetch(`${POSTS_URL}/${id}`, {
    method: "DELETE",
    credentials: "include",
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("Close event failed", res.status, text);
    throw new Error(
      `Failed to close event (${res.status})${text ? `: ${text}` : ""}`
    );
  }
}

// Fetch all buildings for event forms.
export async function fetchBuildings(): Promise<Building[]> {
  const res = await fetch(`${BUILDINGS_URL}/all`);
  if (!res.ok) throw new Error("Failed to fetch buildings");
  return res.json();
}

// Fetch all food types for event forms.
export async function fetchFoodTypes(): Promise<FoodType[]> {
  const res = await fetch(`${FOODTYPES_URL}/all`);
  if (!res.ok) throw new Error("Failed to fetch food types");
  return res.json();
}

// Fetch all dietary-option tags for event forms.
export async function fetchDietaryOptions(): Promise<DietaryOption[]> {
  const res = await fetch(`${DIETARY_URL}/all`);
  if (!res.ok) throw new Error("Failed to fetch dietary options");
  return res.json();
}

// Fetch active and closed events for admin management.
export async function fetchAllEvents(): Promise<Event[]> {
  const res = await fetch(`${POSTS_URL}/all`, { credentials: "include" });

  if (!res.ok) {
    const text = await res.text();
    console.error("Failed to fetch all events", res.status, text);
    throw new Error(text || "Failed to fetch all events");
  }

  return res.json();
}


// Fetch all photos associated with an event.
export async function fetchPhotosForEvent(postId: number): Promise<Photo[]> {
  const res = await fetch(`${PHOTO_URL}/post/${postId}`);
  if (!res.ok) throw new Error("Failed to fetch event photos");
  return res.json();
}

/*
  Upload a photo for an event using multipart form data.

  Do not manually set the Content-Type header here; fetch/FormData supplies the
  multipart boundary automatically.
*/
export async function uploadPhoto(file: { uri: string; name: string; type: string }, postId: number): Promise<Photo> {
  const formData = new FormData();
  formData.append("file", file as any);
  formData.append("postId", String(postId));

  const res = await fetch(`${UPLOAD_URL}/photos`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Failed to upload photo");
  }
  return res.json();
}

// Fetch all available roles for role-management controls.
export async function fetchRoles(): Promise<Role[]> {
  const res = await fetch(`${ROLES_URL}/all`, {
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to fetch roles");
  return res.json();
}

// Fetch all users for admin role-management controls.
export async function fetchUsers(): Promise<User[]> {
  const res = await fetch(`${USERS_URL}/all`, {
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to fetch users");
  return res.json();
}

// Assign the admin role to a user.
export async function assignAdmin(id: number): Promise<User> {
const res = await fetch(`${USERS_URL}/${id}/admin`, {
  method: "PUT",
      headers: { "Content-Type": "application/json" },
  credentials: "include",
});

if (!res.ok) {
  const text = await res.text();
  console.error("Assign to admin failed", res.status, text);
  throw new Error(
      `Failed to assign the admin role (${res.status})${text ? `: ${text}` : ""}`
  );
}

return res.json();
}

// Assign the event-organizer role to a user.
export async function assignOrganizer(id: number): Promise<User> {
  const res = await fetch(`${USERS_URL}/${id}/event-organizer`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("Assign to organizer failed", res.status, text);
    throw new Error(
        `Failed to assign the organizer role (${res.status})${text ? `: ${text}` : ""}`
    );
  }

  return res.json();
}

// Assign the regular-user role to a user.
export async function assignUser(id: number): Promise<User> {
  const res = await fetch(`${USERS_URL}/${id}/user`, {
    method: "PUT",
    headers: {"Content-Type": "application/json"},
    credentials: "include",
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("Assign to user failed", res.status, text);
    throw new Error(
        `Failed to assign the user role (${res.status})${text ? `: ${text}` : ""}`
    );
  }

  return res.json();
}

// Update the currently authenticated user's editable profile information.
export async function updateUser(
    user: UpdateUser
): Promise<User> {
  const res = await fetch(`${USERS_URL}/me`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(user),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("Update user failed", res.status, text);
    throw new Error(
        `Failed to update user (${res.status})${text ? `: ${text}` : ""}`
    );
  }

  return res.json();
}

// Fetch all preference lookup values used by the settings screen.
export async function fetchUserPreferences(): Promise<UserPreference[]> {
  const res = await fetch(`${PREFERENCE_URL}/all`, {
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to fetch user preferences");
  return res.json();
}

// Turn notifications on for the currently authenticated user.
export async function updatePreferenceToOn(): Promise<UserPreference> {
  const res = await fetch(`${PREFERENCE_URL}/me/update/on`, {
    method: "PATCH",
    headers: {"Content-Type": "application/json"},
    credentials: "include",
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("Update preference failed", res.status, text);
    throw new Error(
        `Failed to update the user preference (${res.status})${text ? `: ${text}` : ""}`
    );
     }

  return res.json();
}

// Turn notifications off for the currently authenticated user.
export async function updatePreferenceToOff(): Promise<UserPreference> {
  const res = await fetch(`${PREFERENCE_URL}/me/update/off`, {
    method: "PATCH",
    headers: {"Content-Type": "application/json"},
    credentials: "include",
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("Update preference failed", res.status, text);
    throw new Error(
        `Failed to update the user preference (${res.status})${text ? `: ${text}` : ""}`
    );
  }

  return res.json();
}
}

export const LOGOUT_URL = `${BASE_URL}/api/logout`;
