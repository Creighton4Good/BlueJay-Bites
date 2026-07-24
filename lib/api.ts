import { Platform } from "react-native";

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

export type Photo = {
  id: number;
  event: Event;
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

const BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ??
  (Platform.OS === "android"
    ? "http://10.0.2.2:8080" // Android emulator
    : "http://localhost:8080"); // iOS simulator
// Use your local IP instead if testing on a physical device:
// const BASE_URL = "http://123.456.7.890:8080";

const POSTS_URL = `${BASE_URL}/api/posts`;
const BUILDINGS_URL = `${BASE_URL}/api/buildings`;
const FOODTYPES_URL = `${BASE_URL}/api/foodtypes`;
const DIETARY_URL = `${BASE_URL}/api/dietary-options`;
const PHOTO_URL = `${BASE_URL}/api/post-photos`
const UPLOAD_URL = `${BASE_URL}/api/uploads`

export const PROTOTYPE_CURRENT_USER_ID = Number(
  process.env.EXPO_PUBLIC_TEST_USER_ID ?? 1
);

// Fetch active food events (for home feed)
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

// Fetch all photos for an event (for retrieving multiple photos)
export async function fetchPhotosForEvent(postId: number): Promise<Photo[]> {
  const res = await fetch(`${PHOTO_URL}/post/{postId}`);
  if (!res.ok) throw new Error("Failed to fetch event photos");
  return res.json();
}

// Upload a photo for an event
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
