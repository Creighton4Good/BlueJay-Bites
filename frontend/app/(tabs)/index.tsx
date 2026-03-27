import React, { useState, useEffect, useRef } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Animated,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useEventContext } from '../../context/EventContext';
import { useRouter } from 'expo-router';

// Enable layout animations on Android for smooth expand/collapse animations
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

/**
 * HomeScreen Component
 * 
 * Main event listing screen that displays all food drop events in an expandable bubble format.
 * Features:
 * - Expandable event cards showing details when tapped
 * - "View on Map" button to navigate to the map screen and focus on a specific event
 * - Auto-expands events when navigating from the map (cross-screen communication)
 * - Fetches real-time event data from the backend via EventContext
 */
export default function HomeScreen() {
  const { events, selectedEventId, setSelectedEventId } = useEventContext();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const router = useRouter();

  // Ref to store animated values for each bubble
  const scaleAnims = useRef<Record<string, Animated.Value>>({}).current;

  const getScaleAnim = (id: string) => {
    if (!scaleAnims[id]) scaleAnims[id] = new Animated.Value(1);
    return scaleAnims[id];
  };

  /**
   * Handles event bubble press to expand/collapse
   * Uses LayoutAnimation for smooth height transitions
   * Also animates scaling effect
   */
  const handlePress = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    const newExpanded = expandedId === id ? null : id;
    setExpandedId(newExpanded);

    const scaleValue = getScaleAnim(id);
    Animated.spring(scaleValue, {
      toValue: newExpanded ? 1.03 : 1,
      friction: 5,
      tension: 80,
      useNativeDriver: true,
    }).start();
  };

  const handleViewOnMap = (eventId: string) => {
    router.push('/(tabs)/explore');
    if (Platform.OS === 'web') {
      localStorage.setItem('focusEventId', eventId);
    } else {
      setSelectedEventId(eventId);
    }
  };

  useEffect(() => {
    if (Platform.OS === 'web') {
      const expandEventId = localStorage.getItem('expandEventId');
      if (expandEventId) {
        setExpandedId(expandEventId);
        localStorage.removeItem('expandEventId');
      }
    } else if (selectedEventId) {
      setExpandedId(selectedEventId);
      setSelectedEventId(null);
    }
  }, [selectedEventId, setSelectedEventId]);

  return (
    <SafeAreaProvider>
      <LinearGradient colors={['#0070C0', '#003E7E']} style={styles.gradient}>
        <SafeAreaView style={styles.container}>
          <Text style={styles.header}>Jay-Drop</Text>
          <Text style={styles.subheader}>Find local food drops near you!</Text>

          <FlatList
            data={events}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            renderItem={({ item }) => {
              const expanded = expandedId === item.id;
              const scaleValue = getScaleAnim(item.id);

              return (
                <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
                  <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={() => handlePress(item.id)}
                    style={[styles.bubble, expanded && styles.bubbleExpanded]}
                  >
                    <Text style={styles.bubbleTitle}>{item.location}</Text>
                    {expanded && (
                      <View style={styles.details}>
                        <Text style={styles.detailText}>Description: {item.description}</Text>
                        <Text style={styles.detailText}>Available Servings: {item.availableQuantity}</Text>
                        {item.dietaryRestrictions?.length > 0 && (
                          <Text style={styles.detailText}>
                            Dietary Restrictions: {item.dietaryRestrictions.join(', ')}
                          </Text>
                        )}
                        {item.latitude && item.longitude && (
                          <TouchableOpacity
                            style={styles.mapButton}
                            onPress={() => handleViewOnMap(item.id)}
                          >
                            <Text style={styles.mapButtonText}>📍 View on Map</Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    )}
                  </TouchableOpacity>
                </Animated.View>
              );
            }}
            ListEmptyComponent={<Text style={styles.emptyText}>No events yet.</Text>}
          />
        </SafeAreaView>
      </LinearGradient>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 16,
  },
  list: {
    alignItems: 'center',
    paddingTop: 24,
    paddingBottom: 80,
  },
  header: {
    fontSize: 38,
    fontWeight: '800',
    textAlign: 'center',
    color: 'white',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  subheader: {
    fontSize: 16,
    color: 'white',
    opacity: 0.85,
    textAlign: 'center',
    marginBottom: 24,
  },
  bubble: {
    backgroundColor: '#FAFBFF',
    borderRadius: 22,
    width: 300,
    minHeight: 65,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 18,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#E6EAF2',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 5,
  },
  bubbleExpanded: {
    width: 340,
    minHeight: 180,
    borderRadius: 24,
    padding: 24,
    justifyContent: 'flex-start',
    alignItems: 'center',
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
  bubbleTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0054A6',
    textAlign: 'center',
  },
  details: {
    marginTop: 14,
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    fontSize: 14,
    color: '#1B6EC2',
    textAlign: 'center',
    lineHeight: 20,
  },
  mapButton: {
    backgroundColor: '#0054A6',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginTop: 16,
    shadowColor: '#0054A6',
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  mapButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: 'white',
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: 'white',
    marginTop: 40,
    textAlign: 'center',
    opacity: 0.8,
  },
});
