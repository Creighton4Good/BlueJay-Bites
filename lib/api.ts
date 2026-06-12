import { Platform } from "react-native";

export type EventStatus = "active" | "closed" | "deleted";

export type Event = {
  id: number;
  userId: number;
  title: string;
  location?: string;
  description?: string;
  dietarySpecification?: string;
  availableFrom?: string; // ISO string from backend
  availableUntil?: string; // ISO string from backend
  imageUrl?: string;
  status: EventStatus;
  createdAt?: string;
  updatedAt?: string;
};

// What we send when creating a new event/post
export type NewEvent = {
  userId: number;
  title: string;
  location: string;
  description?: string;
  dietarySpecification?: string;
  availableFrom: string;
  availableUntil: string;
  imageUrl?: string;
  status?: EventStatus;
};

const BASE_URL = 
  process.env.EXPO_PUBLIC_API_URL ??
  Platform.OS === "android"
    ? "http://10.0.2.2:8080" // Android emulator
    : "http://localhost:8080"; // iOS simulator

// Use your local IP instead if testing on a physical device:
// const BASE_URL = "http://123.456.7.890:8080";

const POSTS_URL = `${BASE_URL}/api/posts`;

export async function fetchEvents(): Promise<Event[]> {
  const res = await fetch(POSTS_URL);
  if (!res.ok) {
    const text = await res.text();
    console.error("Failed to fetch events", res.status, text);
    throw new Error(text || "Failed to fetch events");
  }
  return res.json();
}

export async function createEvent(event: NewEvent): Promise<Event> {
  const payload = {
    ...event,
    status: event.status ?? "active",
  };
  
  const res = await fetch(POSTS_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("Failed to create event", res.status, text);
    throw new Error(text || "Failed to create event");
  }

  return res.json();
}