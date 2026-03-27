import React, { createContext, useContext, useState, useEffect } from 'react';
import { Platform } from 'react-native';

const API_URL = process.env.EXPO_PUBLIC_API_URL || (Platform.OS === 'web' ? 'http://localhost:3000/api' : 'http://localhost:3000/api');

export type Event = {
  id: string;
  description: string;
  location: string;
  availableQuantity: string;
  dietaryRestrictions: string[];
  latitude: number | null;
  longitude: number | null;
};

type EventContextType = {
  events: Event[];
  addEvent: (event: Event) => void;
  selectedEventId: string | null;
  setSelectedEventId: (id: string | null) => void;
  refreshEvents: () => void;
  loading: boolean;
};

const EventContext = createContext<EventContextType | undefined>(undefined);

export const useEventContext = () => {
  const ctx = useContext(EventContext);
  if (!ctx) throw new Error("useEventContext must be used within EventProvider");
  return ctx;
};

export const EventProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    refreshEvents();
  }, []);

  const refreshEvents = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/events`);
      const data = await response.json();
      
      // Transform API data to match Event type
      const transformedEvents: Event[] = data.map((event: any) => ({
        id: event.idEvent?.toString() || '',
        description: event.eventDescription || '',
        location: event.locationName || '',
        availableQuantity: event.availableServings?.toString() || '',
        dietaryRestrictions: event.dietaryRestrictrion ? event.dietaryRestrictrion.split(',').map((s: string) => s.trim()) : [],
        latitude: event.locationLatitude || null,
        longitude: event.locationLongitude || null,
      }));
      
      setEvents(transformedEvents);
    } catch (error) {
      console.error('Error fetching events:', error);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const addEvent = async (event: Event) => {
    try {
      // Prepare event data for API
      const eventData = {
        eventDate: new Date().toISOString().split('T')[0], // Today's date
        eventEndTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toTimeString().split(' ')[0], // 2 hours from now
        eventLocation: event.location,
        eventHost: 'Unknown', // TODO: Add user authentication
        eventDescription: event.description,
        availableServings: parseInt(event.availableQuantity) || 0,
        creatorID: 1, // TODO: Get from authenticated user
        locationID: parseInt(event.id) || null, // Using the location ID from the event
        sodexoOrderNumber: null,
        dietaryRestrictrion: event.dietaryRestrictions.join(', '),
      };

      const response = await fetch(`${API_URL}/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData),
      });

      if (!response.ok) {
        throw new Error('Failed to create event');
      }

      const result = await response.json();
      
      // Refresh events to get the new event from database
      await refreshEvents();
      
      return result;
    } catch (error) {
      console.error('Error creating event:', error);
      // Fallback: add locally if API fails
      setEvents((prev) => [event, ...prev]);
      throw error;
    }
  };

  return (
    <EventContext.Provider value={{ events, addEvent, selectedEventId, setSelectedEventId, refreshEvents, loading }}>
      {children}
    </EventContext.Provider>
  );
};