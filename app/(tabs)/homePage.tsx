import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAuth } from '@/context/auth';
import { supabase } from '@/lib/supabase';

const TABS = ['FEATURED', 'ROUTES', 'GYMS', 'CLIMBERS'];

const FEATURED_PROBLEM = {
  title: 'CRIMPY OVERHANG',
  grade: 'V6',
  gym: 'Movement Denver',
  setter: 'Alex R.',
};

const TOP_PROBLEMS = [
  { id: '1', title: 'Sloper Traverse', grade: 'V4', gym: 'Earth Treks' },
  { id: '2', title: 'Dynamic Dyno', grade: 'V5', gym: 'Movement Denver' },
  { id: '3', title: 'Pinch Fest', grade: 'V3', gym: 'Brooklyn Boulders' },
  { id: '4', title: 'The Roof', grade: 'V7', gym: 'Mesa Rim' },
];

type Gym = {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  rating: number | null;
  has_bouldering: boolean;
  has_top_rope: boolean;
  has_lead: boolean;
  has_comp: boolean;
  distance?: number;
};

function getDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3958.8;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function openDirections(lat: number, lon: number, name: string) {
  const encoded = encodeURIComponent(name);
  const url = Platform.OS === 'ios'
    ? `maps://maps.apple.com/?daddr=${lat},${lon}&q=${encoded}`
    : `geo:${lat},${lon}?q=${lat},${lon}(${encoded})`;
  Linking.openURL(url);
}

