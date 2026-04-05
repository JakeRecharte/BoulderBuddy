import { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useRouter } from 'expo-router';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAuth } from '@/context/auth';

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

export default function HomePage() {
  const [activeTab, setActiveTab] = useState('FEATURED');
  const router = useRouter();
  const { isLoggedIn } = useAuth();
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

  // Tabs
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

  // Section label
  sectionLabel: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1.2,
    marginHorizontal: 20,
    marginBottom: 12,
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
