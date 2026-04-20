import { Platform } from "react-native";

export type Event = {
  id: number;
  userId: number;
  title: string;
  location: string;
  description?: string;
  dietarySpecification?: string;
  availableFrom: string; // ISO string from backend
  availableUntil: string; // ISO string from backend
  imageUrl?: string;
  status: string;
  createdAt?: string;
  updatedAt?: string;
};

// What we send when creating a new event/post
export type NewEvent = Omit<Event, "id" | "createdAt" | "updatedAt">;

const BASE_URL = "http://192.168.1.223:8080";
/*
Platform.OS === "android"
    ? "http://10.0.2.2:8080" // Android emulator
    : "http://localhost:8080"; // iOS simulator
*/

const POSTS_URL = `${BASE_URL}/api/posts`;

export async function fetchEvents(): Promise<Event[]> {
  const res = await fetch(POSTS_URL);
  if (!res.ok) {
    const text = await res.text();
    console.error("Failed to fetch events", res.status, text);
    throw new Error("Failed to fetch events");
  }
  return res.json();
}

export async function createEvent(event: NewEvent): Promise<Event> {
  const res = await fetch(POSTS_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(event),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("Failed to create event", res.status, text);
    throw new Error("Failed to create event");
  }

  return res.json();
}