export default function HomePage() {
  const [activeTab, setActiveTab] = useState('FEATURED');
  const [nearestGym, setNearestGym] = useState<Gym | null>(null);
  const router = useRouter();
  const { isLoggedIn } = useAuth();

  useEffect(() => {
    loadNearestGym();
  }, []);

  async function loadNearestGym() {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') return;

    const location = await Location.getCurrentPositionAsync({});
    const { latitude, longitude } = location.coords;

    const { data } = await supabase
      .from('gyms')
      .select('id, name, address, latitude, longitude, rating, has_bouldering, has_top_rope, has_lead, has_comp');

    if (!data || data.length === 0) return;

    const sorted = data
      .map(g => ({ ...g, distance: getDistance(latitude, longitude, g.latitude, g.longitude) }))
      .sort((a, b) => a.distance - b.distance);

    setNearestGym(sorted[0]);
  }

  const gymTags = nearestGym ? [
    nearestGym.has_bouldering && 'Bouldering',
    nearestGym.has_top_rope && 'Top Rope',
    nearestGym.has_lead && 'Lead',
    nearestGym.has_comp && 'Comp',
  ].filter(Boolean) as string[] : [];

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.appTitle}>Boulder Buddy</Text>
          <View style={styles.headerIcons}>
            <TouchableOpacity onPress={() => router.push(isLoggedIn ? '/(tabs)/profilePage' : '/(tabs)/loginPage?redirect=profilePage')} style={styles.iconButton}>
              <IconSymbol name="person.circle.fill" size={28} color="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push(isLoggedIn ? '/(tabs)/settingsPage' : '/(tabs)/loginPage?redirect=settingsPage')} style={styles.iconButton}>
              <IconSymbol name="gearshape.fill" size={28} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Filter Tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsContainer}
        >
          {TABS.map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.tabActive]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Nearest Gym */}
        {nearestGym && (
          <>
            <Text style={styles.sectionLabel}>NEAREST GYM</Text>
            <TouchableOpacity
              style={styles.gymCard}
              onPress={() => router.push('/(tabs)/nearbyGymPage')}
              activeOpacity={0.85}
            >
              <View style={styles.gymCardTop}>
                <View style={styles.gymCardInfo}>
                  <Text style={styles.gymCardName} numberOfLines={1}>{nearestGym.name}</Text>
                  {nearestGym.address && (
                    <Text style={styles.gymCardAddress} numberOfLines={1}>{nearestGym.address}</Text>
                  )}
                </View>
                <View style={styles.gymCardMeta}>
                  {nearestGym.rating && (
                    <Text style={styles.gymRating}>★ {nearestGym.rating.toFixed(1)}</Text>
                  )}
                  {nearestGym.distance !== undefined && (
                    <Text style={styles.gymDistance}>{nearestGym.distance.toFixed(1)} mi</Text>
                  )}
                </View>
              </View>
              <View style={styles.gymTags}>
                {gymTags.map(tag => (
                  <View key={tag} style={styles.gymTag}>
                    <Text style={styles.gymTagText}>{tag}</Text>
                  </View>
                ))}
              </View>
              <TouchableOpacity
                style={styles.directionsButton}
                onPress={() => openDirections(nearestGym.latitude, nearestGym.longitude, nearestGym.name)}
              >
                <Text style={styles.directionsText}>Get Directions</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          </>
        )}

        {/* Problem of the Day */}
        <Text style={styles.sectionLabel}>PROBLEM OF THE DAY</Text>
        <View style={styles.heroCard}>
          <View style={styles.heroImagePlaceholder} />
          <View style={styles.heroOverlay}>
            <View style={styles.heroBadge}>
              <Text style={styles.heroBadgeText}>{FEATURED_PROBLEM.grade}</Text>
            </View>
            <Text style={styles.heroTitle}>{FEATURED_PROBLEM.title}</Text>
            <Text style={styles.heroMeta}>
              {FEATURED_PROBLEM.gym}  ·  Set by {FEATURED_PROBLEM.setter}
            </Text>
          </View>
        </View>

        {/* Top Problems */}
        <Text style={styles.sectionLabel}>TOP PROBLEMS</Text>
        <View style={styles.grid}>
          {TOP_PROBLEMS.map((problem) => (
            <View key={problem.id} style={styles.gridCard}>
              <View style={styles.gridImagePlaceholder} />
              <View style={styles.gridCardBody}>
                <View style={styles.gradeBadge}>
                  <Text style={styles.gradeBadgeText}>{problem.grade}</Text>
                </View>
                <Text style={styles.gridCardTitle} numberOfLines={1}>
                  {problem.title}
                </Text>
                <Text style={styles.gridCardGym} numberOfLines={1}>
                  {problem.gym}
                </Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#0D0D0D',
  },
  container: {
    flex: 1,
    backgroundColor: '#0D0D0D',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerIcons: {
    flexDirection: 'row',
    gap: 12,
  },
  iconButton: {
    padding: 4,
  },
  appTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  tabsContainer: {
    paddingHorizontal: 20,
    gap: 8,
    marginBottom: 24,
  },
  tab: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#333333',
  },
  tabActive: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FFFFFF',
  },
  tabText: {
    color: '#888888',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  tabTextActive: {
    color: '#0D0D0D',
  },
  sectionLabel: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1.2,
    marginHorizontal: 20,
    marginBottom: 12,
  },

  // Nearest gym card
  gymCard: {
    marginHorizontal: 20,
    backgroundColor: '#1A1A1A',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#2A2A2A',
    marginBottom: 32,
  },
  gymCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  gymCardInfo: {
    flex: 1,
    paddingRight: 12,
  },
  gymCardName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 4,
  },
  gymCardAddress: {
    color: '#777777',
    fontSize: 12,
  },
  gymCardMeta: {
    alignItems: 'flex-end',
    gap: 4,
  },
  gymRating: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  gymDistance: {
    color: '#777777',
    fontSize: 12,
  },
  gymTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 14,
  },
  gymTag: {
    backgroundColor: '#2A2A2A',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  gymTagText: {
    color: '#AAAAAA',
    fontSize: 11,
    fontWeight: '700',
  },
  directionsButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  directionsText: {
    color: '#0D0D0D',
    fontSize: 13,
    fontWeight: '800',
  },

  // Hero card
  heroCard: {
    marginHorizontal: 20,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 32,
    height: 300,
  },
  heroImagePlaceholder: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#1E1E1E',
  },
  heroOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  heroBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 3,
    marginBottom: 8,
  },
  heroBadgeText: {
    color: '#0D0D0D',
    fontSize: 12,
    fontWeight: '800',
  },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 6,
    letterSpacing: 0.3,
  },
  heroMeta: {
    color: '#CCCCCC',
    fontSize: 13,
  },

  // Grid
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 8,
  },
  gridCard: {
    width: '47%',
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#1A1A1A',
  },
  gridImagePlaceholder: {
    width: '100%',
    height: 110,
    backgroundColor: '#2A2A2A',
  },
  gridCardBody: {
    padding: 10,
  },
  gradeBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#2A2A2A',
    borderRadius: 4,
    paddingHorizontal: 7,
    paddingVertical: 2,
    marginBottom: 6,
  },
  gradeBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  gridCardTitle: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 2,
  },
  gridCardGym: {
    color: '#777777',
    fontSize: 11,
  },

  bottomSpacer: {
    height: 20,
  },
});
