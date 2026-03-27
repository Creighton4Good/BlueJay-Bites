import React, { useState, useEffect, useRef } from 'react';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useEventContext } from '../context/EventContext';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';

/**
 * MapComponent for Web Platform
 * 
 * Uses MapLibre GL with OpenStreetMap tiles to display an interactive web map.
 * Features:
 * - Shows all events with valid coordinates as markers
 * - Clickable popups showing event details
 * - "View Details" button in popup navigates to home screen and auto-expands that event
 * - Auto-focuses on specific events when navigating from "View on Map" button
 * - Centered on Creighton University campus
 * - Free and open-source (no API key required)
 */
export default function MapComponent() {
  // Reference to the map container div element
  const mapContainer = useRef<HTMLDivElement>(null);
  // Reference to the MapLibre map instance
  const map = useRef<any>(null);
  // Error state for map initialization failures
  const [mapError, setMapError] = useState<string | null>(null);
  // Get events from context
  const { events } = useEventContext();
  // Router for navigation
  const router = useRouter();

  /**
   * Map initialization effect
   * Runs once when component mounts and when events change
   */
  useEffect(() => {
    // Only initialize map on web platform (prevents SSR issues)
    if (typeof window === 'undefined') return;

    // Dynamic import to avoid SSR issues with Next.js or similar frameworks
    const initializeMap = async () => {
      try {
        const maplibregl = await import('maplibre-gl');
        
        if (map.current || !mapContainer.current) return; // Map already initialized or container not ready

        // Create the map instance with OpenStreetMap tiles
        map.current = new maplibregl.Map({
          container: mapContainer.current,
          style: {
            version: 8,
            sources: {
              'osm': {
                type: 'raster',
                tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'], // Free OSM tiles
                tileSize: 256,
                attribution: '© OpenStreetMap contributors'
              }
            },
            layers: [{
              id: 'osm',
              type: 'raster',
              source: 'osm'
            }]
          },
          center: [-95.9477, 41.2665], // Creighton University [longitude, latitude]
          zoom: 16 // Initial zoom level
        });

        // Add markers for all events with valid coordinates
        events.filter(event => event.latitude && event.longitude).forEach(event => {
          // Build dietary restrictions HTML (only if available)
          const dietaryText = event.dietaryRestrictions && event.dietaryRestrictions.length > 0 
            ? `<p style="margin: 4px 0; font-size: 12px; color: #666; font-style: italic;">Dietary: ${event.dietaryRestrictions.join(', ')}</p>`
            : '';
          
          // Create marker with red color
          new maplibregl.Marker({ color: '#FF6B6B' })
            .setLngLat([event.longitude!, event.latitude!])
            .setPopup(new maplibregl.Popup().setHTML(`
              <div style="min-width: 200px; padding: 5px;">
                <h3 style="margin: 0 0 8px 0; color: #0054A6; font-size: 16px; font-weight: bold;">${event.location}</h3>
                <p style="margin: 4px 0; font-size: 14px; color: #333;">${event.description}</p>
                <p style="margin: 4px 0; font-size: 12px; color: #666;">Available: ${event.availableQuantity} servings</p>
                ${dietaryText}
                <button onclick="window.goToEvent('${event.id}')" style="background: #0054A6; color: white; border: none; padding: 8px 12px; border-radius: 4px; cursor: pointer; margin-top: 8px; font-size: 12px; font-weight: bold; display: block; margin-left: auto; margin-right: auto;">
                  View Details
                </button>
              </div>
            `))
            .addTo(map.current);
        });

        // Add global function for navigation from popup buttons
        // Called when "View Details" button is clicked in a popup
        (window as any).goToEvent = (eventId: string) => {
          router.push('/(tabs)'); // Navigate to home screen
          // Store the event ID to auto-expand on home screen
          localStorage.setItem('expandEventId', eventId);
        };

        // Check if we need to auto-focus on a specific event (from "View on Map" button)
        const focusEventId = localStorage.getItem('focusEventId');
        if (focusEventId) {
          const focusEvent = events.find(e => e.id === focusEventId);
          if (focusEvent && focusEvent.latitude && focusEvent.longitude) {
            map.current.flyTo({
              center: [focusEvent.longitude, focusEvent.latitude],
              zoom: 18,
              duration: 1000
            });
          }
          localStorage.removeItem('focusEventId');
        }

      } catch (error) {
        console.error('Map initialization failed:', error);
        setMapError('Failed to load map');
      }
    };

    initializeMap();

    // Cleanup
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [events]); // Re-run when events change to update markers

  /**
   * Focus effect when screen becomes active
   * Checks for stored event ID and flies to that location on the map
   */
  useFocusEffect(
    React.useCallback(() => {
      if (map.current) {
        const focusEventId = localStorage.getItem('focusEventId');
        if (focusEventId) {
          const focusEvent = events.find(e => e.id === focusEventId);
          if (focusEvent && focusEvent.latitude && focusEvent.longitude) {
            // Add a small delay to ensure map is fully rendered
            setTimeout(() => {
              map.current?.flyTo({
                center: [focusEvent.longitude!, focusEvent.latitude!],
                zoom: 18,
                duration: 1000
              });
            }, 100);
          }
          localStorage.removeItem('focusEventId');
        }
      }
    }, [events])
  );

  // Show error message if map initialization failed
  if (mapError) {
    return (
      <div style={errorContainerStyle}>
        <div style={errorMessageStyle}>
          <div style={errorIconStyle}>🗺️</div>
          <div>Map temporarily unavailable</div>
          <div style={errorSubtextStyle}>Creighton University area</div>
        </div>
      </div>
    );
  }

  // Render the map container
  return (
    <div style={containerStyle}>
      {/* Map container div that MapLibre will render into */}
      <div 
        ref={mapContainer} 
        style={mapStyle}
      />
    </div>
  );
}

// Inline styles for web platform
const containerStyle: React.CSSProperties = {
  width: '100%',
  height: '100%',
  display: 'flex',
  flex: 1,
};

const mapStyle: React.CSSProperties = {
  width: '100%',
  height: '100%',
  borderRadius: '8px',
  overflow: 'hidden',
};

const errorContainerStyle: React.CSSProperties = {
  display: 'flex',
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: '#f0f0f0',
  padding: '20px',
  width: '100%',
  height: '100%',
};

const errorMessageStyle: React.CSSProperties = {
  textAlign: 'center',
  color: '#666',
};

const errorIconStyle: React.CSSProperties = {
  fontSize: '48px',
  marginBottom: '10px',
};

const errorSubtextStyle: React.CSSProperties = {
  fontSize: '14px',
  color: '#0054A6',
  marginTop: '5px',
};